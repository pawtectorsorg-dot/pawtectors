-- ============================================================================
-- DEBUG: Check Admin User Status
-- This script helps verify if the admin user is properly set up
-- ============================================================================

-- 1. Check if admin profile exists
SELECT 
  '1. Admin Profile Check' as check_name,
  CASE 
    WHEN COUNT(*) > 0 THEN '✓ PASS - Admin profile exists'
    ELSE '✗ FAIL - Admin profile NOT found'
  END as status,
  COUNT(*) as count
FROM public.profiles 
WHERE id = '00000000-0000-0000-0000-000000000001'::uuid;

-- 2. Check admin profile details
SELECT 
  '2. Admin Profile Details' as check_name,
  id,
  full_name,
  email,
  is_active
FROM public.profiles 
WHERE id = '00000000-0000-0000-0000-000000000001'::uuid;

-- 3. Check if admin role exists
SELECT 
  '3. Admin Role Check' as check_name,
  CASE 
    WHEN COUNT(*) > 0 THEN '✓ PASS - Admin role exists'
    ELSE '✗ FAIL - Admin role NOT found'
  END as status,
  COUNT(*) as count
FROM public.user_roles 
WHERE profile_id = '00000000-0000-0000-0000-000000000001'::uuid 
  AND role = 'admin';

-- 4. Show admin user with role
SELECT 
  '4. Admin User with Role' as check_name,
  p.id,
  p.full_name,
  p.email,
  ur.role,
  p.is_active
FROM public.profiles p
LEFT JOIN public.user_roles ur ON p.id = ur.profile_id
WHERE p.id = '00000000-0000-0000-0000-000000000001'::uuid;

-- 5. Check all users with admin role
SELECT 
  '5. All Admin Users' as check_name,
  p.id,
  p.full_name,
  p.email,
  ur.role
FROM public.profiles p
INNER JOIN public.user_roles ur ON p.id = ur.profile_id
WHERE ur.role = 'admin';

-- 6. Summary of all roles
SELECT 
  '6. Role Summary' as check_name,
  role,
  COUNT(*) as count
FROM public.user_roles
GROUP BY role
ORDER BY role;

-- ============================================================================
-- INSTRUCTIONS:
-- ============================================================================
-- 
-- 1. Run this entire script in Supabase SQL Editor
-- 2. Check the results:
--    - Check 1 should show: ✓ PASS - Admin profile exists
--    - Check 3 should show: ✓ PASS - Admin role exists
--    - Check 4 should show the admin user with role='admin'
-- 
-- 3. If any checks FAIL:
--    - Run the setup_admin_user.sql script
--    - Run this debug script again to verify
-- 
-- 4. Expected admin credentials:
--    - ID: 00000000-0000-0000-0000-000000000001
--    - Email: admin@system.com
--    - Role: admin
-- 
-- ============================================================================
