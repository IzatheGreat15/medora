-- Create emails table
CREATE TABLE IF NOT EXISTS public.emails (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    clinic_id UUID NOT NULL
        REFERENCES public.clinics(id)
        ON DELETE CASCADE,

    recipient_email TEXT NOT NULL,
    recipient_name TEXT NULL,

    subject TEXT NOT NULL,
    body_html TEXT NOT NULL,
    body_text TEXT NULL,

    email_type VARCHAR(100) NULL,

    status VARCHAR(20) NOT NULL DEFAULT 'queued'
        CHECK (
            status IN (
                'queued',
                'processing',
                'sent',
                'failed'
            )
        ),

    provider VARCHAR(50) NULL,
    provider_message_id TEXT NULL,

    attempts INTEGER NOT NULL DEFAULT 0
        CHECK (attempts >= 0),

    error_message TEXT NULL,

    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,

    created_by UUID NULL
        REFERENCES public.staff(id)
        ON DELETE SET NULL,

    sent_at TIMESTAMPTZ NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- Index for retrieving emails belonging to a clinic
CREATE INDEX IF NOT EXISTS idx_emails_clinic_id
ON public.emails(clinic_id);


-- Index for filtering by status
CREATE INDEX IF NOT EXISTS idx_emails_status
ON public.emails(status);


-- Index for retrieving emails by recipient
CREATE INDEX IF NOT EXISTS idx_emails_recipient_email
ON public.emails(recipient_email);


-- Index for retrieving emails by type
CREATE INDEX IF NOT EXISTS idx_emails_email_type
ON public.emails(email_type);


-- Index for chronological email history
CREATE INDEX IF NOT EXISTS idx_emails_created_at
ON public.emails(created_at DESC);


-- Enable RLS
ALTER TABLE public.emails ENABLE ROW LEVEL SECURITY;


-- Clinic staff can view emails belonging to their clinic
CREATE POLICY "Clinic staff can view their clinic emails"
ON public.emails
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.staff
        WHERE staff.id = auth.uid()
        AND staff.clinic_id = emails.clinic_id
        AND staff.role = 'clinic_user'
    )
);