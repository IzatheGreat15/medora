
"use client";

import { useState } from "react";
import {
  CalendarDays,
  Clock3,
  Users,
  TrendingUp,
  ArrowUpRight,
  CalendarCheck,
} from "lucide-react";

import AppointmentTrendsChart from "@/components/dashboard/charts/AppointmentTrendsChart";
import BookingStatusChart from "@/components/dashboard/charts/BookingStatusChart";
import PopularServicesChart from "@/components/dashboard/charts/PopularServicesChart";
import BranchPerformanceChart from "@/components/dashboard/charts/BranchPerformanceChart";
import StatCard from "@/components/dashboard/charts/StatCard";

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
    color: "bg-amber-50 text-amber-700",
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

const dateRanges = [
  { label: "Last 7 days", value: "7d" },
  { label: "Last 30 days", value: "30d" },
  { label: "Last 90 days", value: "90d" },
];

export default function DashboardPage() {
  const [dateRange, setDateRange] = useState("30d");

  return (
    <div className="mx-auto max-w-7xl space-y-6 sm:space-y-8">
      {/* Page heading */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-medium text-[#176B55]">
            Clinic overview
          </p>

          <h1 className="mt-2 text-2xl font-bold tracking-tight text-[#173F35] sm:text-3xl">
            Welcome back, John!
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Here's what's happening at your clinic.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            window.location.href = "/bookings";
          }}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#176B55] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#173F35]"
        >
          <CalendarCheck size={17} />
          View bookings
        </button>
      </div>

      {/* KPI cards */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </section>

      {/* Analytics heading and filter */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-[#173F35]">
            Clinic analytics
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Track appointments, services, and branch activity.
          </p>
        </div>

        <div className="relative">
          <select
            value={dateRange}
            onChange={(event) => setDateRange(event.target.value)}
            aria-label="Analytics date range"
            className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-600 outline-none transition focus:border-[#82A995] focus:ring-2 focus:ring-[#DDF3E7] sm:w-40"
          >
            {dateRanges.map((range) => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Appointment trends */}
      <section className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <AppointmentTrendsChart />
        <BookingStatusChart />
      </section>

      {/* Service and branch analytics */}
      <section className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <PopularServicesChart />
        <BranchPerformanceChart />
      </section>

      {/* Demo data notice */}
      <div className="flex items-start gap-3 rounded-xl border border-[#B9DCC8] bg-[#DDF3E7]/50 p-4">
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-[#176B55]">
          <ArrowUpRight size={17} />
        </span>

        <div>
          <p className="text-sm font-semibold text-[#173F35]">
            Your analytics dashboard is ready
          </p>

          <p className="mt-1 text-sm leading-6 text-slate-600">
            The charts currently use sample data. Connect your appointment,
            service, practitioner, and branch records to display real clinic
            performance.
          </p>
        </div>
      </div>
    </div>
  );
}
