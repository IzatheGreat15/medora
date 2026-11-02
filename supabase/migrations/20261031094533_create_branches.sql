
-- Create branch status enum
CREATE TYPE public.branch_status AS ENUM (
    'Active',
    'Inactive'
);

-- Create branches table
CREATE TABLE public.branches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    clinic_id UUID NOT NULL
        REFERENCES public.clinics(id)
        ON DELETE CASCADE,

    name TEXT NOT NULL,
    code TEXT NOT NULL,
    address TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,

    status public.branch_status NOT NULL DEFAULT 'Active',

    opening_hours JSONB NOT NULL DEFAULT '{
        "Monday": {
            "open": true,
            "start": "09:00",
            "end": "17:00"
        },
        "Tuesday": {
            "open": true,
            "start": "09:00",
            "end": "17:00"
        },
        "Wednesday": {
            "open": true,
            "start": "09:00",
            "end": "17:00"
        },
        "Thursday": {
            "open": true,
            "start": "09:00",
            "end": "17:00"
        },
        "Friday": {
            "open": true,
            "start": "09:00",
            "end": "17:00"
        },
        "Saturday": {
            "open": true,
            "start": "09:00",
            "end": "13:00"
        },
        "Sunday": {
            "open": false,
            "start": "09:00",
            "end": "17:00"
        }
    }'::JSONB,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES public.staff(id) ON DELETE SET NULL,

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_by UUID REFERENCES public.staff(id) ON DELETE SET NULL,

    CONSTRAINT branches_clinic_code_unique
        UNIQUE (clinic_id, code),

    CONSTRAINT branches_name_not_empty
        CHECK (LENGTH(TRIM(name)) > 0),

    CONSTRAINT branches_code_not_empty
        CHECK (LENGTH(TRIM(code)) > 0)
);

-- Indexes for common clinic queries
CREATE INDEX idx_branches_clinic_id
    ON public.branches(clinic_id);

CREATE INDEX idx_branches_clinic_status
    ON public.branches(clinic_id, status);

-- Enable Row Level Security
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;

-- Allow authenticated clinic users to read branches
-- belonging to their own clinic.
CREATE POLICY "Clinic users can view their own branches"
ON public.branches
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

-- Automatically update updated_at when a branch changes.
CREATE OR REPLACE FUNCTION public.set_branches_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE TRIGGER branches_set_updated_at
BEFORE UPDATE ON public.branches
FOR EACH ROW
EXECUTE FUNCTION public.set_branches_updated_at();
