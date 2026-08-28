import { useState, useEffect } from 'react';
import { authApi, providersApi, type ProviderRow } from '@/lib/api';

export type ServiceCategory = 'clinic' | 'grooming' | 'boarding' | 'training';

interface ProviderProfile {
  id: string;
  name: string;
  category: ServiceCategory;
  email: string | null;
  phone: string | null;
}

interface AuthUser {
  id: string;
  email?: string;
}

export const useProviderAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [provider, setProvider] = useState<ProviderProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check for stored session
    const token = sessionStorage.getItem('auth_token');
    let storedUser = sessionStorage.getItem('auth_user');
    const storedProvider = sessionStorage.getItem('auth_provider');
    
    // If no active session, check for saved PROVIDER login ONLY
    // Do NOT restore customer or admin sessions here
    if (!token && !storedUser) {
      try {
        const savedLogin = sessionStorage.getItem('pawtectors_provider_login');
        if (savedLogin) {
          const parsed = JSON.parse(savedLogin);
          // Verify this is a provider (has id and email but NOT admin role)
          if (parsed.id && parsed.email && !parsed.isAdmin && parsed.role !== 'admin') {
            console.log('[useProviderAuth] Restoring provider session from saved login');
            storedUser = JSON.stringify({ id: parsed.id, email: parsed.email });
            sessionStorage.setItem('auth_user', storedUser);
            sessionStorage.setItem('pawtectors_provider_auth', storedUser);
            sessionStorage.setItem('pawtectors_auth', storedUser);
          } else {
            console.log('[useProviderAuth] Saved login is not a provider user, skipping restoration');
          }
        }
      } catch (err) {
        console.error('[useProviderAuth] Error parsing saved provider login:', err);
      }
    }
    
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
      if (storedProvider) {
        setProvider(JSON.parse(storedProvider));
      }
    }
    setIsLoading(false);
  }, []);

  const signInWithEmail = async (email: string, password: string) => {
    setError(null);
    setIsLoading(true);
    
    try {
      const data = await authApi.login({ email, password });
      
      if (data.token) {
        sessionStorage.setItem('auth_token', data.token);
      }
      
      const authUser: AuthUser = { 
        id: data.user?.id || data.userId || '', 
        email: data.user?.email || email 
      };
      sessionStorage.setItem('auth_user', JSON.stringify(authUser));
      sessionStorage.setItem('pawtectors_provider_auth', JSON.stringify(authUser));
      sessionStorage.setItem('pawtectors_auth', JSON.stringify(authUser));
      // Save persistent provider login details
      sessionStorage.setItem('pawtectors_provider_login', JSON.stringify({
        id: authUser.id,
        email: authUser.email,
        savedAt: new Date().toISOString()
      }));
      
      setUser(authUser);

      // Fetch provider profile if user is a provider
      if (authUser.id) {
        try {
          const providers = await providersApi.getAll();
          const myProvider = providers.find((p: ProviderRow) => p.user_id === authUser.id);
          if (myProvider) {
            const validCategories: readonly ServiceCategory[] = ['clinic', 'grooming', 'boarding', 'training'] as const;
            const category: ServiceCategory = (validCategories as readonly string[]).includes(myProvider.category)
              ? (myProvider.category as ServiceCategory)
              : 'clinic';
            const profile: ProviderProfile = {
              id: myProvider.id,
              name: myProvider.name,
              category,
              email: myProvider.email ?? null,
              phone: myProvider.phone ?? null,
            };
            setProvider(profile);
            sessionStorage.setItem('auth_provider', JSON.stringify(profile));
          }
        } catch (err) {
          console.error('Failed to fetch provider profile:', err);
        }
      }

      setIsLoading(false);
      return { success: true, user: authUser };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed';
      setError(msg);
      setIsLoading(false);
      return { success: false, error: msg };
    }
  };

  const signInWithOTP = async (phone: string) => {
    setError(null);
    // OTP not supported through backend auth yet
    setError('OTP login is not available through the backend API');
    return { success: false, error: 'OTP login not supported' };
  };

  const verifyOTP = async (phone: string, token: string) => {
    setError(null);
    setError('OTP verification is not available through the backend API');
    return { success: false, error: 'OTP verification not supported' };
  };

  const signOut = async () => {
    try {
      await authApi.logout();
    } catch (err) {
      console.error('Logout error:', err);
    }
    
    // Clear provider auth data including saved login details
    sessionStorage.removeItem('auth_token');
    sessionStorage.removeItem('auth_user');
    sessionStorage.removeItem('auth_provider');
    sessionStorage.removeItem('pawtectors_provider_auth');
    sessionStorage.removeItem('pawtectors_provider_login');
    
    // Clear all auth-related data
    sessionStorage.removeItem('pawtectors_auth');
    sessionStorage.removeItem('pawtectors_admin_session');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('profile');
    sessionStorage.removeItem('role');
    
    setUser(null);
    setProvider(null);
    
    // Redirect to homepage
    window.location.href = '/';
  };

  return {
    user,
    provider,
    isLoading,
    error,
    signInWithEmail,
    signInWithOTP,
    verifyOTP,
    signOut,
  };
};
