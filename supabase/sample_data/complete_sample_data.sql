-- ============================================================================
-- COMPLETE SAMPLE DATA FOR PAWTECTORS DATABASE
-- Date: February 10, 2026
-- Description: Comprehensive sample data for all tables
-- ============================================================================

BEGIN;

-- ============================================================================
-- 1. PROFILES & USER ROLES
-- ============================================================================

-- Insert sample user profiles
INSERT INTO public.profiles (
  full_name, email, password, phone, mobile_number, 
  address, city, state, pincode, preferred_location, gender, is_active
) VALUES
('Rahul Sharma', 'rahul.sharma@email.com', 'password123', '9876543210', '9876543210', '301, Sunshine Apartments, Linking Road, Bandra West', 'Mumbai', 'Maharashtra', '400050', 'Mumbai', 'male', true),
('Priya Patel', 'priya.patel@email.com', 'password123', '9876543211', '9876543211', 'B-45, Greater Kailash Part 2, Near Market', 'New Delhi', 'Delhi', '110048', 'New Delhi', 'female', true),
('Arjun Kumar', 'arjun.kumar@email.com', 'password123', '9876543212', '9876543212', '502, Brigade Millennium, JP Nagar Phase 3', 'Bangalore', 'Karnataka', '560078', 'Bangalore', 'male', true),
('Meera Reddy', 'meera.reddy@email.com', 'password123', '9876543213', '9876543213', '12A, Anna Nagar East, Near Shanti Colony', 'Chennai', 'Tamil Nadu', '600102', 'Chennai', 'female', true),
('Vikram Singh', 'vikram.singh@email.com', 'password123', '9876543214', '9876543214', '201, Koregaon Park, Lane 7, Near Osho Ashram', 'Pune', 'Maharashtra', '411001', 'Pune', 'male', true),
('Lakshmi Nair', 'lakshmi.nair@email.com', 'password123', '9876543215', '9876543215', 'Villa 15, Jubilee Hills, Road No. 36', 'Hyderabad', 'Telangana', '500033', 'Hyderabad', 'female', true),
('Sourav Das', 'sourav.das@email.com', 'password123', '9876543216', '9876543216', '45, Park Street, Near Allen Park', 'Kolkata', 'West Bengal', '700016', 'Kolkata', 'male', true),
('Kavya Desai', 'kavya.desai@email.com', 'password123', '9876543217', '9876543217', '3rd Floor, Satellite Road, Prahladnagar', 'Ahmedabad', 'Gujarat', '380015', 'Ahmedabad', 'female', true),
('Ravi Gupta', 'ravi.gupta@email.com', 'password123', '9876543218', '9876543218', 'House 45, C-Scheme, Near Rajmandir Cinema', 'Jaipur', 'Rajasthan', '302001', 'Jaipur', 'male', true),
('Anjali Thomas', 'anjali.thomas@email.com', 'password123', '9876543219', '9876543219', 'Flat 2B, Marine Drive, Near Subhash Park', 'Kochi', 'Kerala', '682011', 'Kochi', 'female', true),
('Dr. Amit Veterinary', 'dr.amit@vetclinic.com', 'password123', '9876543220', '9876543220', 'Clinic Building, MG Road', 'Mumbai', 'Maharashtra', '400001', 'Mumbai', 'male', true),
('Sarah Pet Groomer', 'sarah@groomers.com', 'password123', '9876543221', '9876543221', 'Pet Care Center, Brigade Road', 'Bangalore', 'Karnataka', '560025', 'Bangalore', 'female', true);

-- Insert user roles
INSERT INTO public.user_roles (profile_id, role) 
SELECT id, 'customer' FROM public.profiles WHERE full_name IN (
  'Rahul Sharma', 'Priya Patel', 'Arjun Kumar', 'Meera Reddy', 
  'Sourav Das', 'Kavya Desai', 'Ravi Gupta', 'Anjali Thomas'
);

INSERT INTO public.user_roles (profile_id, role)
SELECT id, 'provider' FROM public.profiles 
WHERE full_name IN ('Dr. Amit Veterinary', 'Sarah Pet Groomer');

INSERT INTO public.user_roles (profile_id, role)
SELECT id, 'admin' FROM public.profiles 
WHERE full_name IN ('Vikram Singh', 'Lakshmi Nair');

-- ============================================================================
-- 2. CATEGORIES
-- ============================================================================

INSERT INTO public.categories (name, slug, description, icon, is_featured, is_active) VALUES
('Dog Food', 'dog-food', 'Premium quality dog food and treats', '🦴', true, true),
('Cat Food', 'cat-food', 'Nutritious cat food and snacks', '🐱', true, true),
('Pet Toys', 'pet-toys', 'Fun and engaging toys for pets', '🎾', true, true),
('Pet Care', 'pet-care', 'Health and grooming products', '🧴', false, true),
('Pet Accessories', 'pet-accessories', 'Collars, leashes, and accessories', '🦮', false, true),
('Bird Supplies', 'bird-supplies', 'Food and accessories for birds', '🦜', false, true),
('Aquarium', 'aquarium', 'Fish food and aquarium supplies', '🐟', false, true),
('Pet Health', 'pet-health', 'Medicines and health supplements', '💊', false, true);

-- ============================================================================
-- 3. PRODUCTS
-- ============================================================================

INSERT INTO public.products (
  name, slug, description, short_description, price, sale_price, 
  category, category_id, sku, stock, brand, pet_type, is_featured, is_active
) VALUES
-- Dog Food
('Royal Canin Adult Dog Food', 'royal-canin-adult-dog-food', 'Complete nutrition for adult dogs with balanced proteins and vitamins', 'Premium adult dog food - 3kg pack', 2899.00, 2599.00, 'Dog Food', (SELECT id FROM categories WHERE slug = 'dog-food'), 'RC-DOG-001', 50, 'Royal Canin', ARRAY['dog'], true, true),
('Pedigree Puppy Food', 'pedigree-puppy-food', 'Specially formulated for growing puppies with DHA and calcium', 'Puppy food for healthy growth - 1.2kg', 849.00, 799.00, 'Dog Food', (SELECT id FROM categories WHERE slug = 'dog-food'), 'PED-PUP-001', 75, 'Pedigree', ARRAY['dog'], true, true),
('Drools Adult Dog Food', 'drools-adult-dog-food', 'High protein dog food with real chicken and vegetables', 'Chicken & vegetable dog food - 10kg', 3299.00, null, 'Dog Food', (SELECT id FROM categories WHERE slug = 'dog-food'), 'DRL-001', 30, 'Drools', ARRAY['dog'], false, true),

