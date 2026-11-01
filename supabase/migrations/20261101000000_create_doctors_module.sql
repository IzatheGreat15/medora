
-- =========================================================
-- MEDORA: DOCTORS MODULE
-- Tables:
--   1. doctors
--   2. doctor_branches
--   3. doctor_working_hours
--   4. doctor_branch_services
-- =========================================================

-- ---------------------------------------------------------
-- 1. Doctor status
-- ---------------------------------------------------------

CREATE TYPE public.doctor_status AS ENUM (
  'Active',
  'Inactive'
);

-- ---------------------------------------------------------
-- 2. Doctors
-- ---------------------------------------------------------

CREATE TABLE public.doctors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  clinic_id UUID NOT NULL
    REFERENCES public.clinics(id) ON DELETE CASCADE,

  name TEXT NOT NULL,
  specialty TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  license_number TEXT,
  status public.doctor_status NOT NULL DEFAULT 'Active',
  bio TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  created_by UUID REFERENCES public.staff(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES public.staff(id) ON DELETE SET NULL,

  CONSTRAINT doctors_name_not_empty
    CHECK (LENGTH(TRIM(name)) > 0),

  CONSTRAINT doctors_specialty_not_empty
    CHECK (LENGTH(TRIM(specialty)) > 0),

  CONSTRAINT doctors_email_not_empty
    CHECK (LENGTH(TRIM(email)) > 0)
);

CREATE INDEX idx_doctors_clinic_id
  ON public.doctors(clinic_id);

CREATE INDEX idx_doctors_clinic_status
  ON public.doctors(clinic_id, status);

CREATE INDEX idx_doctors_clinic_name
  ON public.doctors(clinic_id, name);


-- ---------------------------------------------------------
-- 3. Doctor-to-branch assignments
-- ---------------------------------------------------------

CREATE TABLE public.doctor_branches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  clinic_id UUID NOT NULL
    REFERENCES public.clinics(id) ON DELETE CASCADE,

  doctor_id UUID NOT NULL
    REFERENCES public.doctors(id) ON DELETE CASCADE,

  branch_id UUID NOT NULL
    REFERENCES public.branches(id) ON DELETE CASCADE,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT doctor_branches_unique
    UNIQUE (doctor_id, branch_id),

  -- Supports composite foreign keys that enforce clinic consistency.
  CONSTRAINT doctor_branches_id_clinic_unique
    UNIQUE (id, clinic_id),

  CONSTRAINT doctor_branches_doctor_clinic_unique
    UNIQUE (doctor_id, clinic_id),

  CONSTRAINT doctor_branches_branch_clinic_unique
    UNIQUE (branch_id, clinic_id)
);

CREATE INDEX idx_doctor_branches_clinic_id
  ON public.doctor_branches(clinic_id);

CREATE INDEX idx_doctor_branches_doctor_id
  ON public.doctor_branches(doctor_id);

CREATE INDEX idx_doctor_branches_branch_id
  ON public.doctor_branches(branch_id);


-- ---------------------------------------------------------
-- 4. Doctor working hours
-- Each row represents one day and one time range.
-- day_of_week: 0 = Sunday, 1 = Monday, ... 6 = Saturday.
-- Multiple rows per day allow lunch breaks.
-- ---------------------------------------------------------

CREATE TABLE public.doctor_working_hours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  doctor_branch_id UUID NOT NULL
    REFERENCES public.doctor_branches(id) ON DELETE CASCADE,

  day_of_week SMALLINT NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT doctor_working_hours_valid_day
    CHECK (day_of_week BETWEEN 0 AND 6),

  CONSTRAINT doctor_working_hours_valid_time
    CHECK (end_time > start_time)
);

CREATE INDEX idx_doctor_working_hours_assignment
  ON public.doctor_working_hours(doctor_branch_id);

CREATE INDEX idx_doctor_working_hours_day
  ON public.doctor_working_hours(doctor_branch_id, day_of_week);


-- ---------------------------------------------------------
-- 5. Doctor services per branch
-- NULL overrides mean use the service defaults.
-- ---------------------------------------------------------

