
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  clinic_id UUID NOT NULL
    REFERENCES public.clinics(id) ON DELETE CASCADE,

  branch_id UUID NOT NULL
    REFERENCES public.branches(id) ON DELETE RESTRICT,

  doctor_id UUID NOT NULL
    REFERENCES public.doctors(id) ON DELETE RESTRICT,

  service_id UUID NOT NULL
    REFERENCES public.services(id) ON DELETE RESTRICT,

  -- Patient contact details; no patient account required.
  patient_full_name TEXT NOT NULL,
  patient_email TEXT,
  patient_phone TEXT NOT NULL,
  patient_notes TEXT,

  -- Appointment date and local clinic time.
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,

  -- Snapshots of the service at booking time.
  service_name TEXT NOT NULL,
  service_price NUMERIC(12, 2) NOT NULL,
  service_duration INTEGER NOT NULL,

  status TEXT NOT NULL DEFAULT 'Pending'
    CHECK (
      status IN (
        'Pending',
        'Approved',
        'Rejected',
        'Cancelled',
        'Completed'
      )
    ),

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  approved_at TIMESTAMPTZ NULL DEFAULT NULL,
  approved_by UUID REFERENCES public.staff(id) ON DELETE SET NULL,

  CONSTRAINT bookings_patient_name_not_empty
    CHECK (LENGTH(TRIM(patient_full_name)) > 0),

  CONSTRAINT bookings_patient_phone_not_empty
    CHECK (LENGTH(TRIM(patient_phone)) > 0),

  CONSTRAINT bookings_service_price_non_negative
    CHECK (service_price >= 0),

  CONSTRAINT bookings_service_duration_positive
    CHECK (service_duration > 0)
);

-- Common dashboard queries.
CREATE INDEX bookings_clinic_date_idx
  ON public.bookings (clinic_id, appointment_date);

CREATE INDEX bookings_branch_date_idx
  ON public.bookings (branch_id, appointment_date);

CREATE INDEX bookings_doctor_date_idx
  ON public.bookings (doctor_id, appointment_date);

CREATE INDEX bookings_clinic_status_idx
  ON public.bookings (clinic_id, status);

CREATE INDEX bookings_service_idx
  ON public.bookings (service_id);

-- Enable row-level security.
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
