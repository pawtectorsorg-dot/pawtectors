import { supabaseAdmin } from '../config/supabase.js';

export const SUPER_ADMIN_EMAIL = 'admin@pawtectors.com';
export const SUPER_ADMIN_PASSWORD = 'pawtectors123';
export const SUPER_ADMIN_ID = '00000000-0000-0000-0000-000000000001';

export async function ensureSuperAdminProfile() {
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('id, full_name, email, password, mobile_number, address, avatar_url, city, state, pincode, preferred_location, created_at, updated_at')
    .eq('email', SUPER_ADMIN_EMAIL)
    .maybeSingle();

  if (profile) {
    return profile;
  }

  const { data: inserted, error } = await supabaseAdmin
    .from('profiles')
    .upsert({
      id: SUPER_ADMIN_ID,
      full_name: 'System Administrator',
      email: SUPER_ADMIN_EMAIL,
      password: SUPER_ADMIN_PASSWORD,
      mobile_number: '9999999999',
      address: 'System Admin Office',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
      preferred_location: 'Mumbai',
      gender: 'other',
      is_active: true,
    })
    .select('id, full_name, email, password, mobile_number, address, avatar_url, city, state, pincode, preferred_location, created_at, updated_at')
    .single();

  if (error) {
    throw error;
  }

  await supabaseAdmin
    .from('user_roles')
    .upsert({ profile_id: SUPER_ADMIN_ID, role: 'admin' });

  return inserted;
}