CREATE TABLE public.doctor_branch_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  doctor_branch_id UUID NOT NULL
    REFERENCES public.doctor_branches(id) ON DELETE CASCADE,

  service_id UUID NOT NULL
    REFERENCES public.services(id) ON DELETE CASCADE,

  price_override NUMERIC(10, 2),
  duration_override INTEGER,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT doctor_branch_services_unique
    UNIQUE (doctor_branch_id, service_id),

  CONSTRAINT doctor_branch_services_valid_price
    CHECK (price_override IS NULL OR price_override >= 0),

  CONSTRAINT doctor_branch_services_valid_duration
    CHECK (duration_override IS NULL OR duration_override > 0)
);

CREATE INDEX idx_doctor_branch_services_assignment
  ON public.doctor_branch_services(doctor_branch_id);

CREATE INDEX idx_doctor_branch_services_service_id
  ON public.doctor_branch_services(service_id);


-- ---------------------------------------------------------
-- 6. Keep updated_at current
-- ---------------------------------------------------------

CREATE OR REPLACE FUNCTION public.set_doctors_module_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER doctors_set_updated_at
BEFORE UPDATE ON public.doctors
FOR EACH ROW
EXECUTE FUNCTION public.set_doctors_module_updated_at();

CREATE TRIGGER doctor_branches_set_updated_at
BEFORE UPDATE ON public.doctor_branches
FOR EACH ROW
EXECUTE FUNCTION public.set_doctors_module_updated_at();

CREATE TRIGGER doctor_working_hours_set_updated_at
BEFORE UPDATE ON public.doctor_working_hours
FOR EACH ROW
EXECUTE FUNCTION public.set_doctors_module_updated_at();

CREATE TRIGGER doctor_branch_services_set_updated_at
BEFORE UPDATE ON public.doctor_branch_services
FOR EACH ROW
EXECUTE FUNCTION public.set_doctors_module_updated_at();


-- ---------------------------------------------------------
-- 7. Enable Row Level Security
-- ---------------------------------------------------------

ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctor_branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctor_working_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctor_branch_services ENABLE ROW LEVEL SECURITY;


-- ---------------------------------------------------------
-- 8. Clinic-scoped SELECT policies
-- ---------------------------------------------------------

-- =========================================================
-- Doctors SELECT policy
-- =========================================================

CREATE POLICY "Users can view doctors"
ON public.doctors
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.staff AS s
    WHERE s.id = (SELECT auth.uid())
      AND (
        s.role = 'platform_admin'
        OR (
          s.role = 'clinic_user'
          AND s.clinic_id = public.doctors.clinic_id
          AND s.clinic_role IN ('owner', 'manager', 'staff')
        )
      )
  )
);


-- =========================================================
-- Doctor branches SELECT policy
-- =========================================================

CREATE POLICY "Users can view doctor branches"
ON public.doctor_branches
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.staff AS s
    WHERE s.id = (SELECT auth.uid())
      AND (
        s.role = 'platform_admin'
        OR (
          s.role = 'clinic_user'
          AND s.clinic_id = public.doctor_branches.clinic_id
          AND s.clinic_role IN ('owner', 'manager', 'staff')
        )
      )
  )
);


-- =========================================================
-- Doctor working hours SELECT policy
-- =========================================================

CREATE POLICY "Users can view doctor working hours"
ON public.doctor_working_hours
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.doctor_branches AS db
    WHERE db.id = public.doctor_working_hours.doctor_branch_id
      AND EXISTS (
        SELECT 1
        FROM public.staff AS s
        WHERE s.id = (SELECT auth.uid())
          AND (
            s.role = 'platform_admin'
            OR (
              s.role = 'clinic_user'
              AND s.clinic_id = db.clinic_id
              AND s.clinic_role IN ('owner', 'manager', 'staff')
            )
          )
      )
  )
);


-- =========================================================
-- Doctor branch services SELECT policy
-- =========================================================

CREATE POLICY "Users can view doctor branch services"
ON public.doctor_branch_services
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.doctor_branches AS db
    WHERE db.id = public.doctor_branch_services.doctor_branch_id
      AND EXISTS (
        SELECT 1
        FROM public.staff AS s
        WHERE s.id = (SELECT auth.uid())
          AND (
            s.role = 'platform_admin'
            OR (
              s.role = 'clinic_user'
              AND s.clinic_id = db.clinic_id
              AND s.clinic_role IN ('owner', 'manager', 'staff')
            )
          )
      )
  )
);

