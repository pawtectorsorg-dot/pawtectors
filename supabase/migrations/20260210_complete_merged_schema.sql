    -- ============================================================================
    -- PAWTECTORS DATABASE - COMPLETE MERGED SCHEMA
    -- Date: February 10, 2026
    -- Description: Consolidated migration with all table schemas and modifications
    -- ============================================================================

    BEGIN;

    -- ============================================================================
    -- 0. DROP ALL EXISTING TABLES (IF ANY)
    -- ============================================================================
    -- ============================================================================
    -- 1. AUTHENTICATION & USERS
    -- ============================================================================

    -- Profiles - Primary user/customer table
    CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    phone TEXT,
    mobile_number TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    pincode TEXT,
    preferred_location TEXT,
    avatar_url TEXT DEFAULT 'https://images.unsplash.com/photo-1494790108755-2616c96d1cb4?w=150',
    date_of_birth DATE,
    gender TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    phone_verified BOOLEAN DEFAULT false,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    );

    -- User Roles - Role assignment (admin, provider, customer)
    CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('admin', 'provider', 'customer')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(profile_id, role)
    );

    -- ============================================================================
    -- 2. SERVICE PROVIDERS (Clinics, Grooming, Boarding, Training)
    -- ============================================================================

    CREATE TABLE public.service_providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    business_registration_number TEXT,
    category TEXT NOT NULL CHECK (category IN ('clinic', 'grooming', 'boarding', 'training', 'pet-shop')),
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    pincode TEXT NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    phone TEXT NOT NULL,
    email TEXT,
    website TEXT,
    description TEXT,
    image TEXT DEFAULT 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=800',
    gallery_images TEXT[], -- Array of image URLs
    open_time TEXT DEFAULT '9:00 AM',
    close_time TEXT DEFAULT '6:00 PM',
    price_range TEXT DEFAULT '' CHECK (price_range IN ('', '₹', '₹₹', '₹₹₹', '₹₹₹₹')),
    rating DECIMAL(3, 2) DEFAULT 4.5 CHECK (rating >= 0 AND rating <= 5),
    review_count INTEGER DEFAULT 0,
    is_verified BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    license_number TEXT,
    license_expiry DATE,
    emergency_services BOOLEAN DEFAULT false,
    home_visit_available BOOLEAN DEFAULT false,
    online_consultation BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    );

    -- Provider Services - Individual services offered by a provider
    CREATE TABLE public.provider_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID REFERENCES public.service_providers(id) ON DELETE CASCADE NOT NULL,
    service_name TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(provider_id, service_name)
    );

    -- Provider Availability - Schedule management
    CREATE TABLE public.provider_availability (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID REFERENCES public.service_providers(id) ON DELETE CASCADE NOT NULL,
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(provider_id, day_of_week)
    );

    -- Service Pricing - Detailed pricing
    CREATE TABLE public.service_pricing (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID REFERENCES public.service_providers(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    price DECIMAL(10, 2) NOT NULL CHECK (price > 0),
    duration_minutes INTEGER,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    );

    -- ============================================================================
    -- 3. E-COMMERCE (Pet Shop Products)
    -- ============================================================================

    CREATE TABLE public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    icon TEXT,
    image TEXT DEFAULT 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400',
    parent_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    sort_order INTEGER DEFAULT 0,
    meta_title TEXT,
    meta_description TEXT,
    is_featured BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    );

    CREATE TABLE public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    short_description TEXT,
    price DECIMAL(10, 2) NOT NULL CHECK (price > 0),
    sale_price DECIMAL(10, 2) CHECK (sale_price >= 0),
    cost_price DECIMAL(10, 2),
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    category TEXT NOT NULL, -- Keep for backward compatibility
    sku TEXT UNIQUE,
    barcode TEXT,
    weight DECIMAL(10, 3),
    dimensions TEXT, -- JSON string: {"length": 10, "width": 5, "height": 2}
    image TEXT DEFAULT 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400',
    gallery_images TEXT[], -- Array of image URLs
    stock INTEGER DEFAULT 0 CHECK (stock >= 0),
    min_stock_level INTEGER DEFAULT 5,
    max_stock_level INTEGER DEFAULT 1000,
    brand TEXT,
    model TEXT,
    color TEXT,
    size TEXT,
    material TEXT,
    age_group TEXT CHECK (age_group IN ('puppy', 'adult', 'senior', 'all')),
    pet_type TEXT[] DEFAULT ARRAY['dog', 'cat'], -- Array for multiple pet types
    rating DECIMAL(3, 2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
    review_count INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    is_digital BOOLEAN DEFAULT false,
    requires_shipping BOOLEAN DEFAULT true,
    shipping_class TEXT,
    tax_class TEXT DEFAULT 'standard',
    meta_title TEXT,
    meta_description TEXT,
    is_active BOOLEAN DEFAULT true,
    admin_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    );

    -- ============================================================================
    -- 4. CART SYSTEM & ADDITIONAL E-COMMERCE FEATURES
    -- ============================================================================

    CREATE TABLE public.cart (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(profile_id, product_id)
    );

    -- Wishlist/Favorites
    CREATE TABLE public.wishlist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    service_provider_id UUID REFERENCES public.service_providers(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(profile_id, product_id),
    UNIQUE(profile_id, service_provider_id),
    CHECK (
        (product_id IS NOT NULL AND service_provider_id IS NULL) OR
        (product_id IS NULL AND service_provider_id IS NOT NULL)
    )
    );

    -- Product Attributes (for variants like size, color, etc.)
    CREATE TABLE public.product_attributes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    attribute_name TEXT NOT NULL, -- e.g., 'size', 'color', 'flavor'
    attribute_value TEXT NOT NULL, -- e.g., 'large', 'red', 'chicken'
    price_adjustment DECIMAL(10, 2) DEFAULT 0,
    stock_adjustment INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(product_id, attribute_name, attribute_value)
    );

    -- Delivery Zones
    CREATE TABLE public.delivery_zones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    cities TEXT[] NOT NULL, -- Array of city names
    states TEXT[] NOT NULL, -- Array of state names
    pincodes TEXT[], -- Array of pincodes
    delivery_fee DECIMAL(10, 2) DEFAULT 0,
    free_delivery_threshold DECIMAL(10, 2),
    estimated_delivery_days INTEGER DEFAULT 3,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    );

    -- ============================================================================
    -- 5. ORDERS (E-Commerce Orders)
    -- ============================================================================

    CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
    payment_status TEXT NOT NULL DEFAULT 'pending'
        CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    );

    CREATE TABLE public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price DECIMAL(10, 2) NOT NULL,
    product_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    );

    -- Shipping Addresses
    CREATE TABLE public.shipping_addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    address_line1 TEXT NOT NULL,
    address_line2 TEXT,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    pincode TEXT NOT NULL,
    landmark TEXT,
    address_type TEXT DEFAULT 'home' CHECK (address_type IN ('home', 'work', 'other')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(order_id)
    );

    -- Billing Addresses
    CREATE TABLE public.billing_addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    address_line1 TEXT NOT NULL,
    address_line2 TEXT,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    pincode TEXT NOT NULL,
    landmark TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(order_id)
    );

    -- ============================================================================
    -- 6. BOOKINGS, PAYMENTS & NOTIFICATIONS
    -- ============================================================================

    -- Pet Information
    CREATE TABLE public.pets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('dog', 'cat', 'bird', 'rabbit', 'hamster', 'fish', 'other')),
    breed TEXT,
    age_months INTEGER,
    weight DECIMAL(5, 2),
    gender TEXT CHECK (gender IN ('male', 'female', 'unknown')),
    color TEXT,
    microchip_id TEXT,
    vaccination_status TEXT,
    medical_conditions TEXT,
    allergies TEXT,
    special_instructions TEXT,
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    );

    CREATE TABLE public.bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    provider_id UUID REFERENCES public.service_providers(id),
    pet_id UUID REFERENCES public.pets(id) ON DELETE SET NULL,
    service_category TEXT,
    service_name TEXT,
    pet_name TEXT NOT NULL, -- Keep for backward compatibility
    pet_type TEXT NOT NULL,
    owner_name TEXT NOT NULL,
    owner_email TEXT NOT NULL,
    owner_phone TEXT NOT NULL,
    booking_date DATE NOT NULL,
    booking_time TEXT NOT NULL,
    end_time TEXT,
    notes TEXT,
    special_requirements TEXT,
    status TEXT NOT NULL DEFAULT 'pending' 
        CHECK (status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show')),
    cancellation_reason TEXT,
    amount DECIMAL(10, 2),
    discount_amount DECIMAL(10, 2) DEFAULT 0,
    final_amount DECIMAL(10, 2),
    service_pricing_id UUID REFERENCES public.service_pricing(id),
    reminder_sent BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    );

    -- Notifications System
    CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('booking', 'order', 'payment', 'system', 'promotion', 'reminder')),
    data JSONB, -- Additional data for the notification
    is_read BOOLEAN DEFAULT false,
    is_sent BOOLEAN DEFAULT false,
    sent_at TIMESTAMP WITH TIME ZONE,
    read_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    );

    CREATE TABLE public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    payment_method TEXT NOT NULL CHECK (payment_method IN ('razorpay', 'paytm', 'gpay', 'phonepe', 'cash', 'card')),
    payment_gateway TEXT,
    gateway_transaction_id TEXT,
    razorpay_order_id TEXT,
    razorpay_payment_id TEXT,
    razorpay_signature TEXT,
    amount DECIMAL(10, 2) NOT NULL,
    currency TEXT DEFAULT 'INR',
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed', 'refunded')),
    failure_reason TEXT,
    refund_amount DECIMAL(10, 2),
    refund_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    );

    -- ============================================================================
    -- 7. REVIEWS
    -- ============================================================================

    CREATE TABLE public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    service_provider_id UUID REFERENCES public.service_providers(id) ON DELETE SET NULL,
    booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    is_verified_purchase BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    );

    -- ============================================================================
    -- 8. NGO & ANIMAL SHELTER
    -- ============================================================================

    CREATE TABLE public.ngo (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    pincode TEXT,
    phone TEXT,
    email TEXT,
    website TEXT,
    image_url TEXT,
    mission_statement TEXT,
    animals_count INTEGER DEFAULT 0,
    adoption_count INTEGER DEFAULT 0,
    rating DECIMAL(3, 2) DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    founded_year INTEGER,
    volunteer_count INTEGER DEFAULT 0,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    is_verified BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    );

    CREATE TABLE public.shelter_animals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ngo_id UUID REFERENCES public.ngo(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('dog', 'cat', 'bird', 'rabbit', 'other')),
    breed TEXT,
    age_months INTEGER,
    gender TEXT CHECK (gender IN ('male', 'female', 'unknown')),
    description TEXT,
    image_url TEXT,
    health_status TEXT,
    vaccination_status TEXT,
    neutered_spayed BOOLEAN DEFAULT false,
    adoption_status TEXT NOT NULL DEFAULT 'available'
        CHECK (adoption_status IN ('available', 'adopted', 'pending')),
    admission_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    );

    -- ============================================================================
    -- 9. INDEXES FOR PERFORMANCE
    -- ============================================================================

    -- Profiles indexes
    CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
    CREATE INDEX IF NOT EXISTS idx_profiles_phone ON public.profiles(phone);
    CREATE INDEX IF NOT EXISTS idx_profiles_mobile_number ON public.profiles(mobile_number);
    CREATE INDEX IF NOT EXISTS idx_profiles_city ON public.profiles(city);
    CREATE INDEX IF NOT EXISTS idx_profiles_state ON public.profiles(state);
    CREATE INDEX IF NOT EXISTS idx_profiles_pincode ON public.profiles(pincode);
    CREATE INDEX IF NOT EXISTS idx_profiles_preferred_location ON public.profiles(preferred_location);
    CREATE INDEX IF NOT EXISTS idx_profiles_is_active ON public.profiles(is_active);

    -- User roles indexes
    CREATE INDEX IF NOT EXISTS idx_user_roles_profile_id ON public.user_roles(profile_id);
    CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);

    -- Service providers indexes
    CREATE INDEX IF NOT EXISTS idx_service_providers_category ON public.service_providers(category);
    CREATE INDEX IF NOT EXISTS idx_service_providers_city ON public.service_providers(city);
    CREATE INDEX IF NOT EXISTS idx_service_providers_state ON public.service_providers(state);
    CREATE INDEX IF NOT EXISTS idx_service_providers_pincode ON public.service_providers(pincode);
    CREATE INDEX IF NOT EXISTS idx_service_providers_is_verified ON public.service_providers(is_verified);
    CREATE INDEX IF NOT EXISTS idx_service_providers_is_active ON public.service_providers(is_active);
    CREATE INDEX IF NOT EXISTS idx_service_providers_rating ON public.service_providers(rating);
    CREATE INDEX IF NOT EXISTS idx_service_providers_location ON public.service_providers(latitude, longitude);

    -- Provider services indexes
    CREATE INDEX IF NOT EXISTS idx_provider_services_provider_id ON public.provider_services(provider_id);
    CREATE INDEX IF NOT EXISTS idx_provider_services_is_active ON public.provider_services(is_active);

    -- Provider availability indexes
    CREATE INDEX IF NOT EXISTS idx_provider_availability_provider_id ON public.provider_availability(provider_id);
    CREATE INDEX IF NOT EXISTS idx_provider_availability_day ON public.provider_availability(day_of_week);

    -- Service pricing indexes
    CREATE INDEX IF NOT EXISTS idx_service_pricing_provider_id ON public.service_pricing(provider_id);
    CREATE INDEX IF NOT EXISTS idx_service_pricing_is_active ON public.service_pricing(is_active);

    -- Categories indexes
    CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);
    CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON public.categories(parent_id);
    CREATE INDEX IF NOT EXISTS idx_categories_is_active ON public.categories(is_active);
    CREATE INDEX IF NOT EXISTS idx_categories_is_featured ON public.categories(is_featured);

    -- Products indexes
    CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
    CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
    CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products(category_id);
    CREATE INDEX IF NOT EXISTS idx_products_sku ON public.products(sku);
    CREATE INDEX IF NOT EXISTS idx_products_brand ON public.products(brand);
    CREATE INDEX IF NOT EXISTS idx_products_price ON public.products(price);
    CREATE INDEX IF NOT EXISTS idx_products_sale_price ON public.products(sale_price);
    CREATE INDEX IF NOT EXISTS idx_products_is_featured ON public.products(is_featured);
    CREATE INDEX IF NOT EXISTS idx_products_is_active ON public.products(is_active);
    CREATE INDEX IF NOT EXISTS idx_products_stock ON public.products(stock);
    CREATE INDEX IF NOT EXISTS idx_products_rating ON public.products(rating);
    CREATE INDEX IF NOT EXISTS idx_products_admin_id ON public.products(admin_id);
    CREATE INDEX IF NOT EXISTS idx_products_pet_type ON public.products USING GIN(pet_type);

    -- Cart indexes
    CREATE INDEX IF NOT EXISTS idx_cart_profile_id ON public.cart(profile_id);
    CREATE INDEX IF NOT EXISTS idx_cart_product_id ON public.cart(product_id);

    -- Wishlist indexes
    CREATE INDEX IF NOT EXISTS idx_wishlist_profile_id ON public.wishlist(profile_id);
    CREATE INDEX IF NOT EXISTS idx_wishlist_product_id ON public.wishlist(product_id);
    CREATE INDEX IF NOT EXISTS idx_wishlist_service_provider_id ON public.wishlist(service_provider_id);

    -- Product attributes indexes
    CREATE INDEX IF NOT EXISTS idx_product_attributes_product_id ON public.product_attributes(product_id);
    CREATE INDEX IF NOT EXISTS idx_product_attributes_name ON public.product_attributes(attribute_name);

    -- Delivery zones indexes
    CREATE INDEX IF NOT EXISTS idx_delivery_zones_is_active ON public.delivery_zones(is_active);
    CREATE INDEX IF NOT EXISTS idx_delivery_zones_cities ON public.delivery_zones USING GIN(cities);
    CREATE INDEX IF NOT EXISTS idx_delivery_zones_states ON public.delivery_zones USING GIN(states);
    CREATE INDEX IF NOT EXISTS idx_delivery_zones_pincodes ON public.delivery_zones USING GIN(pincodes);

    -- Orders indexes
    CREATE INDEX IF NOT EXISTS idx_orders_profile_id ON public.orders(profile_id);
    CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
    CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON public.orders(payment_status);
    CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at);

    -- Order items indexes
    CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
    CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON public.order_items(product_id);

    -- Address indexes
    CREATE INDEX IF NOT EXISTS idx_shipping_addresses_order_id ON public.shipping_addresses(order_id);
    CREATE INDEX IF NOT EXISTS idx_billing_addresses_order_id ON public.billing_addresses(order_id);

    -- Pets indexes
    CREATE INDEX IF NOT EXISTS idx_pets_profile_id ON public.pets(profile_id);
    CREATE INDEX IF NOT EXISTS idx_pets_type ON public.pets(type);
    CREATE INDEX IF NOT EXISTS idx_pets_is_active ON public.pets(is_active);

    -- Bookings indexes
    CREATE INDEX IF NOT EXISTS idx_bookings_profile_id ON public.bookings(profile_id);
    CREATE INDEX IF NOT EXISTS idx_bookings_provider_id ON public.bookings(provider_id);
    CREATE INDEX IF NOT EXISTS idx_bookings_pet_id ON public.bookings(pet_id);
    CREATE INDEX IF NOT EXISTS idx_bookings_date ON public.bookings(booking_date);
    CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);
    CREATE INDEX IF NOT EXISTS idx_bookings_service_category ON public.bookings(service_category);

    -- Notifications indexes
    CREATE INDEX IF NOT EXISTS idx_notifications_profile_id ON public.notifications(profile_id);
    CREATE INDEX IF NOT EXISTS idx_notifications_type ON public.notifications(type);
    CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
    CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at);

    -- Payments indexes
    CREATE INDEX IF NOT EXISTS idx_payments_profile_id ON public.payments(profile_id);
    CREATE INDEX IF NOT EXISTS idx_payments_booking_id ON public.payments(booking_id);
    CREATE INDEX IF NOT EXISTS idx_payments_order_id ON public.payments(order_id);
    CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
    CREATE INDEX IF NOT EXISTS idx_payments_payment_method ON public.payments(payment_method);

    -- Reviews indexes
    CREATE INDEX IF NOT EXISTS idx_reviews_profile_id ON public.reviews(profile_id);
    CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON public.reviews(product_id);
    CREATE INDEX IF NOT EXISTS idx_reviews_service_provider_id ON public.reviews(service_provider_id);
    CREATE INDEX IF NOT EXISTS idx_reviews_rating ON public.reviews(rating);
    CREATE INDEX IF NOT EXISTS idx_reviews_is_verified ON public.reviews(is_verified_purchase);

    -- NGO indexes
    CREATE INDEX IF NOT EXISTS idx_ngo_city ON public.ngo(city);
    CREATE INDEX IF NOT EXISTS idx_ngo_state ON public.ngo(state);
    CREATE INDEX IF NOT EXISTS idx_ngo_is_verified ON public.ngo(is_verified);
    CREATE INDEX IF NOT EXISTS idx_ngo_is_active ON public.ngo(is_active);
    CREATE INDEX IF NOT EXISTS idx_ngo_location ON public.ngo(latitude, longitude);

    -- Shelter animals indexes
    CREATE INDEX IF NOT EXISTS idx_shelter_animals_ngo_id ON public.shelter_animals(ngo_id);
    CREATE INDEX IF NOT EXISTS idx_shelter_animals_type ON public.shelter_animals(type);
    CREATE INDEX IF NOT EXISTS idx_shelter_animals_status ON public.shelter_animals(adoption_status);
    CREATE INDEX IF NOT EXISTS idx_shelter_animals_gender ON public.shelter_animals(gender);

    -- ============================================================================
    -- 10. HELPER FUNCTIONS
    -- ============================================================================

    -- Function to automatically update updated_at timestamp
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
    NEW.updated_at = now();
    RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    -- Function to get all services for a provider
    CREATE OR REPLACE FUNCTION get_provider_services(provider_uuid UUID)
    RETURNS TABLE(service_name TEXT) AS $$
    BEGIN
    RETURN QUERY
    SELECT ps.service_name
    FROM public.provider_services ps
    WHERE ps.provider_id = provider_uuid
        AND ps.is_active = true
    ORDER BY ps.service_name;
    END;
    $$ LANGUAGE plpgsql;

    -- Function to get all pricing for a provider
    CREATE OR REPLACE FUNCTION get_provider_pricing(provider_uuid UUID)
    RETURNS TABLE(
    id UUID,
    name TEXT,
    price DECIMAL,
    duration_minutes INTEGER,
    description TEXT
    ) AS $$
    BEGIN
    RETURN QUERY
    SELECT 
        sp.id,
        sp.name,
        sp.price,
        sp.duration_minutes,
        sp.description
    FROM public.service_pricing sp
    WHERE sp.provider_id = provider_uuid
        AND sp.is_active = true
    ORDER BY sp.price;
    END;
    $$ LANGUAGE plpgsql;

    -- Function for frontend profile operations
    CREATE OR REPLACE FUNCTION get_profile_by_email(user_email TEXT)
    RETURNS TABLE(
    id UUID,
    full_name TEXT,
    email TEXT,
    phone TEXT,
    mobile_number TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    pincode TEXT,
    preferred_location TEXT,
    avatar_url TEXT,
    is_active BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE
    ) AS $$
    BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.full_name,
        p.email,
        p.phone,
        p.mobile_number,
        p.address,
        p.city,
        p.state,
        p.pincode,
        p.preferred_location,
        p.avatar_url,
        p.is_active,
        p.created_at
    FROM public.profiles p
    WHERE p.email = user_email
        AND p.is_active = true;
    END;
    $$ LANGUAGE plpgsql;

    -- ============================================================================
    -- 12. TRIGGERS FOR UPDATED_AT
    -- ============================================================================

    -- Add triggers for updated_at
    CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

    CREATE TRIGGER update_user_roles_updated_at
    BEFORE UPDATE ON public.user_roles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

    CREATE TRIGGER update_service_providers_updated_at
    BEFORE UPDATE ON public.service_providers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

    CREATE TRIGGER update_service_pricing_updated_at
    BEFORE UPDATE ON public.service_pricing
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

    CREATE TRIGGER update_categories_updated_at
    BEFORE UPDATE ON public.categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

    CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

    CREATE TRIGGER update_cart_updated_at
    BEFORE UPDATE ON public.cart
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

    CREATE TRIGGER update_delivery_zones_updated_at
    BEFORE UPDATE ON public.delivery_zones
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

    CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

    CREATE TRIGGER update_pets_updated_at
    BEFORE UPDATE ON public.pets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

    CREATE TRIGGER update_bookings_updated_at
    BEFORE UPDATE ON public.bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

    CREATE TRIGGER update_payments_updated_at
    BEFORE UPDATE ON public.payments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

    CREATE TRIGGER update_reviews_updated_at
    BEFORE UPDATE ON public.reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

    CREATE TRIGGER update_ngo_updated_at
    BEFORE UPDATE ON public.ngo
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

    CREATE TRIGGER update_shelter_animals_updated_at
    BEFORE UPDATE ON public.shelter_animals
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

    -- ============================================================================
    -- 13. ROW LEVEL SECURITY (RLS) - DEMO FRIENDLY POLICIES
    -- ============================================================================

    -- Enable RLS on all tables
    ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.service_providers ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.provider_services ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.provider_availability ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.service_pricing ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.cart ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.product_attributes ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.delivery_zones ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.shipping_addresses ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.billing_addresses ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.pets ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.ngo ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.shelter_animals ENABLE ROW LEVEL SECURITY;

    -- Create permissive policies for demo/development
    CREATE POLICY "demo_policy_profiles" ON public.profiles FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
    CREATE POLICY "demo_policy_user_roles" ON public.user_roles FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
    CREATE POLICY "demo_policy_service_providers" ON public.service_providers FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
    CREATE POLICY "demo_policy_provider_services" ON public.provider_services FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
    CREATE POLICY "demo_policy_provider_availability" ON public.provider_availability FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
    CREATE POLICY "demo_policy_service_pricing" ON public.service_pricing FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
    CREATE POLICY "demo_policy_categories" ON public.categories FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
    CREATE POLICY "demo_policy_products" ON public.products FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
    CREATE POLICY "demo_policy_cart" ON public.cart FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
    CREATE POLICY "demo_policy_wishlist" ON public.wishlist FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
    CREATE POLICY "demo_policy_product_attributes" ON public.product_attributes FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
    CREATE POLICY "demo_policy_delivery_zones" ON public.delivery_zones FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
    CREATE POLICY "demo_policy_orders" ON public.orders FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
    CREATE POLICY "demo_policy_order_items" ON public.order_items FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
    CREATE POLICY "demo_policy_shipping_addresses" ON public.shipping_addresses FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
    CREATE POLICY "demo_policy_billing_addresses" ON public.billing_addresses FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
    CREATE POLICY "demo_policy_pets" ON public.pets FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
    CREATE POLICY "demo_policy_bookings" ON public.bookings FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
    CREATE POLICY "demo_policy_notifications" ON public.notifications FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
    CREATE POLICY "demo_policy_payments" ON public.payments FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
    CREATE POLICY "demo_policy_reviews" ON public.reviews FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
    CREATE POLICY "demo_policy_ngo" ON public.ngo FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
    CREATE POLICY "demo_policy_shelter_animals" ON public.shelter_animals FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

    -- Grant permissions
    GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
    GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
    GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

    -- Additional grants for specific functions
    GRANT EXECUTE ON FUNCTION get_profile_by_email(TEXT) TO anon, authenticated;
    GRANT EXECUTE ON FUNCTION get_provider_services(UUID) TO anon, authenticated;
    GRANT EXECUTE ON FUNCTION get_provider_pricing(UUID) TO anon, authenticated;

    COMMIT;

    -- ============================================================================
    -- VERIFICATION - Check that all tables were created
    -- ============================================================================

    SELECT 
    schemaname,
    tablename,
    tableowner,
    hasindexes,
    hasrules,
    hastriggers
    FROM pg_tables 
    WHERE schemaname = 'public'
    ORDER BY tablename;

    -- Table count verification
    SELECT 'Total tables created: ' || count(*) as table_summary
    FROM pg_tables 
    WHERE schemaname = 'public';