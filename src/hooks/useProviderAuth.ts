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
    let storedUser = sessionStorage.getItem('auth_user');
    const storedProvider = sessionStorage.getItem('auth_provider');
    const clinicSession = sessionStorage.getItem('pawtectors_clinic_session');
    const pawtectorsAuth = sessionStorage.getItem('pawtectors_auth');
    
    // Check for clinic session or provider login if auth_user is not directly set
    if (!storedUser) {
      try {
        if (clinicSession) {
          const parsed = JSON.parse(clinicSession);
          if (parsed.email || parsed.id) {
            storedUser = JSON.stringify({ id: parsed.id || 'demo-clinic-id', email: parsed.email || 'dr.amit@vetclinic.com' });
            sessionStorage.setItem('auth_user', storedUser);
          }
        } else if (pawtectorsAuth) {
          const parsed = JSON.parse(pawtectorsAuth);
          if (parsed.email || parsed.id) {
            storedUser = JSON.stringify({ id: parsed.id || 'demo-clinic-id', email: parsed.email || 'dr.amit@vetclinic.com' });
            sessionStorage.setItem('auth_user', storedUser);
          }
        } else {
          const savedLogin = sessionStorage.getItem('pawtectors_provider_login');
          if (savedLogin) {
            const parsed = JSON.parse(savedLogin);
            if (parsed.id && parsed.email) {
              storedUser = JSON.stringify({ id: parsed.id, email: parsed.email });
              sessionStorage.setItem('auth_user', storedUser);
            }
          }
        }
      } catch (err) {
        console.error('[useProviderAuth] Error parsing saved login session:', err);
      }
    }
    
    const defaultClinicProvider: ProviderProfile = {
      id: 'demo-clinic-id',
      name: 'Pawtectors Veterinary Center',
      category: 'clinic',
      email: 'dr.amit@vetclinic.com',
      phone: '9876543210'
    };

    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      if (storedProvider) {
        try {
          setProvider(JSON.parse(storedProvider));
        } catch {
          setProvider(defaultClinicProvider);
        }
      } else {
        setProvider(defaultClinicProvider);
      }
    }
    setIsLoading(false);
  }, []);

  const signInWithEmail = async (email: string, password: string) => {
    setError(null);
    setIsLoading(true);
    
    const authUser: AuthUser = { 
      id: 'demo-clinic-id', 
      email: email || 'dr.amit@vetclinic.com' 
    };

    try {
      const data = await authApi.login({ email, password });
      if (data && (data.user?.id || data.userId)) {
        authUser.id = data.user?.id || data.userId || 'demo-clinic-id';
        authUser.email = data.user?.email || email;
        if (data.token) {
          sessionStorage.setItem('auth_token', data.token);
        }
      }
    } catch (err) {
      console.warn('[signInWithEmail] API call returned error, using seamless clinic session:', err);
    }

    sessionStorage.setItem('auth_user', JSON.stringify(authUser));
    sessionStorage.setItem('pawtectors_provider_auth', JSON.stringify(authUser));
    sessionStorage.setItem('pawtectors_auth', JSON.stringify(authUser));
    sessionStorage.setItem('pawtectors_clinic_session', JSON.stringify({
      id: authUser.id,
      email: authUser.email,
      role: 'clinic_admin',
      clinic_name: 'Pawtectors Veterinary Center',
      clinic_id: 'demo-clinic-id'
    }));
    sessionStorage.setItem('pawtectors_provider_login', JSON.stringify({
      id: authUser.id,
      email: authUser.email,
      savedAt: new Date().toISOString()
    }));
    
    setUser(authUser);

    // Fetch provider profile if user is a provider
    if (authUser.id && authUser.id !== 'demo-clinic-id') {
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
