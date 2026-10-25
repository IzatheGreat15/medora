
import {
  CalendarDays,
  CheckCircle2,
  MapPin,
  Stethoscope,
  UserRound,
} from 'lucide-react';

import type {
  Branch,
  Doctor,
  Service,
} from '@/lib/booking/types';

type BookingSummaryProps = {
  branch?: Branch;
  service?: Service;
  doctor?: Doctor;
  date?: string;
  time?: string;
  patientName?: string;
};

export default function BookingSummary({
  branch,
  service,
  doctor,
  date,
  time,
  patientName,
}: BookingSummaryProps) {
  const formattedDate = date
    ? new Date(`${date}T12:00:00`).toLocaleDateString('en-PH', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : undefined;

  const items = [
    {
      label: 'Branch',
      value: branch?.name,
      icon: MapPin,
    },
    {
      label: 'Service',
      value: service?.name,
      icon: Stethoscope,
    },
    {
      label: 'Practitioner',
      value: doctor?.name,
      icon: UserRound,
    },
    {
      label: 'Date & time',
      value: formattedDate
        ? `${formattedDate}${time ? ` · ${time}` : ''}`
        : undefined,
      icon: CalendarDays,
    },
    {
      label: 'Patient',
      value: patientName,
      icon: UserRound,
    },
  ];

  return (
    <aside className="h-fit min-w-0 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 lg:p-6">
      {/* Summary header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#DDF3E7] text-[#176B55]">
          <CalendarDays size={20} />
        </div>

        <div className="min-w-0">
          <h2 className="font-semibold text-slate-900">
            Your booking
          </h2>

          <p className="mt-0.5 text-sm leading-5 text-slate-500">
            Your selections appear here.
          </p>
        </div>
      </div>

      {/* Booking details */}
      <div className="space-y-5">
        {items.map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="flex min-w-0 items-start gap-3"
          >
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                value
                  ? 'bg-[#DDF3E7] text-[#176B55]'
                  : 'bg-slate-100 text-slate-400'
              }`}
            >
              <Icon size={17} />
            </div>

            <div className="min-w-0 flex-1 pt-0.5">
              <p className="text-sm font-medium leading-5 text-slate-800">
                {label}
              </p>

              <p
                className={`mt-0.5 break-words text-sm leading-5 ${
                  value ? 'text-slate-600' : 'text-slate-400'
                }`}
              >
                {value || 'Not selected'}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Service pricing */}
      {service && (
        <div className="mt-6 border-t border-slate-100 pt-5">
          <div className="flex items-center justify-between gap-3 text-sm text-slate-500">
            <span>Duration</span>

            <span className="shrink-0 font-medium text-slate-700">
              {service.durationMinutes} min
            </span>
          </div>

          <div className="mt-3 flex items-start justify-between gap-3">
            <span className="text-sm font-semibold text-slate-800">
              Estimated total
            </span>

            <span className="shrink-0 text-lg font-bold text-[#176B55]">
              ₱{service.price.toLocaleString('en-PH')}
            </span>
          </div>
        </div>
      )}

      {/* Guest booking notice */}
      <div className="mt-6 flex items-start gap-2.5 rounded-xl bg-[#F7F9F6] p-3.5">
        <CheckCircle2
          size={18}
          className="mt-0.5 shrink-0 text-[#176B55]"
        />

        <p className="text-xs leading-5 text-slate-600 sm:text-sm">
          No account required. Your details will be used to
          manage your appointment.
        </p>
      </div>
    </aside>
  );
}
