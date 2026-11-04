
"use client";

import { useMemo, useState } from "react";
import {
  CalendarDays,
  Clock3,
  Users,
  TrendingUp,
  ArrowUpRight,
  CalendarCheck,
  MapPin,
  Stethoscope,
  ChevronRight,
} from "lucide-react";

import AppointmentTrendsChart from "@/components/dashboard/charts/AppointmentTrendsChart";
import BookingStatusChart from "@/components/dashboard/charts/BookingStatusChart";
import PopularServicesChart from "@/components/dashboard/charts/PopularServicesChart";
import BranchPerformanceChart from "@/components/dashboard/charts/BranchPerformanceChart";
import StatCard from "@/components/dashboard/charts/StatCard";

import type { DashboardStaff } from "./DashboardLayoutClient";
import type { DashboardData } from "@/lib/dashboard/get-dashboard-data";

type AppointmentStatus =
  | "Pending"
  | "Approved"
  | "Rejected"
  | "Cancelled"
  | "Completed";

type DisplayStatus =
  | "Confirmed"
  | "Pending"
  | "Completed"
  | "Declined"
  | "Cancelled";

type DateRange = "7d" | "30d" | "90d";

type TodayAppointment = DashboardData["todayAppointments"][number];
type DoctorDuty = DashboardData["doctorsOnDuty"][number];

const dateRanges: { label: string; value: DateRange }[] = [
  { label: "Last 7 days", value: "7d" },
  { label: "Last 30 days", value: "30d" },
  { label: "Last 90 days", value: "90d" },
];

const statusStyles: Record<DisplayStatus, string> = {
  Confirmed: "border-[#B9DCC8] bg-[#DDF3E7] text-[#176B55]",
  Pending: "border-amber-200 bg-amber-50 text-amber-700",
  Completed: "border-sky-200 bg-sky-50 text-sky-700",
  Declined: "border-rose-200 bg-rose-50 text-rose-700",
  Cancelled: "border-slate-200 bg-slate-100 text-slate-600",
};

const dutyStyles: Record<DoctorDuty["status"], string> = {
  "On duty": "bg-emerald-50 text-emerald-700",
  "Off duty": "bg-slate-100 text-slate-600",
};

function getDisplayStatus(status: AppointmentStatus): DisplayStatus {
  switch (status) {
    case "Approved":
      return "Confirmed";
    case "Rejected":
      return "Declined";
    default:
      return status;
  }
}