-- Cat Food
('Whiskas Tuna Cat Food', 'whiskas-tuna-cat-food', 'Delicious tuna flavor wet food for cats with essential nutrients', 'Tuna flavor wet cat food - 12 pouches', 480.00, 449.00, 'Cat Food', (SELECT id FROM categories WHERE slug = 'cat-food'), 'WHK-TUNA-001', 100, 'Whiskas', ARRAY['cat'], true, true),
('Royal Canin Persian Cat Food', 'royal-canin-persian-cat-food', 'Specialized nutrition for Persian cats with healthy coat formula', 'Persian breed specific cat food - 2kg', 1899.00, 1749.00, 'Cat Food', (SELECT id FROM categories WHERE slug = 'cat-food'), 'RC-CAT-001', 40, 'Royal Canin', ARRAY['cat'], true, true),

-- Pet Toys
('Kong Classic Dog Toy', 'kong-classic-dog-toy', 'Durable rubber toy perfect for stuffing treats and interactive play', 'Durable rubber chew toy - Medium size', 899.00, null, 'Pet Toys', (SELECT id FROM categories WHERE slug = 'pet-toys'), 'KONG-001', 60, 'Kong', ARRAY['dog'], true, true),
('Feather Wand Cat Toy', 'feather-wand-cat-toy', 'Interactive feather wand to keep cats active and entertained', 'Interactive feather wand toy', 299.00, 249.00, 'Pet Toys', (SELECT id FROM categories WHERE slug = 'pet-toys'), 'FWT-001', 80, 'Pet Zone', ARRAY['cat'], false, true),
('Rope Ball Dog Toy', 'rope-ball-dog-toy', 'Natural cotton rope ball for healthy teeth and gums', 'Cotton rope ball toy', 199.00, null, 'Pet Toys', (SELECT id FROM categories WHERE slug = 'pet-toys'), 'RBT-001', 120, 'Pet Toys India', ARRAY['dog'], false, true),

-- Pet Care
('Himalaya Erina Coat Cleanser', 'himalaya-erina-coat-cleanser', 'Herbal coat cleanser and conditioner for dogs and cats', 'Herbal shampoo for pets - 200ml', 185.00, null, 'Pet Care', (SELECT id FROM categories WHERE slug = 'pet-care'), 'HIM-ERI-001', 90, 'Himalaya', ARRAY['dog', 'cat'], false, true),
('Pedigree DentaStix', 'pedigree-dentastix', 'Daily dental care treats to reduce tartar buildup', 'Dental chew sticks - 7 sticks pack', 149.00, 129.00, 'Pet Care', (SELECT id FROM categories WHERE slug = 'pet-care'), 'PED-DENT-001', 150, 'Pedigree', ARRAY['dog'], false, true),

-- Pet Accessories
('Leather Dog Collar', 'leather-dog-collar', 'Premium leather collar with adjustable buckle and name tag', 'Genuine leather collar - Medium', 599.00, 499.00, 'Pet Accessories', (SELECT id FROM categories WHERE slug = 'pet-accessories'), 'LDC-001', 45, 'Pet World', ARRAY['dog'], false, true),
('Retractable Dog Leash', 'retractable-dog-leash', '5-meter retractable leash with comfortable grip handle', 'Retractable leash - 5m length', 799.00, null, 'Pet Accessories', (SELECT id FROM categories WHERE slug = 'pet-accessories'), 'RDL-001', 35, 'Flexi', ARRAY['dog'], false, true);

-- ============================================================================
-- 4. PRODUCT ATTRIBUTES
-- ============================================================================

INSERT INTO public.product_attributes (product_id, attribute_name, attribute_value, price_adjustment, stock_adjustment) VALUES
-- Royal Canin Dog Food variants
((SELECT id FROM products WHERE sku = 'RC-DOG-001'), 'size', 'Small - 1.5kg', -800.00, 0),
((SELECT id FROM products WHERE sku = 'RC-DOG-001'), 'size', 'Medium - 3kg', 0.00, 0),
((SELECT id FROM products WHERE sku = 'RC-DOG-001'), 'size', 'Large - 10kg', 2400.00, 0),

-- Kong Toy variants
((SELECT id FROM products WHERE sku = 'KONG-001'), 'size', 'Small', -200.00, 0),
((SELECT id FROM products WHERE sku = 'KONG-001'), 'size', 'Medium', 0.00, 0),
((SELECT id FROM products WHERE sku = 'KONG-001'), 'size', 'Large', 300.00, 0),

-- Leather Collar variants
((SELECT id FROM products WHERE sku = 'LDC-001'), 'size', 'Small', -100.00, 0),
((SELECT id FROM products WHERE sku = 'LDC-001'), 'size', 'Medium', 0.00, 0),
((SELECT id FROM products WHERE sku = 'LDC-001'), 'size', 'Large', 100.00, 0),
((SELECT id FROM products WHERE sku = 'LDC-001'), 'color', 'Black', 0.00, 0),
((SELECT id FROM products WHERE sku = 'LDC-001'), 'color', 'Brown', 0.00, 0),
((SELECT id FROM products WHERE sku = 'LDC-001'), 'color', 'Red', 50.00, 0);

-- ============================================================================
-- 5. DELIVERY ZONES
-- ============================================================================

