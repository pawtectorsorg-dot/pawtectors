-- Pawtectors - Veterinary clinic management schema extensions
-- Date: August 21, 2026

BEGIN;

-- Link service provider (clinic) to a profile user account
ALTER TABLE public.service_providers ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

-- 1. Medical Records
CREATE TABLE IF NOT EXISTS public.medical_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pet_id UUID REFERENCES public.pets(id) ON DELETE CASCADE NOT NULL,
    provider_id UUID REFERENCES public.service_providers(id) ON DELETE CASCADE NOT NULL,
    consultation_date DATE NOT NULL DEFAULT CURRENT_DATE,
    diagnosis TEXT,
    treatment TEXT,
    follow_up_date DATE,
    doctor_notes TEXT,
    doctor_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS & permissive policies for demo
ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "demo_policy_medical_records" ON public.medical_records FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- 2. Prescriptions
CREATE TABLE IF NOT EXISTS public.prescriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    medical_record_id UUID REFERENCES public.medical_records(id) ON DELETE CASCADE NOT NULL,
    medicine_name TEXT NOT NULL,
    dosage TEXT NOT NULL,
    frequency TEXT NOT NULL,
    duration TEXT NOT NULL,
    instructions TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS & permissive policies for demo
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "demo_policy_prescriptions" ON public.prescriptions FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- 3. Vaccinations
CREATE TABLE IF NOT EXISTS public.vaccinations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pet_id UUID REFERENCES public.pets(id) ON DELETE CASCADE NOT NULL,
    provider_id UUID REFERENCES public.service_providers(id) ON DELETE CASCADE NOT NULL,
    vaccine_name TEXT NOT NULL,
    date_given DATE NOT NULL DEFAULT CURRENT_DATE,
    next_due_date DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS & permissive policies for demo
ALTER TABLE public.vaccinations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "demo_policy_vaccinations" ON public.vaccinations FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- 4. Time Slots
CREATE TABLE IF NOT EXISTS public.time_slots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID REFERENCES public.service_providers(id) ON DELETE CASCADE NOT NULL,
    slot_date DATE NOT NULL,
    slot_time TEXT NOT NULL,     -- e.g., "10:30 AM"
    status TEXT NOT NULL CHECK (status IN ('available', 'booked', 'blocked')) DEFAULT 'available',
    booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(provider_id, slot_date, slot_time)
);

-- Enable RLS & permissive policies for demo
ALTER TABLE public.time_slots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "demo_policy_time_slots" ON public.time_slots FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- 5. Bills (Invoicing)
CREATE TABLE IF NOT EXISTS public.bills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
    provider_id UUID REFERENCES public.service_providers(id) ON DELETE CASCADE NOT NULL,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL, -- Pet Parent
    pet_id UUID REFERENCES public.pets(id) ON DELETE SET NULL,
    bill_date DATE NOT NULL DEFAULT CURRENT_DATE,
    consultation_charges DECIMAL(10, 2) DEFAULT 0.00,
    treatment_charges DECIMAL(10, 2) DEFAULT 0.00,
    medicine_charges DECIMAL(10, 2) DEFAULT 0.00,
    other_charges DECIMAL(10, 2) DEFAULT 0.00,
    tax_amount DECIMAL(10, 2) DEFAULT 0.00,
    total_amount DECIMAL(10, 2) NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('unpaid', 'paid', 'cancelled')) DEFAULT 'unpaid',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS & permissive policies for demo
ALTER TABLE public.bills ENABLE ROW LEVEL SECURITY;
CREATE POLICY "demo_policy_bills" ON public.bills FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_medical_records_pet_id ON public.medical_records(pet_id);
CREATE INDEX IF NOT EXISTS idx_medical_records_provider_id ON public.medical_records(provider_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_record_id ON public.prescriptions(medical_record_id);
CREATE INDEX IF NOT EXISTS idx_vaccinations_pet_id ON public.vaccinations(pet_id);
CREATE INDEX IF NOT EXISTS idx_time_slots_provider_date ON public.time_slots(provider_id, slot_date);
CREATE INDEX IF NOT EXISTS idx_bills_provider_id ON public.bills(provider_id);
CREATE INDEX IF NOT EXISTS idx_bills_profile_id ON public.bills(profile_id);

GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;

COMMIT;
