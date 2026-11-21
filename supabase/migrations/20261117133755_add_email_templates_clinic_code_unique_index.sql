CREATE UNIQUE INDEX IF NOT EXISTS
  email_templates_clinic_code_unique
ON public.email_templates (clinic_id, code)
WHERE clinic_id IS NOT NULL;