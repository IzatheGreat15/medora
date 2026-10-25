
import { Check, UserRound } from 'lucide-react';

import type { Doctor } from '@/lib/booking/types';

type DoctorStepProps = {
  doctors: Doctor[];
  selectedId: string;
  onSelect: (id: string) => void;
};

export default function DoctorStep({
  doctors,
  selectedId,
  onSelect,
}: DoctorStepProps) {
  return (
    <section>
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
        Step 3 of 6
      </p>

      <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
        Choose your practitioner
      </h1>

      <p className="mt-2 text-sm leading-6 text-slate-500 sm:text-base">
        Showing practitioners who offer your selected service at this branch.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2">
        {doctors.map((doctor) => {
          const selected = selectedId === doctor.id;

          return (
            <button
              key={doctor.id}
              type="button"
              onClick={() => onSelect(doctor.id)}
              aria-pressed={selected}
              className={`flex min-w-0 items-start gap-3 rounded-2xl border p-4 text-left transition sm:gap-4 sm:p-5 ${
                selected
                  ? 'border-2 border-[#176B55] bg-[#F0F8F3]'
                  : 'border-slate-200 bg-white hover:border-[#82A995] hover:shadow-sm'
              }`}
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#DDF3E7] font-semibold text-[#176B55] sm:h-14 sm:w-14">
                {doctor.initials}
              </div>

              <div className="min-w-0 flex-1">
                <h2 className="break-words font-semibold text-slate-900">
                  {doctor.name}
                </h2>

                <p className="mt-0.5 break-words text-sm font-medium text-[#176B55]">
                  {doctor.title}
                </p>

                <p className="mt-2 break-words text-sm leading-5 text-slate-500">
                  {doctor.availability}
                </p>
              </div>

              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${
                  selected
                    ? 'border-[#176B55] bg-[#176B55] text-white'
                    : 'border-slate-300 text-transparent'
                }`}
              >
                <Check size={14} />
              </span>
            </button>
          );
        })}

        {doctors.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 px-5 py-10 text-center md:col-span-2">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
              <UserRound size={24} className="text-slate-400" />
            </div>

            <h2 className="mt-3 font-semibold text-slate-800">
              No practitioners available
            </h2>

            <p className="mt-1 text-sm leading-5 text-slate-500">
              Try another service or branch.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