function formatTime(time: string) {
  const [hours, minutes] = time.split(":").map(Number);

  const date = new Date();
  date.setHours(hours, minutes, 0, 0);

  return date.toLocaleTimeString("en-PH", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function getDateDaysAgo(days: number, today: string) {
  const date = new Date(`${today}T12:00:00+08:00`);
  date.setDate(date.getDate() - days);

  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export default function DashboardPageContent({
  staff,
  data,
}: {
  staff: DashboardStaff;
  data: DashboardData;
}) {
  const [dateRange, setDateRange] = useState<DateRange>("30d");
  const [appointmentFilter, setAppointmentFilter] = useState("All");
  const [branchFilter, setBranchFilter] = useState("All branches");

  const stats = [
    {
      label: "Appointments today",
      value: String(data.stats.appointmentsToday),
      note: "Today's scheduled visits",
      icon: CalendarDays,
    },
    {
      label: "Awaiting approval",
      value: String(data.stats.awaitingApproval),
      note: "Requests to review",
      icon: Clock3,
      color: "bg-amber-50 text-amber-700",
    },
    {
      label: "Doctors",
      value: String(data.stats.doctors),
      note: "Across your branches",
      icon: Users,
    },
    {
      label: "Completed this month",
      value: String(data.stats.completedThisMonth),
      note: "Monthly appointment count",
      icon: TrendingUp,
    },
  ];

  const visibleAppointments = useMemo(() => {
    return data.todayAppointments.filter((appointment) => {
      const status = getDisplayStatus(appointment.status);

      const matchesStatus =
        appointmentFilter === "All" ||
        status === appointmentFilter;

      const matchesBranch =
        branchFilter === "All branches" ||
        appointment.branch === branchFilter;

      return matchesStatus && matchesBranch;
    });
  }, [data.todayAppointments, appointmentFilter, branchFilter]);

  const appointmentsByBranch = useMemo(() => {
    const grouped = new Map<string, DoctorDuty[]>();

    for (const doctor of data.doctorsOnDuty) {
      const existing = grouped.get(doctor.branch) ?? [];
      existing.push(doctor);
      grouped.set(doctor.branch, existing);
    }

    return Array.from(grouped.entries()).map(([branch, doctors]) => ({
      branch,
      doctors,
    }));
  }, [data.doctorsOnDuty]);

  const analyticsData = useMemo(() => {
    const days = Number.parseInt(dateRange, 10);
    const startDate = getDateDaysAgo(days - 1, data.today);

    return data.analyticsBookings.filter(
      (booking) =>
        booking.date >= startDate && booking.date <= data.today,
    );
  }, [data.analyticsBookings, data.today, dateRange]);

  const chartData = useMemo(() => {
    const days = Number.parseInt(dateRange, 10);
    const result: {
      day: string;
      bookings: number;
      completed: number;
    }[] = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = getDateDaysAgo(i, data.today);
      const dateBookings = analyticsData.filter(
        (booking) => booking.date === date,
      );

      const dateObject = new Date(`${date}T12:00:00+08:00`);

      result.push({
        day: dateObject.toLocaleDateString("en-PH", {
          month: "short",
          day: "numeric",
          timeZone: "Asia/Manila",
        }),
        bookings: dateBookings.length,
        completed: dateBookings.filter(
          (booking) => booking.status === "Completed",
        ).length,
      });
    }

    return result;
  }, [analyticsData, data.today, dateRange]);

  const bookingStatusData = useMemo(() => {
    const statuses: DisplayStatus[] = [
      "Confirmed",
      "Pending",
      "Completed",
      "Declined",
      "Cancelled",
    ];

    return statuses.map((status) => ({
      name: status,
      value: analyticsData.filter(
        (booking) => getDisplayStatus(booking.status) === status,
      ).length,
    }));
  }, [analyticsData]);

  const popularServicesData = useMemo(() => {
    const counts = new Map<string, number>();

    analyticsData.forEach((booking) => {
      counts.set(
        booking.service,
        (counts.get(booking.service) ?? 0) + 1,
      );
    });

    return Array.from(counts.entries())
      .map(([service, appointments]) => ({
        service,
        appointments,
      }))
      .sort((a, b) => b.appointments - a.appointments)
      .slice(0, 5);
  }, [analyticsData]);

  const branchPerformanceData = useMemo(() => {
    const counts = new Map<string, number>();

    analyticsData.forEach((booking) => {
      counts.set(
        booking.branch,
        (counts.get(booking.branch) ?? 0) + 1,
      );
    });

    return Array.from(counts.entries())
      .map(([branch, appointments]) => ({
        branch,
        appointments,
      }))
      .sort((a, b) => b.appointments - a.appointments);
  }, [analyticsData]);

  const currentlyOnDuty = data.doctorsOnDuty.filter(
    (doctor) => doctor.status === "On duty",
  ).length;

  return (
    <div className="mx-auto space-y-6 sm:space-y-8">
      {/* Page heading */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-medium text-[#176B55]">
            Clinic overview
          </p>

          <h1 className="mt-2 text-2xl font-bold tracking-tight text-[#173F35] sm:text-3xl">
            Welcome back, {staff.first_name}!
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Here&apos;s what&apos;s happening at {staff.clinic_name} today.
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
      <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </section>

      <div className="w-full flex flex-col gap-5 xl:flex-row">
        {/* Today's appointments */}
        <section className="overflow-hidden rounded-2xl border w-full xl:w-1/2 border-slate-200 bg-white">
          <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div>
              <div className="flex items-center gap-2">
                <CalendarDays size={19} className="text-[#176B55]" />
                <h2 className="text-lg font-bold text-[#173F35]">
                  Today&apos;s appointments
                </h2>
              </div>

              <p className="mt-1 text-sm text-slate-500">
                {data.todayAppointments.length} appointments scheduled today
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <select
                value={branchFilter}
                onChange={(event) => setBranchFilter(event.target.value)}
                aria-label="Filter appointments by branch"
                className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-600 outline-none focus:border-[#82A995] focus:ring-2 focus:ring-[#DDF3E7]"
              >
                <option value="All branches">All branches</option>
                {data.branches.map((branch) => (
                  <option key={branch} value={branch}>
                    {branch}
                  </option>
                ))}
              </select>

              <select
                value={appointmentFilter}
                onChange={(event) => setAppointmentFilter(event.target.value)}
                aria-label="Filter appointments by status"
                className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-600 outline-none focus:border-[#82A995] focus:ring-2 focus:ring-[#DDF3E7]"
              >
                <option value="All">All</option>
                <option value="Pending">Pending</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Completed">Completed</option>
                <option value="Declined">Declined</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {visibleAppointments.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {visibleAppointments
                .slice()
                .sort((a, b) => a.time.localeCompare(b.time))
                .map((appointment) => {
                  const status = getDisplayStatus(appointment.status);

                  return (
                    <div
                      key={appointment.id}
                      className="flex flex-col gap-3 p-5 transition hover:bg-slate-50/70 sm:flex-row sm:items-center sm:gap-4 sm:px-6"
                    >
                      <div className="flex w-full shrink-0 items-center gap-3 sm:w-48">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#DDF3E7] text-[#176B55]">
                          <Clock3 size={18} />
                        </div>

                        <div>
                          <p className="font-semibold text-[#173F35]">
                            {formatTime(appointment.time)}
                          </p>
                          <p className="text-xs text-slate-500">
                            {appointment.id}
                          </p>
                        </div>
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold text-[#173F35]">
                          {appointment.patient}
                        </p>
                        <p className="mt-0.5 text-sm text-slate-500">
                          {appointment.service}
                        </p>
                      </div>

                      <div className="min-w-0 sm:w-48">
                        <p className="truncate text-sm font-medium text-slate-700">
                          {appointment.doctor}
                        </p>

                        <p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500">
                          <MapPin size={13} />
                          <span className="truncate">{appointment.branch}</span>
                        </p>
                      </div>

                      <span
                        className={`inline-flex w-fit shrink-0 items-center rounded-full border px-3 py-1 text-xs font-semibold ${statusStyles[status]}`}
                      >
                        {status}
                      </span>
                    </div>
                  );
                })}
            </div>
          ) : (
            <div className="p-10 text-center">
              <CalendarDays
                className="mx-auto text-slate-300"
                size={28}
              />

              <p className="mt-3 text-sm font-medium text-slate-700">
                No appointments match these filters
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Try another status or branch.
              </p>
            </div>
          )}

          <div className="flex justify-end border-t border-slate-100 px-5 py-4 sm:px-6">
            <button
              type="button"
              onClick={() => {
                window.location.href = "/bookings";
              }}
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#176B55] transition hover:text-[#173F35]"
            >
              Manage all bookings
              <ChevronRight size={16} />
            </button>
          </div>
        </section>

        {/* Doctors on duty */}
        <section className="space-y-4 w-full xl:w-1/2">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Stethoscope size={19} className="text-[#176B55]" />
                <h2 className="text-lg font-bold text-[#173F35]">
                  Doctors on duty today
                </h2>
              </div>

              <p className="mt-1 text-sm text-slate-500">
                See which doctors are assigned to each branch and their
                scheduled hours.
              </p>
            </div>

            <p className="text-sm font-medium text-slate-500">
              {currentlyOnDuty} currently on duty
            </p>
          </div>

          {appointmentsByBranch.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {appointmentsByBranch.map(({ branch, doctors }) => (
                <div
                  key={branch}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
                >
                  <div className="flex items-center gap-3 border-b border-slate-100 bg-[#F7F9F6] px-5 py-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#DDF3E7] text-[#176B55]">
                      <MapPin size={18} />
                    </div>

                    <div>
                      <h3 className="font-semibold text-[#173F35]">
                        {branch}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {doctors.length}{" "}
                        {doctors.length === 1 ? "schedule" : "schedules"} today
                      </p>
                    </div>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {doctors.map((doctor) => (
                      <div
                        key={doctor.id}
                        className="flex items-start gap-3 px-5 py-4"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-600">
                          {doctor.name
                            .replace("Dr. ", "")
                            .split(" ")
                            .map((part) => part[0])
                            .slice(0, 2)
                            .join("")}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-[#173F35]">
                            {doctor.name}
                          </p>

                          <p className="mt-0.5 text-sm text-slate-500">
                            {doctor.specialty || "Practitioner"}
                          </p>

                          <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                            <Clock3 size={13} />
                            {formatTime(doctor.start)} –{" "}
                            {formatTime(doctor.end)}
                          </p>
                        </div>

                        <span
                          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${dutyStyles[doctor.status]}`}
                        >
                          {doctor.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
              <Stethoscope className="mx-auto text-slate-300" size={28} />
              <p className="mt-3 text-sm font-medium text-slate-700">
                No doctor schedules found for today
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Doctor schedules will appear here once configured.
              </p>
            </div>
          )}
        </section>
      </div>

      {/* Analytics heading */}
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
            onChange={(event) =>
              setDateRange(event.target.value as DateRange)
            }
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

      {/* Appointment analytics */}
      <section className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <AppointmentTrendsChart data={chartData} />
        <BookingStatusChart data={bookingStatusData} />
      </section>

      {/* Service and branch analytics */}
      <section className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <PopularServicesChart data={popularServicesData} />
        <BranchPerformanceChart data={branchPerformanceData} />
      </section>

      {/* Data notice */}
      <div className="flex items-start gap-3 rounded-xl border border-[#B9DCC8] bg-[#DDF3E7]/50 p-4">
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-[#176B55]">
          <ArrowUpRight size={17} />
        </span>

        <div>
          <p className="text-sm font-semibold text-[#173F35]">
            Your analytics dashboard is connected
          </p>

          <p className="mt-1 text-sm leading-6 text-slate-600">
            Analytics are calculated from your clinic&apos;s booking records.
            The selected date range controls the charts above.
          </p>
        </div>
      </div>
    </div>
  );
}
