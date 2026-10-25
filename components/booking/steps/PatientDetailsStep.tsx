
import type { PatientDetails } from '@/lib/booking/types';

type PatientDetailsStepProps = {
  patient: PatientDetails;
  onChange: (patient: PatientDetails) => void;
};

export default function PatientDetailsStep({
  patient,
  onChange,
}: PatientDetailsStepProps) {
  const update = (key: keyof PatientDetails, value: string) => {
    onChange({
      ...patient,
      [key]: value,
    });
  };

  const inputClass =
    'mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#176B55] focus:ring-2 focus:ring-[#176B55]/15';

  return (
    <section>
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
        Step 5 of 6
      </p>

      <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
        Your details
      </h1>

      <p className="mt-2 text-sm leading-6 text-slate-500 sm:text-base">
        No account is needed. Enter your contact details so the clinic can
        manage your appointment.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
        <label className="text-sm font-medium text-slate-700 sm:col-span-2">
          Full name <span className="text-rose-500">*</span>

          <input
            required
            type="text"
            autoComplete="name"
            value={patient.fullName}
            onChange={(event) => update('fullName', event.target.value)}
            placeholder="Enter your full name"
            className={inputClass}
          />
        </label>

        <label className="text-sm font-medium text-slate-700">
          Email address <span className="text-rose-500">*</span>

          <input
            required
            type="email"
            autoComplete="email"
            value={patient.email}
            onChange={(event) => update('email', event.target.value)}
            placeholder="you@example.com"
            className={inputClass}
          />
        </label>

        <label className="text-sm font-medium text-slate-700">
          Phone number <span className="text-rose-500">*</span>

          <input
            required
            type="tel"
            autoComplete="tel"
            value={patient.phone}
            onChange={(event) => update('phone', event.target.value)}
            placeholder="e.g. 0917 123 4567"
            className={inputClass}
          />
        </label>

        <label className="text-sm font-medium text-slate-700 sm:col-span-2">
          Reason for visit or additional notes{' '}
          <span className="font-normal text-slate-400">(optional)</span>

          <textarea
            rows={4}
            maxLength={1000}
            value={patient.notes}
            onChange={(event) => update('notes', event.target.value)}
            placeholder="Share anything you'd like the clinic to know before your visit."
            className={`${inputClass} resize-y`}
          />

          <span className="mt-1.5 block text-xs font-normal leading-5 text-slate-400">
            Please avoid including highly sensitive medical information in
            this field.
          </span>
        </label>
      </div>

      <p className="mt-5 text-xs leading-5 text-slate-500">
        By continuing, you agree that the clinic may use these details to
        contact you about this appointment.
      </p>
    </section>
  );
}
