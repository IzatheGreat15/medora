
import { Check, Clock3, Stethoscope } from 'lucide-react';

import type { Service } from '@/lib/booking/types';

type ServiceStepProps = {
  services: Service[];
  selectedId: string;
  onSelect: (id: string) => void;
};

export default function ServiceStep({
  services,
  selectedId,
  onSelect,
}: ServiceStepProps) {
  return (
    <section>
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
        Step 2 of 6
      </p>

      <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
        What do you need help with?
      </h1>

      <p className="mt-2 text-sm leading-6 text-slate-500 sm:text-base">
        Choose a service to see matching doctors and appointment times.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-3">
        {services.map((service) => {
          const selected = selectedId === service.id;

          return (
            <button
              key={service.id}
              type="button"
              onClick={() => onSelect(service.id)}
              aria-pressed={selected}
              className={`flex min-w-0 items-start gap-3 rounded-2xl border p-4 text-left transition sm:gap-4 sm:p-5 ${
                selected
                  ? 'border-2 border-[#176B55] bg-[#F0F8F3]'
                  : 'border-slate-200 bg-white hover:border-[#82A995] hover:shadow-sm'
              }`}
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#DDF3E7] text-[#176B55] sm:h-12 sm:w-12">
                <Stethoscope size={22} />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="break-words font-semibold text-slate-900">
                    {service.name}
                  </h2>
                </div>

                <p className="mt-1 break-words text-sm leading-5 text-slate-500">
                  {service.description}
                </p>

                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-600">
                  <span className="flex items-center gap-1.5">
                    <Clock3 size={15} className="shrink-0" />
                    {service.durationMinutes} minutes
                  </span>

                  <span className="font-semibold text-slate-900">
                    ₱{service.price.toLocaleString('en-PH')}
                  </span>
                </div>
              </div>

              <span
                className={`mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${
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

        {services.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 px-5 py-10 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
              <Stethoscope size={24} className="text-slate-400" />
            </div>

            <h2 className="mt-3 font-semibold text-slate-800">
              No services available
            </h2>

            <p className="mt-1 text-sm leading-5 text-slate-500">
              Please select another branch or contact the clinic for assistance.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
