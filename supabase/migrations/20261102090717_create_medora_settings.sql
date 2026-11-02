-- Add a public logo URL to each clinic.
ALTER TABLE public.clinics
  ADD COLUMN IF NOT EXISTS logo_url TEXT;


-- Store per-clinic notification preferences and reminder timing.
CREATE TABLE IF NOT EXISTS public.clinic_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  clinic_id UUID NOT NULL UNIQUE
    REFERENCES public.clinics(id) ON DELETE CASCADE,

  notification_preferences JSONB NOT NULL DEFAULT
    '{
      "booking_received": true,
      "booking_confirmed": true,
      "booking_cancelled": true,
      "booking_rescheduled": true,
      "appointment_reminder": true
    }'::JSONB,

  reminder_days INTEGER NOT NULL DEFAULT 1
    CHECK (reminder_days IN (1, 2, 3, 7)),

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- Settings are accessed only by trusted server actions
-- using the Supabase service role.
ALTER TABLE public.clinic_settings
  ENABLE ROW LEVEL SECURITY;


-- Create the public bucket used to display clinic logos
-- on booking pages.
INSERT INTO storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
VALUES (
  'clinic-logos',
  'clinic-logos',
  TRUE,
  2097152,
  ARRAY[
    'image/png',
    'image/jpeg',
    'image/webp'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;