-- ============================================================================
-- QUICK DATABASE SCHEMA - SINGLE EMAIL FIELD
-- Date: February 10, 2026
-- Description: Clean schema with single email field - no duplicates
-- ============================================================================

-- Drop existing tables if they exist (use with caution in production)
DROP TABLE IF EXISTS public.user_roles CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Create clean profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  mobile_number TEXT,  -- Changed from phone to mobile_number for frontend compatibility
  address TEXT,
  city TEXT,
  state TEXT,
  pincode TEXT,
  preferred_location TEXT,
  avatar_url TEXT DEFAULT 'https://images.unsplash.com/photo-1494790108755-2616c96d1cb4?w=150',
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
  is_active BOOLEAN DEFAULT true,
  email_verified BOOLEAN DEFAULT true,
  phone_verified BOOLEAN DEFAULT true,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'provider', 'customer')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(profile_id, role)
);

-- Create indexes
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_profiles_mobile_number ON public.profiles(mobile_number);
CREATE INDEX idx_profiles_city ON public.profiles(city);
CREATE INDEX idx_profiles_is_active ON public.profiles(is_active);
CREATE INDEX idx_user_roles_profile_id ON public.user_roles(profile_id);

-- Create update function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_roles_updated_at
  BEFORE UPDATE ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create demo policies
CREATE POLICY "demo_policy_profiles" ON public.profiles FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "demo_policy_user_roles" ON public.user_roles FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Grant permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Create compatibility view for frontend that expects email_address
CREATE OR REPLACE VIEW public.profiles_view AS
SELECT 
  id,
  full_name,
  email,
  email as email_address, -- Alias for frontend compatibility
  password,
  mobile_number,
  address,
  city,
  state,
  pincode,
  preferred_location,
  avatar_url,
  date_of_birth,
  gender,
  is_active,
  email_verified,
  phone_verified,
  last_login,
  created_at,
  updated_at
FROM public.profiles;

-- Grant access to view
GRANT ALL ON public.profiles_view TO anon, authenticated;

-- Create instead-of triggers for insert/update/delete on view
CREATE OR REPLACE FUNCTION handle_profiles_view_insert()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    full_name, email, password, mobile_number, address, 
    city, state, pincode, preferred_location, avatar_url, 
    date_of_birth, gender, is_active
  ) VALUES (
    NEW.full_name, 
    COALESCE(NEW.email_address, NEW.email), -- Use email_address if provided, otherwise email
    NEW.password, 
    NEW.mobile_number, 
    NEW.address,
    NEW.city, 
    NEW.state, 
    NEW.pincode, 
    NEW.preferred_location, 
    NEW.avatar_url,
    NEW.date_of_birth, 
    NEW.gender, 
    NEW.is_active
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_view_insert_trigger
  INSTEAD OF INSERT ON public.profiles_view
  FOR EACH ROW
  EXECUTE FUNCTION handle_profiles_view_insert();

-- Function to handle updates to the profiles_view  
CREATE OR REPLACE FUNCTION handle_profiles_view_update()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles SET 
    full_name = NEW.full_name,
    email = COALESCE(NEW.email_address, NEW.email), -- Use email_address if provided, otherwise email
    password = NEW.password,
    mobile_number = NEW.mobile_number,
    address = NEW.address,
    city = NEW.city,
    state = NEW.state,
    pincode = NEW.pincode,
    preferred_location = NEW.preferred_location,
    avatar_url = NEW.avatar_url,
    date_of_birth = NEW.date_of_birth,
    gender = NEW.gender,
    is_active = NEW.is_active,
    updated_at = now()
  WHERE id = OLD.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_view_update_trigger
  INSTEAD OF UPDATE ON public.profiles_view
  FOR EACH ROW
  EXECUTE FUNCTION handle_profiles_view_update();

-- Enable RLS on view  
ALTER TABLE public.profiles_view ENABLE ROW LEVEL SECURITY;
CREATE POLICY "demo_policy_profiles_view" ON public.profiles_view FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Test insert
INSERT INTO public.profiles (full_name, email, password, mobile_number) VALUES
('Test User', 'test@example.com', 'password123', '9999999999');

-- Insert role
INSERT INTO public.user_roles (profile_id, role) 
SELECT id, 'customer' FROM public.profiles WHERE email = 'test@example.com';

-- Verify
SELECT p.full_name, p.email, ur.role FROM public.profiles p 
LEFT JOIN public.user_roles ur ON p.id = ur.profile_id 
WHERE p.email = 'test@example.com';

-- Clean up
DELETE FROM public.user_roles WHERE profile_id IN (SELECT id FROM public.profiles WHERE email = 'test@example.com');
DELETE FROM public.profiles WHERE email = 'test@example.com';