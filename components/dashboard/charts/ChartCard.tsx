
import type { ReactNode } from "react";

type ChartCardProps = {
  title: string;
  description: string;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
};

export default function ChartCard({
  title,
  description,
  children,
  className = "",
  action,
}: ChartCardProps) {
  return (
    <section
      className={`min-w-0 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-900/[0.02] sm:p-6 ${className}`}
    >
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="font-semibold text-[#173F35]">{title}</h3>
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        </div>

        {action}
      </div>

      {children}
    </section>
  );
}