INSERT INTO public.delivery_zones (name, cities, states, pincodes, delivery_fee, free_delivery_threshold, estimated_delivery_days) VALUES
('Mumbai Metro', ARRAY['Mumbai', 'Navi Mumbai', 'Thane'], ARRAY['Maharashtra'], ARRAY['400001', '400050', '400078', '410210'], 50.00, 999.00, 1),
('Delhi NCR', ARRAY['New Delhi', 'Gurgaon', 'Noida', 'Faridabad'], ARRAY['Delhi', 'Haryana', 'Uttar Pradesh'], ARRAY['110001', '110048', '122001', '201301'], 60.00, 999.00, 1),
('Bangalore Urban', ARRAY['Bangalore', 'Whitefield'], ARRAY['Karnataka'], ARRAY['560001', '560078', '560066'], 45.00, 899.00, 1),
('Chennai Metro', ARRAY['Chennai', 'Kanchipuram'], ARRAY['Tamil Nadu'], ARRAY['600001', '600102'], 55.00, 999.00, 2),
('Pune Region', ARRAY['Pune', 'Pimpri-Chinchwad'], ARRAY['Maharashtra'], ARRAY['411001', '411057'], 40.00, 799.00, 2),
('Tier 2 Cities', ARRAY['Jaipur', 'Ahmedabad', 'Kochi', 'Indore'], ARRAY['Rajasthan', 'Gujarat', 'Kerala', 'Madhya Pradesh'], null, 80.00, 1299.00, 3);

-- ============================================================================
-- 6. SERVICE PROVIDERS
-- ============================================================================

INSERT INTO public.service_providers (
  name, category, address, city, state, pincode, latitude, longitude, 
  phone, email, description, price_range, rating, review_count, is_verified
) VALUES
('Mumbai Pet Clinic', 'clinic', '123 MG Road, Near Railway Station', 'Mumbai', 'Maharashtra', '400001', 19.0760, 72.8777, '022-28501234', 'info@mumbaipetclinic.com', 'Full-service veterinary clinic with 24/7 emergency care', '$$', 4.5, 245, true),
('Bangalore Animal Hospital', 'clinic', '45 Brigade Road, Central Bangalore', 'Bangalore', 'Karnataka', '560025', 12.9716, 77.5946, '080-25599876', 'care@bangalorehospital.com', 'Modern veterinary hospital with advanced surgical facilities', '$$$', 4.7, 189, true),
('Pawsome Grooming Salon', 'grooming', 'Shop 12, Phoenix Mall, Lower Parel', 'Mumbai', 'Maharashtra', '400013', 19.0176, 72.8311, '9876543221', 'book@pawsomegroomers.com', 'Premium pet grooming with organic products and spa treatments', '$$', 4.3, 156, true),
('Delhi Pet Grooming', 'grooming', 'A-15, Connaught Place, Central Delhi', 'New Delhi', 'Delhi', '110001', 28.6315, 77.2167, '011-23456789', 'groom@delhipets.com', 'Professional grooming services for all breeds', '$', 4.1, 98, false),
('Happy Tails Boarding', 'boarding', 'Farm House 23, Lonavala Highway', 'Pune', 'Maharashtra', '410401', 18.7537, 73.4057, '9876501234', 'stay@happytails.com', 'Luxury pet boarding with play areas and swimming pool', '$$$', 4.8, 67, true),
('Chennai Pet Training', 'training', '89 Anna Nagar, Near Park', 'Chennai', 'Tamil Nadu', '600040', 13.0827, 80.2707, '044-28901234', 'train@chennaipets.com', 'Professional dog training and behavior modification', '$$', 4.4, 134, true),
('Kolkata Veterinary Center', 'clinic', '56 Park Street, Central Kolkata', 'Kolkata', 'West Bengal', '700016', 22.5726, 88.3639, '033-22456789', 'vet@kolkatapets.com', 'Experienced veterinarians with diagnostic facilities', '$$', 4.2, 201, false);

-- ============================================================================
-- 7. PROVIDER SERVICES
-- ============================================================================

INSERT INTO public.provider_services (provider_id, service_name) VALUES
((SELECT id FROM service_providers WHERE name = 'Mumbai Pet Clinic'), 'General Checkup'),
((SELECT id FROM service_providers WHERE name = 'Mumbai Pet Clinic'), 'Vaccination'),
((SELECT id FROM service_providers WHERE name = 'Mumbai Pet Clinic'), 'Surgery'),
((SELECT id FROM service_providers WHERE name = 'Mumbai Pet Clinic'), 'Emergency Care'),
((SELECT id FROM service_providers WHERE name = 'Mumbai Pet Clinic'), 'Dental Care'),

((SELECT id FROM service_providers WHERE name = 'Pawsome Grooming Salon'), 'Full Grooming'),
((SELECT id FROM service_providers WHERE name = 'Pawsome Grooming Salon'), 'Bath & Brush'),
((SELECT id FROM service_providers WHERE name = 'Pawsome Grooming Salon'), 'Nail Trimming'),
((SELECT id FROM service_providers WHERE name = 'Pawsome Grooming Salon'), 'Ear Cleaning'),
((SELECT id FROM service_providers WHERE name = 'Pawsome Grooming Salon'), 'De-shedding'),

((SELECT id FROM service_providers WHERE name = 'Happy Tails Boarding'), 'Day Care'),
((SELECT id FROM service_providers WHERE name = 'Happy Tails Boarding'), 'Overnight Boarding'),
((SELECT id FROM service_providers WHERE name = 'Happy Tails Boarding'), 'Extended Stay'),
((SELECT id FROM service_providers WHERE name = 'Happy Tails Boarding'), 'Play Sessions'),

((SELECT id FROM service_providers WHERE name = 'Chennai Pet Training'), 'Basic Obedience'),
((SELECT id FROM service_providers WHERE name = 'Chennai Pet Training'), 'Advanced Training'),
((SELECT id FROM service_providers WHERE name = 'Chennai Pet Training'), 'Puppy Training'),
((SELECT id FROM service_providers WHERE name = 'Chennai Pet Training'), 'Behavior Modification');

-- ============================================================================
-- 8. PROVIDER AVAILABILITY
-- ============================================================================

