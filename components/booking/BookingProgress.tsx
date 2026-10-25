
const steps = [
  'Branch',
  'Service',
  'Doctor',
  'Date & time',
  'Your details',
  'Review',
];

type BookingProgressProps = {
  currentStep: number;
};

export default function BookingProgress({
  currentStep,
}: BookingProgressProps) {
  return (
    <nav
      aria-label="Booking progress"
      className="border-b border-slate-100 px-4 py-5 sm:px-6 lg:px-8"
    >
      <ol className="flex items-start justify-between gap-2 sm:items-center sm:gap-3">
        {steps.map((label, index) => {
          const number = index + 1;
          const active = number === currentStep;
          const complete = number < currentStep;

          return (
            <li
              key={label}
              aria-current={active ? 'step' : undefined}
              className="flex min-w-0 flex-1 flex-col items-center gap-2 sm:flex-row sm:items-center sm:gap-2"
            >
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                  active || complete
                    ? 'bg-[#176B55] text-white'
                    : 'border border-slate-200 bg-white text-slate-500'
                }`}
              >
                {complete ? (
                  <svg
                    viewBox="0 0 20 20"
                    fill="none"
                    className="h-4 w-4"
                    aria-hidden="true"
                  >
                    <path
                      d="m5 10 3.5 3.5L15 7"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  number
                )}
              </div>

              <span
                className={`min-w-0 text-center text-[11px] leading-tight sm:text-left sm:text-xs lg:text-sm ${
                  active
                    ? 'font-semibold text-[#176B55]'
                    : complete
                      ? 'font-medium text-slate-600'
                      : 'text-slate-500'
                }`}
              >
                {label}
              </span>

              {index < steps.length - 1 && (
                <span
                  className={`hidden h-px min-w-2 flex-1 sm:block ${
                    complete
                      ? 'bg-[#176B55]'
                      : 'bg-slate-200'
                  }`}
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
