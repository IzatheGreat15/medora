
import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

type StatCardProps = {
  label: string;
  value: string | number;
  note: string;
  icon: LucideIcon;
  color?: string;
  trend?: {
    value: string;
    direction: "up" | "down";
    label: string;
  };
};

export default function StatCard({
  label,
  value,
  note,
  icon: Icon,
  color = "bg-[#DDF3E7] text-[#176B55]",
  trend,
}: StatCardProps) {
  return (
    <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-900/[0.02]">
      <div className="flex items-start justify-between gap-3">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${color}`}
        >
          <Icon size={21} />
        </div>

        {trend && (
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${
              trend.direction === "up"
                ? "bg-emerald-50 text-emerald-700"
                : "bg-rose-50 text-rose-700"
            }`}
          >
            {trend.direction === "up" ? (
              <ArrowUpRight size={14} />
            ) : (
              <ArrowDownRight size={14} />
            )}
            {trend.value}
          </span>
        )}
      </div>

      <p className="mt-5 text-sm text-slate-500">{label}</p>

      <p className="mt-1 text-3xl font-bold tracking-tight text-[#173F35]">
        {value}
      </p>

      <p className="mt-2 text-xs text-slate-500">{note}</p>
    </article>
  );
}