INSERT INTO public.provider_availability (provider_id, day_of_week, start_time, end_time, is_available) VALUES
-- Mumbai Pet Clinic (Monday to Saturday)
((SELECT id FROM service_providers WHERE name = 'Mumbai Pet Clinic'), 1, '09:00', '20:00', true),
((SELECT id FROM service_providers WHERE name = 'Mumbai Pet Clinic'), 2, '09:00', '20:00', true),
((SELECT id FROM service_providers WHERE name = 'Mumbai Pet Clinic'), 3, '09:00', '20:00', true),
((SELECT id FROM service_providers WHERE name = 'Mumbai Pet Clinic'), 4, '09:00', '20:00', true),
((SELECT id FROM service_providers WHERE name = 'Mumbai Pet Clinic'), 5, '09:00', '20:00', true),
((SELECT id FROM service_providers WHERE name = 'Mumbai Pet Clinic'), 6, '09:00', '18:00', true),
((SELECT id FROM service_providers WHERE name = 'Mumbai Pet Clinic'), 0, '10:00', '16:00', false),

-- Pawsome Grooming Salon (Tuesday to Sunday)
((SELECT id FROM service_providers WHERE name = 'Pawsome Grooming Salon'), 2, '10:00', '19:00', true),
((SELECT id FROM service_providers WHERE name = 'Pawsome Grooming Salon'), 3, '10:00', '19:00', true),
((SELECT id FROM service_providers WHERE name = 'Pawsome Grooming Salon'), 4, '10:00', '19:00', true),
((SELECT id FROM service_providers WHERE name = 'Pawsome Grooming Salon'), 5, '10:00', '19:00', true),
((SELECT id FROM service_providers WHERE name = 'Pawsome Grooming Salon'), 6, '10:00', '19:00', true),
((SELECT id FROM service_providers WHERE name = 'Pawsome Grooming Salon'), 0, '10:00', '17:00', true),
((SELECT id FROM service_providers WHERE name = 'Pawsome Grooming Salon'), 1, '10:00', '17:00', false);

-- ============================================================================
-- 9. SERVICE PRICING
-- ============================================================================

INSERT INTO public.service_pricing (provider_id, name, price, duration_minutes, description) VALUES
-- Mumbai Pet Clinic
((SELECT id FROM service_providers WHERE name = 'Mumbai Pet Clinic'), 'General Checkup', 500.00, 30, 'Complete physical examination'),
((SELECT id FROM service_providers WHERE name = 'Mumbai Pet Clinic'), 'Vaccination - Basic', 800.00, 20, 'Essential vaccines for puppies'),
((SELECT id FROM service_providers WHERE name = 'Mumbai Pet Clinic'), 'Vaccination - Complete', 1500.00, 30, 'Full vaccination package'),
((SELECT id FROM service_providers WHERE name = 'Mumbai Pet Clinic'), 'Minor Surgery', 5000.00, 120, 'Neutering, spaying, minor procedures'),
((SELECT id FROM service_providers WHERE name = 'Mumbai Pet Clinic'), 'Emergency Treatment', 2000.00, 60, '24/7 emergency care'),

-- Pawsome Grooming Salon
((SELECT id FROM service_providers WHERE name = 'Pawsome Grooming Salon'), 'Full Grooming Package', 1200.00, 120, 'Bath, cut, nail trim, ear cleaning'),
((SELECT id FROM service_providers WHERE name = 'Pawsome Grooming Salon'), 'Bath & Brush', 600.00, 60, 'Basic bathing and brushing'),
((SELECT id FROM service_providers WHERE name = 'Pawsome Grooming Salon'), 'Nail Trimming', 200.00, 15, 'Professional nail cutting'),
((SELECT id FROM service_providers WHERE name = 'Pawsome Grooming Salon'), 'De-shedding Treatment', 800.00, 90, 'Special treatment for heavy shedding'),

-- Happy Tails Boarding
((SELECT id FROM service_providers WHERE name = 'Happy Tails Boarding'), 'Day Care (8 hours)', 800.00, 480, 'Supervised day care with activities'),
((SELECT id FROM service_providers WHERE name = 'Happy Tails Boarding'), 'Overnight Boarding', 1500.00, 1440, 'Comfortable overnight stay'),
((SELECT id FROM service_providers WHERE name = 'Happy Tails Boarding'), 'Extended Stay (per day)', 1200.00, 1440, 'Long-term boarding with personal care'),

-- Chennai Pet Training
((SELECT id FROM service_providers WHERE name = 'Chennai Pet Training'), 'Basic Obedience (5 sessions)', 3000.00, 300, 'Sit, stay, come, heel commands'),
((SELECT id FROM service_providers WHERE name = 'Chennai Pet Training'), 'Puppy Training Package', 4500.00, 450, 'House training and socialization'),
((SELECT id FROM service_providers WHERE name = 'Chennai Pet Training'), 'Behavior Modification', 6000.00, 600, 'Address aggressive or anxious behavior');

-- ============================================================================
-- 10. PETS
-- ============================================================================

INSERT INTO public.pets (
  profile_id, name, type, breed, age_months, weight, gender, 
  color, vaccination_status, medical_conditions
) VALUES
((SELECT id FROM profiles WHERE email = 'rahul.sharma@email.com'), 'Bruno', 'dog', 'German Shepherd', 24, 28.5, 'male', 'Black & Tan', 'Up to date', 'None'),
((SELECT id FROM profiles WHERE email = 'priya.patel@email.com'), 'Bella', 'cat', 'Persian', 18, 4.2, 'female', 'White', 'Up to date', 'None'),
((SELECT id FROM profiles WHERE email = 'arjun.kumar@email.com'), 'Max', 'dog', 'Golden Retriever', 36, 32.0, 'male', 'Golden', 'Due for booster', 'Hip dysplasia'),
((SELECT id FROM profiles WHERE email = 'meera.reddy@email.com'), 'Whiskers', 'cat', 'Siamese', 12, 3.8, 'female', 'Seal Point', 'Up to date', 'None'),
((SELECT id FROM profiles WHERE email = 'sourav.das@email.com'), 'Rocky', 'dog', 'Labrador', 48, 30.5, 'male', 'Chocolate', 'Up to date', 'Arthritis'),
((SELECT id FROM profiles WHERE email = 'kavya.desai@email.com'), 'Luna', 'cat', 'Maine Coon', 20, 5.5, 'female', 'Silver Tabby', 'Up to date', 'None'),
((SELECT id FROM profiles WHERE email = 'ravi.gupta@email.com'), 'Tiger', 'dog', 'Indian Spitz', 30, 15.0, 'male', 'White', 'Overdue', 'None'),
((SELECT id FROM profiles WHERE email = 'anjali.thomas@email.com'), 'Mimi', 'cat', 'British Shorthair', 15, 4.0, 'female', 'Blue', 'Up to date', 'None');

