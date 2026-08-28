import { createContext, useState, useEffect, ReactNode } from 'react';

/**
 * Profile shape returned by the backend (matches the `profiles` table minus password).
 */
export interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  mobile_number: string | null;
  address: string | null;
  avatar_url: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  preferred_location: string | null;
  created_at: string;
  updated_at: string;
  /** Alias so existing UI code that reads `profile.email_address` still works. */
  email_address?: string | null;
}

/** Fields the UI is allowed to send when updating a profile. */
type ProfileUpdatePayload = Partial<
  Pick<Profile, 'full_name' | 'mobile_number' | 'address' | 'city' | 'state' | 'pincode' | 'preferred_location'>
> & {
  email_address?: string | null;
  pet_name?: string | null;
  pet_type?: string | null;
  pet_breed?: string | null;
  pet_age?: string | null;
  vaccination_date?: string | null;
  medical_records?: string | null;
};

interface AuthContextType {
  user: Profile | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, userData: ProfileUpdatePayload) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  updateProfile: (userData: ProfileUpdatePayload) => Promise<{ error: Error | null }>;
}

const AUTH_STORAGE_KEY = 'pawtectors_auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export { AuthContext };

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Normalise a backend profile so both `email` and `email_address` are present. */
function normaliseProfile(p: Record<string, unknown>): Profile {
  const email = (p.email ?? p.email_address ?? null) as string | null;
  return { ...p, email, email_address: email } as Profile;
}

/** Read stored user from sessionStorage. */
function storedUser(): { email: string; id: string } | null {
  try {
    const raw = sessionStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed.id && parsed.email) return parsed;
    return null;
  } catch {
    return null;
  }
}

