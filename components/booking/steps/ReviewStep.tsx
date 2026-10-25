
import {
  CalendarDays,
  Mail,
  MapPin,
  Phone,
  Stethoscope,
  UserRound,
} from 'lucide-react';

import type {
  Branch,
  Doctor,
  PatientDetails,
  Service,
} from '@/lib/booking/types';

type ReviewStepProps = {
  branch?: Branch;
  service?: Service;
  doctor?: Doctor;
  date: string;
  time: string;
  patient: PatientDetails;
};

export default function ReviewStep({
  branch,
  service,
  doctor,
  date,
  time,
  patient,
}: ReviewStepProps) {
  const dateLabel = date
    ? new Date(`${date}T12:00:00`).toLocaleDateString('en-PH', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Not selected';

  const rows = [
    {
      label: 'Clinic',
      value: branch?.name,
      detail: branch?.address,
      icon: MapPin,
    },
    {
      label: 'Service',
      value: service?.name,
      detail: service
        ? `${service.durationMinutes} minutes · ₱${service.price.toLocaleString('en-PH')}`
        : undefined,
      icon: Stethoscope,
    },
    {
      label: 'Doctor',
      value: doctor?.name,
      detail: doctor?.title,
      icon: UserRound,
    },
    {
      label: 'Date & time',
      value: dateLabel,
      detail: time || undefined,
      icon: CalendarDays,
    },
    {
      label: 'Patient',
      value: patient.fullName,
      detail: patient.email,
      icon: Mail,
    },
  ];

  const estimatedTotal = service?.price ?? 0;

  return (
    <section>
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
        Step 6 of 6
      </p>

      <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
        Review your appointment
      </h1>

      <p className="mt-2 text-sm leading-6 text-slate-500 sm:text-base">
        Make sure everything is correct before sending your booking request.
      </p>

      <div className="mt-6 divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white px-4 sm:px-5">
        {rows.map(({ label, value, detail, icon: Icon }) => (
          <div key={label} className="flex min-w-0 items-start gap-3 py-4 sm:gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#DDF3E7] text-[#176B55]">
              <Icon size={19} />
            </div>

            <div className="min-w-0 flex-1 pt-0.5">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                {label}
              </p>

              <p className="mt-1 break-words font-semibold text-slate-900">
                {value || 'Not provided'}
              </p>

              {detail && (
                <p className="mt-0.5 break-words text-sm leading-5 text-slate-500">
                  {detail}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {patient.phone && (
        <p className="mt-3 flex min-w-0 items-start gap-2 text-sm text-slate-500">
          <Phone size={15} className="mt-0.5 shrink-0" />
          <span className="break-words">{patient.phone}</span>
        </p>
      )}

      {patient.notes && (
        <div className="mt-4 rounded-xl bg-[#F7F9F6] p-4">
          <p className="text-sm font-semibold text-slate-700">
            Additional notes
          </p>

          <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-6 text-slate-600">
            {patient.notes}
          </p>
        </div>
      )}

      <div className="mt-5 rounded-xl bg-[#F0F8F3] p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="font-semibold text-[#173F35]">
              Estimated total
            </p>

            <p className="mt-1 text-sm leading-5 text-[#53645D]">
              Payment instructions depend on clinic policy.
            </p>
          </div>

          <p className="shrink-0 text-xl font-bold text-[#176B55]">
            ₱{estimatedTotal.toLocaleString('en-PH')}
          </p>
        </div>
      </div>
    </section>
  );
}