-- ============================================================================
-- 11. CART
-- ============================================================================

INSERT INTO public.cart (profile_id, product_id, quantity) VALUES
((SELECT id FROM profiles WHERE email = 'rahul.sharma@email.com'), (SELECT id FROM products WHERE sku = 'RC-DOG-001'), 1),
((SELECT id FROM profiles WHERE email = 'rahul.sharma@email.com'), (SELECT id FROM products WHERE sku = 'KONG-001'), 2),
((SELECT id FROM profiles WHERE email = 'priya.patel@email.com'), (SELECT id FROM products WHERE sku = 'WHK-TUNA-001'), 3),
((SELECT id FROM profiles WHERE email = 'priya.patel@email.com'), (SELECT id FROM products WHERE sku = 'FWT-001'), 1),
((SELECT id FROM profiles WHERE email = 'arjun.kumar@email.com'), (SELECT id FROM products WHERE sku = 'PED-PUP-001'), 1),
((SELECT id FROM profiles WHERE email = 'meera.reddy@email.com'), (SELECT id FROM products WHERE sku = 'RC-CAT-001'), 1);

-- ============================================================================
-- 12. WISHLIST
-- ============================================================================

INSERT INTO public.wishlist (profile_id, product_id) VALUES
((SELECT id FROM profiles WHERE email = 'rahul.sharma@email.com'), (SELECT id FROM products WHERE sku = 'LDC-001')),
((SELECT id FROM profiles WHERE email = 'rahul.sharma@email.com'), (SELECT id FROM products WHERE sku = 'RDL-001')),
((SELECT id FROM profiles WHERE email = 'priya.patel@email.com'), (SELECT id FROM products WHERE sku = 'HIM-ERI-001')),
((SELECT id FROM profiles WHERE email = 'arjun.kumar@email.com'), (SELECT id FROM products WHERE sku = 'PED-DENT-001'));

INSERT INTO public.wishlist (profile_id, service_provider_id) VALUES
((SELECT id FROM profiles WHERE email = 'rahul.sharma@email.com'), (SELECT id FROM service_providers WHERE name = 'Mumbai Pet Clinic')),
((SELECT id FROM profiles WHERE email = 'priya.patel@email.com'), (SELECT id FROM service_providers WHERE name = 'Pawsome Grooming Salon')),
((SELECT id FROM profiles WHERE email = 'arjun.kumar@email.com'), (SELECT id FROM service_providers WHERE name = 'Bangalore Animal Hospital'));

-- ============================================================================
-- 13. ORDERS
-- ============================================================================

INSERT INTO public.orders (profile_id, total_amount, status, payment_status, notes) VALUES
((SELECT id FROM profiles WHERE email = 'rahul.sharma@email.com'), 2899.00, 'delivered', 'paid', 'Delivered on time'),
((SELECT id FROM profiles WHERE email = 'priya.patel@email.com'), 1689.00, 'shipped', 'paid', 'In transit'),
((SELECT id FROM profiles WHERE email = 'arjun.kumar@email.com'), 849.00, 'processing', 'paid', 'Being packed'),
((SELECT id FROM profiles WHERE email = 'meera.reddy@email.com'), 1899.00, 'pending', 'pending', 'Payment pending');

-- ============================================================================
-- 14. ORDER ITEMS
-- ============================================================================

INSERT INTO public.order_items (order_id, product_id, quantity, price, product_name) VALUES
-- Order 1
((SELECT id FROM orders WHERE profile_id = (SELECT id FROM profiles WHERE email = 'rahul.sharma@email.com') ORDER BY created_at DESC LIMIT 1), (SELECT id FROM products WHERE sku = 'RC-DOG-001'), 1, 2599.00, 'Royal Canin Adult Dog Food'),
((SELECT id FROM orders WHERE profile_id = (SELECT id FROM profiles WHERE email = 'rahul.sharma@email.com') ORDER BY created_at DESC LIMIT 1), (SELECT id FROM products WHERE sku = 'KONG-001'), 1, 899.00, 'Kong Classic Dog Toy'),

-- Order 2  
((SELECT id FROM orders WHERE profile_id = (SELECT id FROM profiles WHERE email = 'priya.patel@email.com') ORDER BY created_at DESC LIMIT 1), (SELECT id FROM products WHERE sku = 'WHK-TUNA-001'), 3, 449.00, 'Whiskas Tuna Cat Food'),
((SELECT id FROM orders WHERE profile_id = (SELECT id FROM profiles WHERE email = 'priya.patel@email.com') ORDER BY created_at DESC LIMIT 1), (SELECT id FROM products WHERE sku = 'FWT-001'), 1, 249.00, 'Feather Wand Cat Toy'),

-- Order 3
((SELECT id FROM orders WHERE profile_id = (SELECT id FROM profiles WHERE email = 'arjun.kumar@email.com') ORDER BY created_at DESC LIMIT 1), (SELECT id FROM products WHERE sku = 'PED-PUP-001'), 1, 799.00, 'Pedigree Puppy Food'),

-- Order 4
((SELECT id FROM orders WHERE profile_id = (SELECT id FROM profiles WHERE email = 'meera.reddy@email.com') ORDER BY created_at DESC LIMIT 1), (SELECT id FROM products WHERE sku = 'RC-CAT-001'), 1, 1749.00, 'Royal Canin Persian Cat Food');

-- ============================================================================
-- 15. SHIPPING & BILLING ADDRESSES
-- ============================================================================

