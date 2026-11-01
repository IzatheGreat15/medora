
-- Update SELECT policy for services
DROP POLICY IF EXISTS "Clinic users can view their own services"
ON public.services;

DROP POLICY IF EXISTS "Users can view services"
ON public.services;

CREATE POLICY "Users can view services"
ON public.services
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
          AND s.clinic_id = public.services.clinic_id
          AND s.clinic_role IN ('owner', 'manager', 'staff')
        )
      )
  )
);

-- Update SELECT policy for branches
DROP POLICY IF EXISTS "Clinic users can view their own branches"
ON public.branches;

DROP POLICY IF EXISTS "Users can view branches"
ON public.branches;

CREATE POLICY "Users can view branches"
ON public.branches
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
          AND s.clinic_id = public.branches.clinic_id
          AND s.clinic_role IN ('owner', 'manager', 'staff')
        )
      )
  )
);
