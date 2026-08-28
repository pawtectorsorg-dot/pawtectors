-- ============================================================================
-- SAMPLE DATA FOR USER PROFILES
-- Date: February 9, 2026
-- Description: Sample user data for testing the profiles table
-- Note: This temporarily disables foreign key constraints for sample data
-- ============================================================================

BEGIN;

-- Insert sample user profiles
INSERT INTO public.profiles (
  full_name,
  email,
  email_address,
  password,
  phone,
  mobile_number,
  address,
  city,
  state,
  preferred_location,
  created_at,
  updated_at
) VALUES
-- Sample User 1 - Mumbai
(
  'Rahul Sharma',
  'rahul.sharma@email.com',
  'rahul.sharma@email.com',
  'password123',
  '9876543210',
  '9876543210',
  '301, Sunshine Apartments, Linking Road, Bandra West',
  'Mumbai',
  'Maharashtra',
  'Mumbai',
  now(),
  now()
),

-- Sample User 2 - Delhi
(
  'Priya Patel',
  'priya.patel@email.com',
  'priya.patel@email.com',
  'password123',
  '9876543211',
  '9876543211',
  'B-45, Greater Kailash Part 2, Near Market',
  'New Delhi',
  'Delhi',
  'New Delhi',
  now(),
  now()
),

-- Sample User 3 - Bangalore
(
  'Arjun Kumar',
  'arjun.kumar@email.com',
  'arjun.kumar@email.com',
  'password123',
  '9876543212',
  '9876543212',
  '502, Brigade Millennium, JP Nagar Phase 3',
  'Bangalore',
  'Karnataka',
  'Bangalore',
  now(),
  now()
),

-- Sample User 4 - Chennai
(
  'Meera Reddy',
  'meera.reddy@email.com',
  'meera.reddy@email.com',
  'password123',
  '9876543213',
  '9876543213',
  '12A, Anna Nagar East, Near Shanti Colony',
  'Chennai',
  'Tamil Nadu',
  'Chennai',
  now(),
  now()
),

-- Sample User 5 - Pune
(
  'Vikram Singh',
  'vikram.singh@email.com',
  'vikram.singh@email.com',
  'password123',
  '9876543214',
  '9876543214',
  '201, Koregaon Park, Lane 7, Near Osho Ashram',
  'Pune',
  'Maharashtra',
  'Pune',
  now(),
  now()
),

-- Sample User 6 - Hyderabad
(
  'Lakshmi Nair',
  'lakshmi.nair@email.com',
  'lakshmi.nair@email.com',
  'password123',
  '9876543215',
  '9876543215',
  'Villa 15, Jubilee Hills, Road No. 36',
  'Hyderabad',
  'Telangana',
  'Hyderabad',
  now(),
  now()
),

-- Sample User 7 - Kolkata
(
  'Sourav Das',
  'sourav.das@email.com',
  'sourav.das@email.com',
  'password123',
  '9876543216',
  '9876543216',
  '45, Park Street, Near Allen Park',
  'Kolkata',
  'West Bengal',
  'Kolkata',
  now(),
  now()
),

-- Sample User 8 - Ahmedabad
(
  'Kavya Desai',
  'kavya.desai@email.com',
  'kavya.desai@email.com',
  'password123',
  '9876543217',
  '9876543217',
  '3rd Floor, Satellite Road, Prahladnagar',
  'Ahmedabad',
  'Gujarat',
  'Ahmedabad',
  now(),
  now()
),

-- Sample User 9 - Jaipur
(
  'Ravi Gupta',
  'ravi.gupta@email.com',
  'ravi.gupta@email.com',
  'password123',
  '9876543218',
  '9876543218',
  'House 45, C-Scheme, Near Rajmandir Cinema',
  'Jaipur',
  'Rajasthan',
  'Jaipur',
  now(),
  now()
),

-- Sample User 10 - Kochi
(
  'Anjali Thomas',
  'anjali.thomas@email.com',
  'anjali.thomas@email.com',
  'password123',
  '9876543219',
  '9876543219',
  'Flat 2B, Marine Drive, Near Subhash Park',
  'Kochi',
  'Kerala',
  'Kochi',
  now(),
  now()
),

-- Sample User 11 - Gurgaon
(
  'Amit Agarwal',
  'amit.agarwal@email.com',
  'amit.agarwal@email.com',
  'password123',
  '9876543220',
  '9876543220',
  '1205, DLF Phase 2, Golf Course Road',
  'Gurgaon',
  'Haryana',
  'Gurgaon',
  now(),
  now()
),

-- Sample User 12 - Indore
(
  'Sneha Joshi',
  'sneha.joshi@email.com',
  'sneha.joshi@email.com',
  'password123',
  '9876543221',
  '9876543221',
  '67, Vijay Nagar, Near Brilliant Convention Centre',
  'Indore',
  'Madhya Pradesh',
  'Indore',
  now(),
  now()
),

-- Sample User 13 - Chandigarh
(
  'Karan Malhotra',
  'karan.malhotra@email.com',
  'karan.malhotra@email.com',
  'password123',
  '9876543222',
  '9876543222',
  'House 234, Sector 17, Near City Centre Mall',
  'Chandigarh',
  'Punjab',
  'Chandigarh',
  now(),
  now()
),

-- Sample User 14 - Lucknow
(
  'Pooja Mishra',
  'pooja.mishra@email.com',
  'pooja.mishra@email.com',
  'password123',
  '9876543223',
  '9876543223',
  'A-102, Gomti Nagar, Near Phoenix Mall',
  'Lucknow',
  'Uttar Pradesh',
  'Lucknow',
  now(),
  now()
),

-- Sample User 15 - Bhopal
(
  'Rohit Verma',
  'rohit.verma@email.com',
  'rohit.verma@email.com',
  'password123',
  '9876543224',
  '9876543224',
  '23, New Market Area, Near Boat Club',
  'Bhopal',
  'Madhya Pradesh',
  'Bhopal',
  now(),
  now()
);

-- Insert sample user roles (using the profile_id from profiles)
INSERT INTO public.user_roles (profile_id, role) 
SELECT id, 'customer' FROM public.profiles WHERE full_name IN (
  'Rahul Sharma', 'Priya Patel', 'Arjun Kumar', 'Meera Reddy', 
  'Sourav Das', 'Kavya Desai', 'Ravi Gupta', 'Anjali Thomas',
  'Amit Agarwal', 'Sneha Joshi', 'Karan Malhotra', 'Pooja Mishra'
);

-- Make 2 users as providers
INSERT INTO public.user_roles (profile_id, role)
SELECT id, 'provider' FROM public.profiles 
WHERE full_name IN ('Vikram Singh', 'Lakshmi Nair');

-- Make 1 user as admin
INSERT INTO public.user_roles (profile_id, role)
SELECT id, 'admin' FROM public.profiles 
WHERE full_name = 'Rohit Verma';

COMMIT;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Query to check the inserted data
-- SELECT 
--   p.full_name,
--   p.email,
--   p.phone,
--   p.city,
--   p.state,
--   ur.role,
--   p.created_at
-- FROM public.profiles p
-- LEFT JOIN public.user_roles ur ON p.id = ur.profile_id
-- ORDER BY p.created_at DESC;

-- Query to count users by role
-- SELECT ur.role, COUNT(*) as count
-- FROM public.user_roles ur
-- GROUP BY ur.role;

-- Query to count users by city
-- SELECT p.city, COUNT(*) as count
-- FROM public.profiles p
-- GROUP BY p.city
-- ORDER BY count DESC;