INSERT INTO public.shipping_addresses (
  order_id, full_name, phone, address_line1, city, state, pincode, address_type
) VALUES
((SELECT id FROM orders WHERE profile_id = (SELECT id FROM profiles WHERE email = 'rahul.sharma@email.com') ORDER BY created_at DESC LIMIT 1), 'Rahul Sharma', '9876543210', '301, Sunshine Apartments, Linking Road, Bandra West', 'Mumbai', 'Maharashtra', '400050', 'home'),
((SELECT id FROM orders WHERE profile_id = (SELECT id FROM profiles WHERE email = 'priya.patel@email.com') ORDER BY created_at DESC LIMIT 1), 'Priya Patel', '9876543211', 'B-45, Greater Kailash Part 2, Near Market', 'New Delhi', 'Delhi', '110048', 'home'),
((SELECT id FROM orders WHERE profile_id = (SELECT id FROM profiles WHERE email = 'arjun.kumar@email.com') ORDER BY created_at DESC LIMIT 1), 'Arjun Kumar', '9876543212', '502, Brigade Millennium, JP Nagar Phase 3', 'Bangalore', 'Karnataka', '560078', 'home'),
((SELECT id FROM orders WHERE profile_id = (SELECT id FROM profiles WHERE email = 'meera.reddy@email.com') ORDER BY created_at DESC LIMIT 1), 'Meera Reddy', '9876543213', '12A, Anna Nagar East, Near Shanti Colony', 'Chennai', 'Tamil Nadu', '600102', 'home');

INSERT INTO public.billing_addresses (
  order_id, full_name, phone, address_line1, city, state, pincode
) VALUES
((SELECT id FROM orders WHERE profile_id = (SELECT id FROM profiles WHERE email = 'rahul.sharma@email.com') ORDER BY created_at DESC LIMIT 1), 'Rahul Sharma', '9876543210', '301, Sunshine Apartments, Linking Road, Bandra West', 'Mumbai', 'Maharashtra', '400050'),
((SELECT id FROM orders WHERE profile_id = (SELECT id FROM profiles WHERE email = 'priya.patel@email.com') ORDER BY created_at DESC LIMIT 1), 'Priya Patel', '9876543211', 'B-45, Greater Kailash Part 2, Near Market', 'New Delhi', 'Delhi', '110048'),
((SELECT id FROM orders WHERE profile_id = (SELECT id FROM profiles WHERE email = 'arjun.kumar@email.com') ORDER BY created_at DESC LIMIT 1), 'Arjun Kumar', '9876543212', '502, Brigade Millennium, JP Nagar Phase 3', 'Bangalore', 'Karnataka', '560078'),
((SELECT id FROM orders WHERE profile_id = (SELECT id FROM profiles WHERE email = 'meera.reddy@email.com') ORDER BY created_at DESC LIMIT 1), 'Meera Reddy', '9876543213', '12A, Anna Nagar East, Near Shanti Colony', 'Chennai', 'Tamil Nadu', '600102');

-- ============================================================================
-- 16. BOOKINGS
-- ============================================================================

INSERT INTO public.bookings (
  profile_id, provider_id, pet_id, service_category, service_name, 
  pet_name, pet_type, owner_name, owner_email, owner_phone,
  booking_date, booking_time, status, amount, notes
) VALUES
((SELECT id FROM profiles WHERE email = 'rahul.sharma@email.com'), (SELECT id FROM service_providers WHERE name = 'Mumbai Pet Clinic'), (SELECT id FROM pets WHERE name = 'Bruno'), 'clinic', 'General Checkup', 'Bruno', 'dog', 'Rahul Sharma', 'rahul.sharma@email.com', '9876543210', '2026-02-15', '10:00', 'confirmed', 500.00, 'First visit'),

((SELECT id FROM profiles WHERE email = 'priya.patel@email.com'), (SELECT id FROM service_providers WHERE name = 'Pawsome Grooming Salon'), (SELECT id FROM pets WHERE name = 'Bella'), 'grooming', 'Full Grooming Package', 'Bella', 'cat', 'Priya Patel', 'priya.patel@email.com', '9876543211', '2026-02-16', '14:00', 'pending', 1200.00, 'Please be gentle, first grooming'),

((SELECT id FROM profiles WHERE email = 'arjun.kumar@email.com'), (SELECT id FROM service_providers WHERE name = 'Bangalore Animal Hospital'), (SELECT id FROM pets WHERE name = 'Max'), 'clinic', 'Vaccination - Complete', 'Max', 'dog', 'Arjun Kumar', 'arjun.kumar@email.com', '9876543212', '2026-02-18', '11:30', 'confirmed', 1500.00, 'Annual vaccination due'),

((SELECT id FROM profiles WHERE email = 'meera.reddy@email.com'), (SELECT id FROM service_providers WHERE name = 'Chennai Pet Training'), null, 'training', 'Basic Obedience', 'Whiskers', 'cat', 'Meera Reddy', 'meera.reddy@email.com', '9876543213', '2026-02-20', '16:00', 'pending', 3000.00, 'Needs behavior training'),

((SELECT id FROM profiles WHERE email = 'sourav.das@email.com'), (SELECT id FROM service_providers WHERE name = 'Happy Tails Boarding'), (SELECT id FROM pets WHERE name = 'Rocky'), 'boarding', 'Overnight Boarding', 'Rocky', 'dog', 'Sourav Das', 'sourav.das@email.com', '9876543216', '2026-02-22', '18:00', 'confirmed', 1500.00, '2 nights stay during business trip');

-- ============================================================================
-- 17. PAYMENTS
-- ============================================================================

