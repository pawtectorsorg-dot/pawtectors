-- ============================================================================
-- QUICK FIX FOR PROFILES EMAIL ISSUE
-- Date: February 10, 2026
-- Description: Quick fix to update the profiles table structure for frontend compatibility
-- ============================================================================

-- Drop existing table if it exists (use with caution in production)
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Recreate profiles table with correct field priority
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL, -- Primary email field for legacy frontend
  email_address TEXT UNIQUE, -- Secondary field, will be auto-synced
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

-- Create the email sync function
CREATE OR REPLACE FUNCTION sync_email_fields()
RETURNS TRIGGER AS $$
BEGIN
  -- Always sync email to email_address (prioritize email for legacy compatibility)
  IF NEW.email IS NOT NULL THEN
    NEW.email_address = NEW.email;
  END IF;
  
  -- If only email_address is provided, copy to email
  IF NEW.email_address IS NOT NULL AND NEW.email IS NULL THEN
    NEW.email = NEW.email_address;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the sync trigger
CREATE TRIGGER sync_profile_emails
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION sync_email_fields();

-- Create indexes
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_profiles_email_address ON public.profiles(email_address);
CREATE INDEX idx_profiles_phone ON public.profiles(phone);
CREATE INDEX idx_profiles_mobile_number ON public.profiles(mobile_number);
CREATE INDEX idx_profiles_city ON public.profiles(city);
CREATE INDEX idx_profiles_is_active ON public.profiles(is_active);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create demo policy
CREATE POLICY "demo_policy_profiles" ON public.profiles FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Grant permissions
GRANT ALL ON public.profiles TO anon, authenticated;

-- Test insert to verify it works
INSERT INTO public.profiles (full_name, email, password, phone) VALUES
('Test User', 'test@example.com', 'password123', '9999999999');

-- Verify the sync worked
SELECT full_name, email, email_address FROM public.profiles WHERE email = 'test@example.com';

-- Clean up test data
DELETE FROM public.profiles WHERE email = 'test@example.com';