import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../config/supabase.js';

export interface User {
  id: string;
  email: string;
  role?: string;
  isAdmin?: boolean;
  /** For provider-role users: the service_provider.id they own */
  clinicId?: string;
}

export interface AuthRequest extends Request {
  user?: User;
}

export type AuthenticatedRequest = AuthRequest;

// ---------------------------------------------------------------------------
// Shared helper: read user identity from X-User-Id / X-User-Email headers,
// query user_roles to determine role, and resolve clinicId for providers.
// ---------------------------------------------------------------------------
async function attachUser(req: AuthRequest): Promise<void> {
  const userId = req.headers['x-user-id'] as string | undefined;
  const userEmail = req.headers['x-user-email'] as string | undefined;

  if (!userId) {
    return;
  }

  try {
    // Query user_roles table to get user's role
    const { data: roles, error: rolesError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('profile_id', userId)
      .limit(1);

    if (rolesError) {
      console.error('[auth] Error fetching user role:', rolesError.message);
    }

    const userRole = roles && roles.length > 0 ? roles[0].role : 'customer';
    const isAdmin = userRole === 'admin';

    let clinicId: string | undefined;

    // For providers, resolve their clinic (service_provider) id
    if (userRole === 'provider') {
      const { data: providerData } = await supabaseAdmin
        .from('service_providers')
        .select('id')
        .eq('user_id', userId)
        .limit(1)
        .single();

      if (providerData) {
        clinicId = providerData.id;
      }
    }

    req.user = {
      id: userId,
      email: userEmail || '',
      role: userRole,
      isAdmin,
      clinicId,
    };
  } catch (err) {
    console.error('[auth] Exception during auth:', err);
    // Fallback: minimal user object
    req.user = { id: userId, email: userEmail || '', role: 'customer', isAdmin: false };
  }
}

/**
 * Header-based auth — reads X-User-Id / X-User-Email, queries user_roles.
 */
export const authenticateToken = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  await attachUser(req);
  next();
};

export const optionalAuth = authenticateToken;
export const demoAuth = authenticateToken;

/**
 * Role guard — verifies the authenticated user's role is included in the allowed list.
 */
export const demoRole = (_roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    if (
      _roles.length > 0 &&
      !(_roles.includes(req.user.role || '') || (req.user.isAdmin && _roles.includes('admin')))
    ) {
      res.status(403).json({ error: 'Forbidden: insufficient permissions' });
      return;
    }

    next();
  };
};

export const requireRole = demoRole;