INSERT INTO public.payments (
  profile_id, booking_id, order_id, payment_method, amount, 
  status, razorpay_payment_id, currency
) VALUES
-- Payments for orders
((SELECT id FROM profiles WHERE email = 'rahul.sharma@email.com'), null, (SELECT id FROM orders WHERE profile_id = (SELECT id FROM profiles WHERE email = 'rahul.sharma@email.com')), 'razorpay', 2899.00, 'success', 'pay_ABC123XYZ', 'INR'),
((SELECT id FROM profiles WHERE email = 'priya.patel@email.com'), null, (SELECT id FROM orders WHERE profile_id = (SELECT id FROM profiles WHERE email = 'priya.patel@email.com')), 'razorpay', 1689.00, 'success', 'pay_DEF456ABC', 'INR'),
((SELECT id FROM profiles WHERE email = 'arjun.kumar@email.com'), null, (SELECT id FROM orders WHERE profile_id = (SELECT id FROM profiles WHERE email = 'arjun.kumar@email.com')), 'paytm', 849.00, 'success', 'paytm_789GHI', 'INR'),

-- Payments for bookings
((SELECT id FROM profiles WHERE email = 'rahul.sharma@email.com'), (SELECT id FROM bookings WHERE pet_name = 'Bruno' AND owner_email = 'rahul.sharma@email.com'), null, 'razorpay', 500.00, 'success', 'pay_BOOK123', 'INR'),
((SELECT id FROM profiles WHERE email = 'arjun.kumar@email.com'), (SELECT id FROM bookings WHERE pet_name = 'Max' AND owner_email = 'arjun.kumar@email.com'), null, 'gpay', 1500.00, 'success', 'gpay_VAX456', 'INR'),
((SELECT id FROM profiles WHERE email = 'sourav.das@email.com'), (SELECT id FROM bookings WHERE pet_name = 'Rocky' AND owner_email = 'sourav.das@email.com'), null, 'cash', 1500.00, 'pending', null, 'INR');

-- ============================================================================
-- 18. NOTIFICATIONS
-- ============================================================================

INSERT INTO public.notifications (
  profile_id, title, message, type, is_read, is_sent
) VALUES
((SELECT id FROM profiles WHERE email = 'rahul.sharma@email.com'), 'Order Delivered', 'Your order #12345 has been delivered successfully!', 'order', true, true),
((SELECT id FROM profiles WHERE email = 'rahul.sharma@email.com'), 'Booking Reminder', 'Your appointment with Mumbai Pet Clinic is tomorrow at 10:00 AM', 'booking', false, true),
((SELECT id FROM profiles WHERE email = 'priya.patel@email.com'), 'Order Shipped', 'Your order #12346 is on the way. Track your order in the app.', 'order', false, true),
((SELECT id FROM profiles WHERE email = 'priya.patel@email.com'), 'New Promotion', '20% off on all cat food! Use code CAT20', 'promotion', false, true),
((SELECT id FROM profiles WHERE email = 'arjun.kumar@email.com'), 'Payment Success', 'Payment of ₹849 received successfully for order #12347', 'payment', true, true),
((SELECT id FROM profiles WHERE email = 'meera.reddy@email.com'), 'Vaccination Due', 'Whiskers vaccination is due next week. Book an appointment now!', 'reminder', false, false);

-- ============================================================================
-- 19. REVIEWS
-- ============================================================================

INSERT INTO public.reviews (
  profile_id, product_id, service_provider_id, booking_id, rating, 
  comment, is_verified_purchase
) VALUES
-- Product reviews
((SELECT id FROM profiles WHERE email = 'rahul.sharma@email.com'), (SELECT id FROM products WHERE sku = 'RC-DOG-001'), null, null, 5, 'Excellent quality food! Bruno loves it and his coat is shinier now.', true),
((SELECT id FROM profiles WHERE email = 'priya.patel@email.com'), (SELECT id FROM products WHERE sku = 'WHK-TUNA-001'), null, null, 4, 'Bella enjoys this flavor. Good value for money.', true),
((SELECT id FROM profiles WHERE email = 'arjun.kumar@email.com'), (SELECT id FROM products WHERE sku = 'KONG-001'), null, null, 5, 'Max can play with this for hours! Very durable.', true),

-- Service provider reviews
((SELECT id FROM profiles WHERE email = 'rahul.sharma@email.com'), null, (SELECT id FROM service_providers WHERE name = 'Mumbai Pet Clinic'), (SELECT id FROM bookings WHERE pet_name = 'Bruno' AND owner_email = 'rahul.sharma@email.com'), 5, 'Dr. Amit was very gentle with Bruno. Great service and clean facilities.', false),
((SELECT id FROM profiles WHERE email = 'priya.patel@email.com'), null, (SELECT id FROM service_providers WHERE name = 'Pawsome Grooming Salon'), null, 4, 'Good grooming service, but a bit expensive. Bella looks beautiful!', false),
((SELECT id FROM profiles WHERE email = 'arjun.kumar@email.com'), null, (SELECT id FROM service_providers WHERE name = 'Bangalore Animal Hospital'), (SELECT id FROM bookings WHERE pet_name = 'Max' AND owner_email = 'arjun.kumar@email.com'), 5, 'Professional staff and modern equipment. Highly recommended!', false);

-- ============================================================================
-- 20. NGO
-- ============================================================================

INSERT INTO public.ngo (
  name, description, address, city, state, pincode, phone, email, 
  mission_statement, animals_count, adoption_count, rating, review_count,
  founded_year, is_verified, is_active
) VALUES
('Mumbai Animal Welfare Society', 'Dedicated to rescuing and rehabilitating street animals in Mumbai', 'Plot 15, Versova Road, Andheri West', 'Mumbai', 'Maharashtra', '400061', '022-26301234', 'info@mumbaiaws.org', 'To create a world where every animal is treated with compassion and respect', 45, 123, 4.6, 89, 2010, true, true),
('Bangalore Animal Care Trust', 'Working for animal welfare and rights in Bangalore since 2008', '234 Hosur Road, Near Silk Board', 'Bangalore', 'Karnataka', '560068', '080-27890123', 'adopt@bangaloreact.org', 'Rescue, rehabilitate, and find loving homes for abandoned animals', 38, 156, 4.4, 67, 2008, true, true),
('Delhi Stray Animal Foundation', 'Providing medical care and shelter to stray animals', 'Sector 18, Rohini, Near Metro Station', 'New Delhi', 'Delhi', '110085', '011-27456789', 'help@delhistrays.org', 'A safe haven for all animals in need', 52, 98, 4.3, 45, 2012, false, true),
('Chennai Pet Rescue', 'Focused on pet adoption and animal rights advocacy', '89 T. Nagar, Near Pondy Bazaar', 'Chennai', 'Tamil Nadu', '600017', '044-28567890', 'rescue@chennaipets.org', 'Every animal deserves a loving family', 29, 234, 4.7, 123, 2015, true, true);

