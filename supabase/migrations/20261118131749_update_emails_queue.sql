
-- Allow emails that are not associated with a clinic.
ALTER TABLE public.emails
ALTER COLUMN clinic_id DROP NOT NULL;

-- Track when an email should next be retried.
ALTER TABLE public.emails
ADD COLUMN IF NOT EXISTS next_attempt_at TIMESTAMPTZ NULL;

-- Track when a worker started processing an email.
ALTER TABLE public.emails
ADD COLUMN IF NOT EXISTS processing_started_at TIMESTAMPTZ NULL;

-- Track the maximum number of attempts.
ALTER TABLE public.emails
ADD COLUMN IF NOT EXISTS max_attempts INTEGER NOT NULL DEFAULT 5;

-- Index for efficient queue processing.
CREATE INDEX IF NOT EXISTS emails_queue_processing_idx
ON public.emails (status, next_attempt_at, created_at)
WHERE status IN ('queued', 'processing');
