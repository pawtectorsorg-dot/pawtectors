-- ============================================================================
-- PAWTECTORS VMP EXTENSIONS
-- Date: August 25, 2026
-- Description: Schema extensions for full Veterinary Management Platform
-- ============================================================================

BEGIN;

-- ============================================================================
-- 1. CLINIC SETTINGS
-- Per-clinic configuration for slot duration, working days, etc.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.clinic_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID REFERENCES public.service_providers(id) ON DELETE CASCADE UNIQUE NOT NULL,
    slot_duration_minutes INTEGER NOT NULL DEFAULT 30,
    advance_booking_days INTEGER NOT NULL DEFAULT 30,
    cancellation_hours INTEGER NOT NULL DEFAULT 24,
    -- Working days: 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
    working_days INTEGER[] NOT NULL DEFAULT ARRAY[1,2,3,4,5],
    break_start TIME,
    break_end TIME,
    auto_confirm_bookings BOOLEAN NOT NULL DEFAULT false,
    max_slots_per_day INTEGER DEFAULT 20,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.clinic_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "demo_policy_clinic_settings"
    ON public.clinic_settings FOR ALL TO anon, authenticated
    USING (true) WITH CHECK (true);

-- ============================================================================
-- 2. CLINIC ↔ PET PARENT RELATIONSHIP
-- Tracks which pet parents belong to which clinic
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.clinic_pet_parents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID REFERENCES public.service_providers(id) ON DELETE CASCADE NOT NULL,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    notes TEXT,
    UNIQUE(provider_id, profile_id)
);

ALTER TABLE public.clinic_pet_parents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "demo_policy_clinic_pet_parents"
    ON public.clinic_pet_parents FOR ALL TO anon, authenticated
    USING (true) WITH CHECK (true);

-- ============================================================================
-- 3. EXTEND BOOKINGS TABLE
-- Add walk-in flag and time_slot reference
-- ============================================================================

ALTER TABLE public.bookings
    ADD COLUMN IF NOT EXISTS is_walk_in BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE public.bookings
    ADD COLUMN IF NOT EXISTS time_slot_id UUID REFERENCES public.time_slots(id) ON DELETE SET NULL;

-- Extend booking status to include walk_in and rescheduled
ALTER TABLE public.bookings DROP CONSTRAINT IF EXISTS bookings_status_check;
ALTER TABLE public.bookings ADD CONSTRAINT bookings_status_check
    CHECK (status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show', 'rescheduled', 'walk_in'));

-- ============================================================================
-- 4. EXTEND BILLS TABLE
-- Add vaccination charges, discount, and notes
-- ============================================================================

ALTER TABLE public.bills
    ADD COLUMN IF NOT EXISTS vaccination_charges DECIMAL(10,2) NOT NULL DEFAULT 0.00;

ALTER TABLE public.bills
    ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00;

ALTER TABLE public.bills
    ADD COLUMN IF NOT EXISTS notes TEXT;

ALTER TABLE public.bills
    ADD COLUMN IF NOT EXISTS doctor_name TEXT;

-- ============================================================================
-- 5. EXTEND MEDICAL RECORDS TABLE
-- Add more clinical detail fields
-- ============================================================================

ALTER TABLE public.medical_records
    ADD COLUMN IF NOT EXISTS chief_complaint TEXT;

ALTER TABLE public.medical_records
    ADD COLUMN IF NOT EXISTS temperature DECIMAL(4,1);

ALTER TABLE public.medical_records
    ADD COLUMN IF NOT EXISTS weight DECIMAL(5,2);

ALTER TABLE public.medical_records
    ADD COLUMN IF NOT EXISTS pulse INTEGER;

ALTER TABLE public.medical_records
    ADD COLUMN IF NOT EXISTS booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL;

-- ============================================================================
-- 6. EXTEND NOTIFICATION TYPES
-- Add medical/vaccination/followup/cancellation types
-- ============================================================================

ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
ALTER TABLE public.notifications ADD CONSTRAINT notifications_type_check
    CHECK (type IN (
        'booking', 'order', 'payment', 'system', 'promotion', 'reminder',
        'medical', 'vaccination', 'followup', 'cancellation', 'walk_in'
    ));

-- ============================================================================
-- 7. ADD CLINIC APPROVAL/STATUS TO SERVICE_PROVIDERS
-- Pawtectors Admin can approve/activate/deactivate clinics
-- ============================================================================

ALTER TABLE public.service_providers
    ADD COLUMN IF NOT EXISTS approval_status TEXT NOT NULL DEFAULT 'approved'
    CHECK (approval_status IN ('pending', 'approved', 'rejected', 'suspended'));

ALTER TABLE public.service_providers
    ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE public.service_providers
    ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE public.service_providers
    ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- ============================================================================
-- 8. EXTEND PETS TABLE
-- Add date_of_birth for age calculation, and photo URL
-- ============================================================================

ALTER TABLE public.pets
    ADD COLUMN IF NOT EXISTS date_of_birth DATE;

ALTER TABLE public.pets
    ADD COLUMN IF NOT EXISTS blood_group TEXT;

ALTER TABLE public.pets
    ADD COLUMN IF NOT EXISTS insurance_number TEXT;

-- ============================================================================
-- 9. VACINATIONS — add vaccinated_by field
-- ============================================================================

ALTER TABLE public.vaccinations
    ADD COLUMN IF NOT EXISTS vaccinated_by TEXT; -- doctor/staff name

ALTER TABLE public.vaccinations
    ADD COLUMN IF NOT EXISTS batch_number TEXT;

-- ============================================================================
-- 10. PRESCRIPTIONS — add end_date field for reminders
-- ============================================================================

ALTER TABLE public.prescriptions
    ADD COLUMN IF NOT EXISTS start_date DATE;

ALTER TABLE public.prescriptions
    ADD COLUMN IF NOT EXISTS end_date DATE;

ALTER TABLE public.prescriptions
    ADD COLUMN IF NOT EXISTS reminder_enabled BOOLEAN NOT NULL DEFAULT false;

-- ============================================================================
-- 11. PAYMENT — link to bill
-- ============================================================================

ALTER TABLE public.payments
    ADD COLUMN IF NOT EXISTS bill_id UUID REFERENCES public.bills(id) ON DELETE SET NULL;

-- ============================================================================
-- 12. INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_clinic_settings_provider ON public.clinic_settings(provider_id);
CREATE INDEX IF NOT EXISTS idx_clinic_pet_parents_provider ON public.clinic_pet_parents(provider_id);
CREATE INDEX IF NOT EXISTS idx_clinic_pet_parents_profile ON public.clinic_pet_parents(profile_id);
CREATE INDEX IF NOT EXISTS idx_bookings_walk_in ON public.bookings(is_walk_in);
CREATE INDEX IF NOT EXISTS idx_bookings_time_slot ON public.bookings(time_slot_id);
CREATE INDEX IF NOT EXISTS idx_medical_records_booking ON public.medical_records(booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_bill ON public.payments(bill_id);
CREATE INDEX IF NOT EXISTS idx_service_providers_approval ON public.service_providers(approval_status);

-- ============================================================================
-- 13. TRIGGERS FOR UPDATED_AT
-- ============================================================================

CREATE TRIGGER update_clinic_settings_updated_at
    BEFORE UPDATE ON public.clinic_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 14. GRANT PERMISSIONS
-- ============================================================================

GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

COMMIT;