-- ============================================================================
-- 21. SHELTER ANIMALS
-- ============================================================================

INSERT INTO public.shelter_animals (
  ngo_id, name, type, breed, age_months, gender, description, 
  health_status, vaccination_status, neutered_spayed, adoption_status
) VALUES
-- Mumbai Animal Welfare Society
((SELECT id FROM ngo WHERE name = 'Mumbai Animal Welfare Society'), 'Charlie', 'dog', 'Mixed Breed', 18, 'male', 'Friendly and energetic dog, loves to play fetch', 'Healthy', 'Complete', true, 'available'),
((SELECT id FROM ngo WHERE name = 'Mumbai Animal Welfare Society'), 'Daisy', 'dog', 'Labrador Mix', 24, 'female', 'Gentle and calm, great with children', 'Healthy', 'Complete', true, 'available'),
((SELECT id FROM ngo WHERE name = 'Mumbai Animal Welfare Society'), 'Mittens', 'cat', 'Indian Domestic', 12, 'female', 'Playful kitten, loves belly rubs', 'Healthy', 'Partial', false, 'available'),
((SELECT id FROM ngo WHERE name = 'Mumbai Animal Welfare Society'), 'Shadow', 'cat', 'Persian Mix', 30, 'male', 'Quiet and affectionate, prefers indoor life', 'Minor skin condition', 'Complete', true, 'pending'),

-- Bangalore Animal Care Trust
((SELECT id FROM ngo WHERE name = 'Bangalore Animal Care Trust'), 'Buddy', 'dog', 'Golden Retriever Mix', 36, 'male', 'Well-trained dog, knows basic commands', 'Healthy', 'Complete', true, 'available'),
((SELECT id FROM ngo WHERE name = 'Bangalore Animal Care Trust'), 'Princess', 'cat', 'Siamese Mix', 15, 'female', 'Elegant and independent cat', 'Healthy', 'Complete', true, 'available'),
((SELECT id FROM ngo WHERE name = 'Bangalore Animal Care Trust'), 'Rocky', 'dog', 'German Shepherd Mix', 48, 'male', 'Strong and loyal, needs experienced owner', 'Arthritis in hind legs', 'Complete', true, 'available'),

-- Chennai Pet Rescue
((SELECT id FROM ngo WHERE name = 'Chennai Pet Rescue'), 'Luna', 'cat', 'British Shorthair Mix', 20, 'female', 'Sweet and cuddly, loves to purr', 'Healthy', 'Complete', true, 'adopted'),
((SELECT id FROM ngo WHERE name = 'Chennai Pet Rescue'), 'Max', 'dog', 'Beagle Mix', 28, 'male', 'Curious and food-motivated, great for training', 'Healthy', 'Complete', true, 'available'),
((SELECT id FROM ngo WHERE name = 'Chennai Pet Rescue'), 'Whiskers', 'cat', 'Maine Coon Mix', 22, 'male', 'Large and fluffy, very gentle giant', 'Healthy', 'Complete', true, 'pending');

COMMIT;

-- ============================================================================
-- VERIFICATION QUERIES  
-- ============================================================================

-- Check total records in each table
SELECT 
  'profiles' as table_name, count(*) as record_count FROM public.profiles
UNION ALL SELECT 'user_roles', count(*) FROM public.user_roles
UNION ALL SELECT 'categories', count(*) FROM public.categories
UNION ALL SELECT 'products', count(*) FROM public.products
UNION ALL SELECT 'product_attributes', count(*) FROM public.product_attributes
UNION ALL SELECT 'delivery_zones', count(*) FROM public.delivery_zones
UNION ALL SELECT 'service_providers', count(*) FROM public.service_providers
UNION ALL SELECT 'provider_services', count(*) FROM public.provider_services  
UNION ALL SELECT 'provider_availability', count(*) FROM public.provider_availability
UNION ALL SELECT 'service_pricing', count(*) FROM public.service_pricing
UNION ALL SELECT 'pets', count(*) FROM public.pets
UNION ALL SELECT 'cart', count(*) FROM public.cart
UNION ALL SELECT 'wishlist', count(*) FROM public.wishlist
UNION ALL SELECT 'orders', count(*) FROM public.orders
UNION ALL SELECT 'order_items', count(*) FROM public.order_items
UNION ALL SELECT 'shipping_addresses', count(*) FROM public.shipping_addresses
UNION ALL SELECT 'billing_addresses', count(*) FROM public.billing_addresses
UNION ALL SELECT 'bookings', count(*) FROM public.bookings
UNION ALL SELECT 'payments', count(*) FROM public.payments
UNION ALL SELECT 'notifications', count(*) FROM public.notifications
UNION ALL SELECT 'reviews', count(*) FROM public.reviews
UNION ALL SELECT 'ngo', count(*) FROM public.ngo
UNION ALL SELECT 'shelter_animals', count(*) FROM public.shelter_animals
ORDER BY table_name;

-- Sample data summary
SELECT 'Total sample records created: ' || (
  SELECT sum(record_count) FROM (
    SELECT count(*) as record_count FROM public.profiles
    UNION ALL SELECT count(*) FROM public.user_roles
    UNION ALL SELECT count(*) FROM public.categories
    UNION ALL SELECT count(*) FROM public.products
    UNION ALL SELECT count(*) FROM public.service_providers
    UNION ALL SELECT count(*) FROM public.pets
    UNION ALL SELECT count(*) FROM public.orders
    UNION ALL SELECT count(*) FROM public.bookings
    UNION ALL SELECT count(*) FROM public.ngo
    UNION ALL SELECT count(*) FROM public.shelter_animals
  ) t
) as summary;
