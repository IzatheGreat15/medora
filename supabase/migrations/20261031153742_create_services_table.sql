
-- Create service status enum
CREATE TYPE public.service_status AS ENUM ('Active', 'Inactive');

-- Create services table
CREATE TABLE public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  clinic_id UUID NOT NULL
    REFERENCES public.clinics(id) ON DELETE CASCADE,

  name TEXT NOT NULL,
  duration INTEGER NOT NULL,
  rate NUMERIC(10, 2) NOT NULL DEFAULT 0,
  status public.service_status NOT NULL DEFAULT 'Active',

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  created_by UUID REFERENCES public.staff(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES public.staff(id) ON DELETE SET NULL,

  CONSTRAINT services_name_not_empty
    CHECK (LENGTH(TRIM(name)) > 0),

  CONSTRAINT services_duration_positive
    CHECK (duration > 0),

  CONSTRAINT services_rate_non_negative
    CHECK (rate >= 0),

  CONSTRAINT services_clinic_name_unique
    UNIQUE (clinic_id, name)
);

-- Indexes
CREATE INDEX idx_services_clinic_id
  ON public.services(clinic_id);

CREATE INDEX idx_services_clinic_status
  ON public.services(clinic_id, status);

-- Enable Row Level Security
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- Clinic users can view services belonging to their clinic
CREATE POLICY "Clinic users can view their own services"
ON public.services
FOR SELECT
TO authenticated
USING (
  clinic_id = (
    SELECT s.clinic_id
    FROM public.staff AS s
    WHERE s.id = (SELECT auth.uid())
      AND s.role = 'clinic_user'
      AND s.clinic_role IN ('owner', 'manager', 'staff')
  )
);

-- Automatically update updated_at
CREATE OR REPLACE FUNCTION public.set_services_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER services_set_updated_at
BEFORE UPDATE ON public.services
FOR EACH ROW
EXECUTE FUNCTION public.set_services_updated_at();
