import { useState, useEffect } from 'react';
import { authApi } from '@/lib/api';

const ADMIN_KEY = 'pawtectors_admin_session';
const ADMIN_PASSWORD = 'pawtectors123'; // In production, this would be handled by a proper auth system
const ADMIN_EMAIL = 'admin@pawtectors.com'; // Must match the configured super admin profile

export const useAdmin = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let session = sessionStorage.getItem(ADMIN_KEY);
    
    // If no active session, check for saved ADMIN login ONLY
    // Do NOT restore customer or provider sessions here
    if (!session) {
      try {
        const savedLogin = sessionStorage.getItem('pawtectors_admin_login');
        if (savedLogin) {
          const parsed = JSON.parse(savedLogin);
          // Verify this IS an admin user
          if (parsed.email && parsed.id && parsed.role === 'admin' && parsed.isAdmin) {
            console.log('[useAdmin] Restoring admin session from saved admin login');
            session = 'authenticated';
            sessionStorage.setItem(ADMIN_KEY, session);
            sessionStorage.setItem('pawtectors_auth', JSON.stringify({
              id: parsed.id,
              email: parsed.email,
              role: parsed.role,
              isAdmin: true
            }));
            
            // Restore system admin flags if it was a system admin
            if (parsed.type === 'system') {
              sessionStorage.setItem('adminType', 'system');
              sessionStorage.setItem('adminEmail', parsed.email);
            }
          } else {
            console.log('[useAdmin] Saved login is not an admin user, skipping restoration');
          }
        }
      } catch (err) {
        console.error('[useAdmin] Error parsing saved admin login:', err);
      }
    }
    
    const isAuthenticated = session === 'authenticated';
    
    if (isAuthenticated) {
      // Ensure pawtectors_auth is set for API authentication
      const authData = sessionStorage.getItem('pawtectors_auth');
      if (!authData) {
        // Session exists but auth data missing - try to restore it
        console.log('[useAdmin] Session exists but auth data missing, attempting to restore...');
        restoreAdminAuth();
      }
    }
    
    setIsAdmin(isAuthenticated);
    setIsLoading(false);
  }, []);

  const restoreAdminAuth = async () => {
    try {
      const userData = await authApi.getProfileByEmail(ADMIN_EMAIL);
      if (userData && userData.role === 'admin') {
        sessionStorage.setItem('pawtectors_auth', JSON.stringify({
          id: userData.id,
          email: userData.email,
          role: userData.role,
          isAdmin: true
        }));
        console.log('[useAdmin] Restored admin auth data for:', userData.email);
      }
    } catch (err) {
      console.error('[useAdmin] Failed to restore admin auth:', err);
    }
  };

  const login = async (password: string): Promise<boolean> => {
    if (password === ADMIN_PASSWORD) {
      try {
        // Fetch user data from backend
        console.log('[useAdmin] Fetching admin user data from database...');
        const userData = await authApi.getProfileByEmail(ADMIN_EMAIL);
        
        if (!userData) {
          console.error('[useAdmin] Admin user not found in database');
          return false;
        }

        if (userData.role !== 'admin') {
          console.error('[useAdmin] User exists but is not an admin. Role:', userData.role);
          return false;
        }

        // Set admin session
        sessionStorage.setItem(ADMIN_KEY, 'authenticated');
        
        // Set admin credentials for API authentication (active session)
        const authData = {
          id: userData.id,
          email: userData.email,
          role: userData.role,
          isAdmin: true
        };
        sessionStorage.setItem('pawtectors_auth', JSON.stringify(authData));
        
        // Save persistent admin login details with type='admin' (not system)
        sessionStorage.setItem('pawtectors_admin_login', JSON.stringify({
          ...authData,
          type: 'admin',
          savedAt: new Date().toISOString()
        }));
        
        console.log('[useAdmin] Admin login successful:', {
          id: userData.id,
          email: userData.email,
          role: userData.role
        });
        
        setIsAdmin(true);
        return true;
      } catch (error) {
        console.error('[useAdmin] Login error:', error);
        return false;
      }
    }
    return false;
  };

  const logout = () => {
    // Clear admin session and saved login details
    sessionStorage.removeItem(ADMIN_KEY);
    sessionStorage.removeItem('pawtectors_auth');
    sessionStorage.removeItem('pawtectors_admin_login');
    
    // Clear any other auth-related data
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('profile');
    sessionStorage.removeItem('role');
    
    setIsAdmin(false);
    
    // Redirect to admin login page
    window.location.href = '/admin';
  };

  return { isAdmin, isLoading, login, logout };
};
