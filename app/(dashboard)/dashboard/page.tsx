
import {
  CalendarDays,
  Clock3,
  Users,
  TrendingUp,
  ArrowUpRight,
} from "lucide-react";

const stats = [
  {
    label: "Appointments today",
    value: "24",
    note: "Today's scheduled visits",
    icon: CalendarDays,
  },
  {
    label: "Awaiting approval",
    value: "6",
    note: "Requests to review",
    icon: Clock3,
  },
  {
    label: "Practitioners",
    value: "4",
    note: "Across your branches",
    icon: Users,
  },
  {
    label: "Completed this month",
    value: "186",
    note: "Monthly appointment count",
    icon: TrendingUp,
  },
];

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-medium text-[#176B55]">
            Saturday, October 24
          </p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-[#173F35] sm:text-3xl">
            Welcome back, John!
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Here&apos;s what&apos;s happening at your clinic today.
          </p>
        </div>

        <button
          type="button"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#176B55] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#173F35]"
        >
          <CalendarDays size={17} />
          View bookings
        </button>
      </div>

      <section className="grid gap-4 grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, note, icon: Icon }) => (
          <article
            key={label}
            className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-900/[0.02]"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#DDF3E7] text-[#176B55]">
                <Icon size={21} />
              </div>
              <ArrowUpRight size={17} className="text-slate-400" />
            </div>

            <p className="mt-5 text-sm text-slate-500">{label}</p>
            <p className="mt-1 text-3xl font-bold tracking-tight text-[#173F35]">
              {value}
            </p>
            <p className="mt-2 text-xs text-slate-500">{note}</p>
          </article>
        ))}
      </section>

      <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm shadow-slate-900/[0.02]">
        <div>
          <h3 className="text-lg font-bold text-[#173F35]">
            Welcome to your workspace
          </h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Your dashboard layout is ready. Next, we can connect your clinic
            data and build the booking calendar, practitioner management,
            branch settings, and service configuration.
          </p>
        </div>
      </section>
    </div>
  );
}
