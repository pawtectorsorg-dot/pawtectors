-- ============================================================================
-- SETUP ADMIN USER FOR PAWTECTORS
-- Date: February 11, 2026
-- Description: Create or update admin user with admin@pawtectors.com
-- ============================================================================

-- Delete existing admin user if exists (to avoid conflicts)
DELETE FROM public.user_roles WHERE profile_id IN (
  SELECT id FROM public.profiles WHERE email = 'admin@pawtectors.com'
);
DELETE FROM public.profiles WHERE email = 'admin@pawtectors.com';

-- Insert admin profile with a valid UUID
INSERT INTO public.profiles (
  id,
  full_name, 
  email, 
  password, 
  mobile_number, 
  address, 
  city, 
  state, 
  pincode, 
  preferred_location, 
  gender, 
  is_active
) VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,
  'System Administrator',
  'admin@pawtectors.com',
  'pawtectors123',
  '9999999999',
  'System Admin Office',
  'Mumbai',
  'Maharashtra',
  '400001',
  'Mumbai',
  'other',
  true
);

-- Assign admin role
INSERT INTO public.user_roles (profile_id, role) 
VALUES ('00000000-0000-0000-0000-000000000001'::uuid, 'admin');

-- Verify the admin user was created
SELECT 
  p.id,
  p.full_name,
  p.email,
  ur.role
FROM public.profiles p
LEFT JOIN public.user_roles ur ON p.id = ur.profile_id
WHERE p.email = 'admin@pawtectors.com';
