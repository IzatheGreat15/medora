
-- =========================================================
-- EMAIL TEMPLATES
--
-- clinic_id IS NULL     = Global default template
-- clinic_id IS NOT NULL = Clinic-specific template
--
-- Global templates are shared across all clinics.
-- Clinics can customize templates by creating their own copy.
-- =========================================================

CREATE TABLE IF NOT EXISTS public.email_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    clinic_id UUID NULL
        REFERENCES public.clinics(id)
        ON DELETE CASCADE,

    code VARCHAR(100) NOT NULL,
    name VARCHAR(150) NOT NULL,
    description TEXT NULL,

    subject TEXT NOT NULL,
    body TEXT NOT NULL,

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    created_by UUID NULL
        REFERENCES public.staff(id)
        ON DELETE SET NULL,

    updated_by UUID NULL
        REFERENCES public.staff(id)
        ON DELETE SET NULL
);


-- =========================================================
-- UNIQUE CONSTRAINTS
-- One global template per code.
-- One clinic-specific template per code per clinic.
-- =========================================================

CREATE UNIQUE INDEX email_templates_global_code_unique
ON public.email_templates (code)
WHERE clinic_id IS NULL;

CREATE UNIQUE INDEX email_templates_clinic_code_unique
ON public.email_templates (clinic_id, code)
WHERE clinic_id IS NOT NULL;


-- =========================================================
-- INDEXES
-- =========================================================

CREATE INDEX email_templates_clinic_id_index
ON public.email_templates (clinic_id);

CREATE INDEX email_templates_code_index
ON public.email_templates (code);


-- =========================================================
-- UPDATED_AT TRIGGER
-- =========================================================

CREATE OR REPLACE FUNCTION public.set_email_templates_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE TRIGGER email_templates_updated_at_trigger
BEFORE UPDATE ON public.email_templates
FOR EACH ROW
EXECUTE FUNCTION public.set_email_templates_updated_at();


-- =========================================================
-- PREVENT DELETION OF GLOBAL DEFAULT TEMPLATES
-- =========================================================

CREATE OR REPLACE FUNCTION public.prevent_global_email_template_deletion()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF OLD.clinic_id IS NULL THEN
        RAISE EXCEPTION 'Global email templates cannot be deleted.';
    END IF;

    RETURN OLD;
END;
$$;

CREATE TRIGGER prevent_global_email_template_deletion_trigger
BEFORE DELETE ON public.email_templates
FOR EACH ROW
EXECUTE FUNCTION public.prevent_global_email_template_deletion();


-- =========================================================
-- PROTECT GLOBAL TEMPLATE IDENTITY
--
-- Global templates cannot:
-- 1. Be converted into clinic-specific templates.
-- 2. Have their template code changed.
--
-- Subject, body, description, name and active status
-- can still be updated by authorized platform admins.
-- =========================================================

CREATE OR REPLACE FUNCTION public.prevent_global_email_template_modification()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF OLD.clinic_id IS NULL THEN

        IF NEW.clinic_id IS NOT NULL THEN
            RAISE EXCEPTION
                'Global email templates cannot be converted into clinic-specific templates.';
        END IF;

        IF NEW.code IS DISTINCT FROM OLD.code THEN
            RAISE EXCEPTION
                'Global email template codes cannot be changed.';
        END IF;

    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER prevent_global_email_template_modification_trigger
BEFORE UPDATE ON public.email_templates
FOR EACH ROW
EXECUTE FUNCTION public.prevent_global_email_template_modification();


-- =========================================================
-- HELPER FUNCTION: GET CURRENT STAFF ROLE
-- =========================================================

CREATE OR REPLACE FUNCTION public.get_current_staff_role()
RETURNS TEXT
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
    SELECT s.role
    FROM public.staff s
    WHERE s.id = (SELECT auth.uid())
    LIMIT 1;
$$;


-- =========================================================
-- HELPER FUNCTION: GET CURRENT STAFF CLINIC ID
-- =========================================================

CREATE OR REPLACE FUNCTION public.get_current_staff_clinic_id()
RETURNS UUID
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
    SELECT s.clinic_id
    FROM public.staff s
    WHERE s.id = (SELECT auth.uid())
    LIMIT 1;
$$;


-- =========================================================
-- HELPER FUNCTION PERMISSIONS
-- =========================================================

REVOKE ALL ON FUNCTION public.get_current_staff_role() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_current_staff_clinic_id() FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.get_current_staff_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_current_staff_clinic_id() TO authenticated;


-- =========================================================
-- ENABLE ROW LEVEL SECURITY
-- =========================================================

ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;


-- =========================================================
-- SELECT POLICY
--
-- Platform admins: All templates.
-- Clinic staff: Global templates + own clinic templates.
-- =========================================================

CREATE POLICY "Platform admins and clinics can view email templates"
ON public.email_templates
FOR SELECT
TO authenticated
USING (
    public.get_current_staff_role() = 'platform_admin'
    OR
    (
        public.get_current_staff_role() = 'clinic_user'
        AND (
            clinic_id IS NULL
            OR clinic_id = public.get_current_staff_clinic_id()
        )
    )
);


-- =========================================================
-- INSERT POLICY
--
-- Platform admins: Global templates only.
-- Clinic staff: Own clinic templates only.
-- =========================================================

CREATE POLICY "Platform admins and clinics can create email templates"
ON public.email_templates
FOR INSERT
TO authenticated
WITH CHECK (
    (
        public.get_current_staff_role() = 'platform_admin'
        AND clinic_id IS NULL
    )
    OR
    (
        public.get_current_staff_role() = 'clinic_user'
        AND clinic_id = public.get_current_staff_clinic_id()
        AND clinic_id IS NOT NULL
    )
);


-- =========================================================
-- UPDATE POLICY
--
-- Platform admins: Global templates only.
-- Clinic staff: Own clinic templates only.
-- =========================================================

CREATE POLICY "Platform admins and clinics can update email templates"
ON public.email_templates
FOR UPDATE
TO authenticated
USING (
    (
        public.get_current_staff_role() = 'platform_admin'
        AND clinic_id IS NULL
    )
    OR
    (
        public.get_current_staff_role() = 'clinic_user'
        AND clinic_id = public.get_current_staff_clinic_id()
        AND clinic_id IS NOT NULL
    )
)
WITH CHECK (
    (
        public.get_current_staff_role() = 'platform_admin'
        AND clinic_id IS NULL
    )
    OR
    (
        public.get_current_staff_role() = 'clinic_user'
        AND clinic_id = public.get_current_staff_clinic_id()
        AND clinic_id IS NOT NULL
    )
);


-- =========================================================
-- DELETE POLICY
--
-- Clinic staff: Own clinic templates only.
-- Global templates cannot be deleted.
-- =========================================================

CREATE POLICY "Clinics can delete their own email templates"
ON public.email_templates
FOR DELETE
TO authenticated
USING (
    public.get_current_staff_role() = 'clinic_user'
    AND clinic_id = public.get_current_staff_clinic_id()
    AND clinic_id IS NOT NULL
);
