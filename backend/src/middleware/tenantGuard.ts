import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.js';

/**
 * Tenant Guard Middleware
 *
 * Ensures that a provider-role user can only access data belonging to their own clinic.
 * Use this on any route where :providerId or :clinicId is a path param, or where
 * provider_id is expected in the request body.
 *
 * The `clinicId` is resolved during authentication (auth.ts) and attached to `req.user`.
 *
 * Usage:
 *   router.get('/clinics/:id/appointments', demoAuth, tenantGuard('params.id'), handler)
 *   router.post('/medical-records', demoAuth, tenantGuard('body.provider_id'), handler)
 */
export const tenantGuard =
  (source: 'params.id' | 'body.provider_id' | 'query.provider_id' | 'body.clinicId') =>
  (req: AuthRequest, res: Response, next: NextFunction): void => {
    // Admins bypass tenant checks — they see everything
    if (req.user?.isAdmin) {
      next();
      return;
    }

    // Only enforce for providers
    if (req.user?.role !== 'provider') {
      next();
      return;
    }

    // If provider but no clinicId resolved, deny
    if (!req.user?.clinicId) {
      res.status(403).json({ error: 'Clinic not found for this provider account' });
      return;
    }

    // Extract the target clinic ID from the specified source
    let targetId: string | undefined;
    if (source === 'params.id') {
      targetId = req.params.id;
    } else if (source === 'body.provider_id') {
      targetId = req.body?.provider_id;
    } else if (source === 'query.provider_id') {
      targetId = req.query?.provider_id as string | undefined;
    } else if (source === 'body.clinicId') {
      targetId = req.body?.clinicId;
    }

    // If no target ID found, let the route handler deal with it
    if (!targetId) {
      next();
      return;
    }

    if (targetId !== req.user.clinicId) {
      res.status(403).json({
        error: 'Access denied: you can only access your own clinic\'s data',
      });
      return;
    }

    next();
  };

/**
 * Injects the authenticated provider's clinicId into the request body
 * so controllers don't have to pull it from params.
 * Useful for POST routes where the frontend may not know the clinic ID.
 */
export const injectClinicId = (req: AuthRequest, _res: Response, next: NextFunction): void => {
  if (req.user?.role === 'provider' && req.user.clinicId) {
    if (!req.body) req.body = {};
    // Only inject if not already set
    if (!req.body.provider_id) {
      req.body.provider_id = req.user.clinicId;
    }
  }
  next();
};