/** Build X-User-Id / X-User-Email headers for a specific user. */
function userHeaders(id: string, email: string): Record<string, string> {
  return { 'X-User-Id': id, 'X-User-Email': email };
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<Profile | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Load saved user on mount
  useEffect(() => { loadSavedUser(); }, []);

  const loadSavedUser = async () => {
    try {
      // First check active session
      let saved = storedUser();
      
      // If no active session, check for saved CUSTOMER login details ONLY
      // Do NOT restore admin or provider sessions here
      if (!saved) {
        try {
          const loginDetails = sessionStorage.getItem('pawtectors_login_details');
          if (loginDetails) {
            const parsed = JSON.parse(loginDetails);
            // Verify this is NOT an admin user
            if (parsed.id && parsed.email && parsed.role !== 'admin' && !parsed.isAdmin) {
              console.log('[AuthContext] Restoring customer session from saved login details');
              saved = { id: parsed.id, email: parsed.email };
              // Restore to active session storage
              sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(saved));
            } else {
              console.log('[AuthContext] Skipping admin user restoration in customer context');
            }
          }
        } catch (err) {
          console.error('[AuthContext] Error parsing login details:', err);
        }
      }
      
      if (!saved) { setLoading(false); return; }

      // Re-fetch full profile from backend
      const res = await fetch('/auth/me', { headers: userHeaders(saved.id, saved.email) });

      if (res.ok) {
        const body = await res.json();
        const p = normaliseProfile(body.user);
        setUser(p);
        setProfile(p);
      } else {
        sessionStorage.removeItem(AUTH_STORAGE_KEY);
        sessionStorage.removeItem('pawtectors_login_details');
      }
    } catch (error) {
      console.error('Error loading saved user:', error);
      sessionStorage.removeItem(AUTH_STORAGE_KEY);
      sessionStorage.removeItem('pawtectors_login_details');
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      if (!email?.trim()) return { error: new Error('Email address is required') };
      if (!password?.trim()) return { error: new Error('Password is required') };

      const trimmedEmail = email.trim().toLowerCase();

      const res = await fetch('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmedEmail, password }),
      });

      const body = await res.json();
      if (!res.ok) return { error: new Error(body.error || 'Login failed') };

      const p = normaliseProfile(body.user);
      
      // Check if user is an admin - admins should NOT login through customer portal
      if (body.user.role === 'admin' || p.email?.includes('admin@')) {
        console.warn('[AuthContext] Admin user attempted customer login:', p.email);
        return { error: new Error('User not found. Please use the admin portal to login.') };
      }
      
      setUser(p);
      setProfile(p);
      
      // Store in both active session and persistent login details
      const authData = { email: trimmedEmail, id: p.id, role: body.user.role };
      sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
      sessionStorage.setItem('pawtectors_login_details', JSON.stringify({
        ...authData,
        savedAt: new Date().toISOString()
      }));

      console.log('Sign in successful for:', trimmedEmail);
      return { error: null };
    } catch (error) {
      console.error('Sign in error:', error);
      return { error: new Error(error instanceof Error ? error.message : 'An unexpected error occurred.') };
    }
  };

  const signUp = async (email: string, password: string, userData: ProfileUpdatePayload) => {
    try {
      if (!email?.trim()) return { error: new Error('Email address is required') };
      if (!password?.trim()) return { error: new Error('Password is required') };
      if (password.length < 6) return { error: new Error('Password must be at least 6 characters long') };
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        return { error: new Error('Please enter a valid email address') };
      }

      const trimmedEmail = email.trim().toLowerCase();
      
      // Prevent admin emails from signing up through customer portal
      if (trimmedEmail.includes('admin@')) {
        return { error: new Error('This email is reserved for administrators. Please use a different email or contact support.') };
      }

      const res = await fetch('/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: trimmedEmail,
          password,
          full_name: userData.full_name,
          mobile_number: userData.mobile_number,
          address: userData.address,
          city: userData.city,
          state: userData.state,
          pincode: userData.pincode,
          preferred_location: userData.preferred_location,
          pet_name: userData.pet_name,
          pet_type: userData.pet_type,
          pet_breed: userData.pet_breed,
          pet_age: userData.pet_age,
          vaccination_date: userData.vaccination_date,
          medical_records: userData.medical_records,
        }),
      });

      const body = await res.json();
      if (!res.ok) return { error: new Error(body.error || 'Signup failed') };

      const p = normaliseProfile(body.user);
      
      // Double-check user is not an admin (in case backend didn't catch it)
      if (body.user.role === 'admin') {
        console.warn('[AuthContext] Admin user attempted customer signup:', p.email);
        return { error: new Error('This email is reserved for administrators. Please use a different email.') };
      }
      
      setUser(p);
      setProfile(p);
      
      // Store in both active session and persistent login details
      const authData = { email: trimmedEmail, id: p.id, role: body.user.role };
      sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
      sessionStorage.setItem('pawtectors_login_details', JSON.stringify({
        ...authData,
        savedAt: new Date().toISOString()
      }));

      console.log('Signup successful for:', trimmedEmail);
      return { error: null };
    } catch (error) {
      console.error('Signup error:', error);
      return { error: new Error(error instanceof Error ? error.message : 'An unexpected error occurred.') };
    }
  };

  const signOut = async () => {
    fetch('/auth/logout', { method: 'POST' }).catch(() => {});
    
    // Clear all authentication data including persistent login details
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
    sessionStorage.removeItem('pawtectors_login_details');
    sessionStorage.removeItem('pawtectors_admin_session');
    sessionStorage.removeItem('pawtectors_admin_login');
    sessionStorage.removeItem('pawtectors_provider_auth');
    sessionStorage.removeItem('pawtectors_provider_login');
    sessionStorage.removeItem('auth_token');
    sessionStorage.removeItem('auth_user');
    sessionStorage.removeItem('auth_provider');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('profile');
    sessionStorage.removeItem('role');
    sessionStorage.removeItem('adminType');
    sessionStorage.removeItem('adminEmail');
    
    setUser(null);
    setProfile(null);
    
    // Redirect to homepage
    window.location.href = '/';
  };

  const updateProfile = async (userData: ProfileUpdatePayload) => {
    try {
      if (!profile?.id) return { error: new Error('No authenticated user') };
      const saved = storedUser();
      if (!saved) return { error: new Error('Not logged in') };

      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...userHeaders(saved.id, saved.email),
        },
        body: JSON.stringify({
          full_name: userData.full_name,
          email: userData.email_address,
          mobile_number: userData.mobile_number,
          address: userData.address,
          city: userData.city,
          state: userData.state,
          pincode: userData.pincode,
          preferred_location: userData.preferred_location,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        return { error: new Error(body.error || 'Profile update failed') };
      }

      const body = await res.json();
      const p = normaliseProfile(body);
      setProfile(p);
      setUser(p);

      // Update stored email if it changed
      if (userData.email_address) {
        sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ email: userData.email_address, id: saved.id }));
      }

      return { error: null };
    } catch (error) {
      console.error('Error updating profile:', error);
      return { error: error as Error };
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signUp, signOut, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};