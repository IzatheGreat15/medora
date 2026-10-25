"use client";

import { useEffect, useMemo, useState } from "react";
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
  CheckCircle2,
  CircleAlert,
} from "lucide-react";

import AppointmentTrendsChart from "@/components/dashboard/charts/AppointmentTrendsChart";
import BookingStatusChart from "@/components/dashboard/charts/BookingStatusChart";
import PopularServicesChart from "@/components/dashboard/charts/PopularServicesChart";
import BranchPerformanceChart from "@/components/dashboard/charts/BranchPerformanceChart";
import StatCard from "@/components/dashboard/charts/StatCard";
import { getCurrentDate } from "@/lib/date";

type AppointmentStatus = "Confirmed" | "Pending" | "Completed" | "Declined";

type TodayAppointment = {
  id: string;
  patient: string;
  service: string;
  doctor: string;
  branch: string;
  time: string; // 24-hour HH:mm, local clinic time
  status: AppointmentStatus;
};

type DoctorDuty = {
  id: string;
  name: string;
  specialty: string;
  branch: string;
  start: string;
  end: string;
  status: "On duty" | "On break" | "Off duty";
};

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

// Prototype data: replace with today's appointments from your database/API.
const todayAppointments: TodayAppointment[] = [
  {
    id: "APT-1001",
    patient: "Emily Carter",
    service: "General Consultation",
    doctor: "Dr. Maria Santos",
    branch: "Cebu City Branch",
    time: "08:30",
    status: "Confirmed",
  },
  {
    id: "APT-1002",
    patient: "James Wilson",
    service: "Follow-up Consultation",
    doctor: "Dr. Daniel Reyes",
    branch: "Mandaue Branch",
    time: "09:00",
    status: "Confirmed",
  },
  {
    id: "APT-1003",
    patient: "Sophia Garcia",
    service: "Skin Consultation",
    doctor: "Dr. Angela Lim",
    branch: "Cebu City Branch",
    time: "09:30",
    status: "Pending",
  },
  {
    id: "APT-1004",
    patient: "Noah Martinez",
    service: "Preventive Health Check",
    doctor: "Dr. Maria Santos",
    branch: "Cebu City Branch",
    time: "10:00",
    status: "Confirmed",
  },
  {
    id: "APT-1005",
    patient: "Olivia Brown",
    service: "General Consultation",
    doctor: "Dr. Daniel Reyes",
    branch: "Mandaue Branch",
    time: "10:30",
    status: "Completed",
  },
  {
    id: "APT-1006",
    patient: "Liam Davis",
    service: "Follow-up Consultation",
    doctor: "Dr. Angela Lim",
    branch: "Lapu-Lapu Branch",
    time: "11:00",
    status: "Confirmed",
  },
];

// Prototype schedule: replace with doctors' branch assignments and working hours.
const doctorsOnDuty: DoctorDuty[] = [
  {
    id: "DOC-01",
    name: "Dr. Maria Santos",
    specialty: "General Practitioner",
    branch: "Cebu City Branch",
    start: "08:00",
    end: "17:00",
    status: "On duty",
  },
  {
    id: "DOC-02",
    name: "Dr. Daniel Reyes",
    specialty: "Family Medicine",
    branch: "Mandaue Branch",
    start: "09:00",
    end: "18:00",
    status: "On duty",
  },
  {
    id: "DOC-03",
    name: "Dr. Angela Lim",
    specialty: "Dermatology",
    branch: "Cebu City Branch",
    start: "08:30",
    end: "16:30",
    status: "On break",
  },
  {
    id: "DOC-04",
    name: "Dr. Patrick Cruz",
    specialty: "General Practitioner",
    branch: "Lapu-Lapu Branch",
    start: "13:00",
    end: "17:00",
    status: "Off duty",
  },
];

const statusStyles: Record<AppointmentStatus, string> = {
  Confirmed: "border-[#B9DCC8] bg-[#DDF3E7] text-[#176B55]",
  Pending: "border-amber-200 bg-amber-50 text-amber-700",
  Completed: "border-sky-200 bg-sky-50 text-sky-700",
  Declined: "border-rose-200 bg-rose-50 text-rose-700",
};

const dutyStyles: Record<DoctorDuty["status"], string> = {
  "On duty": "bg-emerald-50 text-emerald-700",
  "On break": "bg-amber-50 text-amber-700",
  "Off duty": "bg-slate-100 text-slate-600",
};

function formatTime(time: string, currentDate: Date|null) {
  if (currentDate === null)
    return;

  const [hours, minutes] = time.split(":").map(Number);
  const date = currentDate;
  date.setHours(hours, minutes, 0, 0);
  return date.toLocaleTimeString("en-PH", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export default function DashboardPage() {
  const [dateRange, setDateRange] = useState("30d");
  const [appointmentFilter, setAppointmentFilter] = useState("All");
  const [branchFilter, setBranchFilter] = useState("All branches");
  const [currentDate, setCurrentDate] = useState<Date|null>(null);

  const branches = useMemo(
    () => [...new Set(doctorsOnDuty.map((doctor) => doctor.branch))],
    [],
  );

  const visibleAppointments = useMemo(() => {
    return todayAppointments.filter((appointment) => {
      const matchesStatus =
        appointmentFilter === "All" || appointment.status === appointmentFilter;
      const matchesBranch =
        branchFilter === "All branches" || appointment.branch === branchFilter;
      return matchesStatus && matchesBranch;
    });
  }, [appointmentFilter, branchFilter]);

  const appointmentsByBranch = useMemo(() => {
    return branches.map((branch) => ({
      branch,
      doctors: doctorsOnDuty.filter((doctor) => doctor.branch === branch),
    }));
  }, [branches]);

  useEffect(() => {
    setCurrentDate(getCurrentDate());
  }, []);

  return (
    <div className="mx-auto max-w-7xl space-y-6 sm:space-y-8">
      {/* Page heading */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-medium text-[#176B55]">Clinic overview</p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-[#173F35] sm:text-3xl">
            Welcome back, John!
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Here&apos;s what&apos;s happening at your clinic today.
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

      {/* Today's appointments */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <div className="flex items-center gap-2">
              <CalendarDays size={19} className="text-[#176B55]" />
              <h2 className="text-lg font-bold text-[#173F35]">
                Today&apos;s appointments
              </h2>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              {todayAppointments.length} sample appointments scheduled today
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <select
              value={branchFilter}
              onChange={(event) => setBranchFilter(event.target.value)}
              aria-label="Filter appointments by branch"
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-600 outline-none focus:border-[#82A995] focus:ring-2 focus:ring-[#DDF3E7]"
            >
              <option>All branches</option>
              {branches.map((branch) => (
                <option key={branch}>{branch}</option>
              ))}
            </select>
            <select
              value={appointmentFilter}
              onChange={(event) => setAppointmentFilter(event.target.value)}
              aria-label="Filter appointments by status"
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-600 outline-none focus:border-[#82A995] focus:ring-2 focus:ring-[#DDF3E7]"
            >
              <option>All</option>
              <option>Pending</option>
              <option>Confirmed</option>
              <option>Completed</option>
              <option>Declined</option>
            </select>
          </div>
        </div>

        {visibleAppointments.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {visibleAppointments
              .slice()
              .sort((a, b) => a.time.localeCompare(b.time))
              .map((appointment) => (
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
                        {formatTime(appointment.time, currentDate)}
                      </p>
                      <p className="text-xs text-slate-500">{appointment.id}</p>
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
                    className={`inline-flex w-fit shrink-0 items-center rounded-full border px-3 py-1 text-xs font-semibold ${statusStyles[appointment.status]}`}
                  >
                    {appointment.status}
                  </span>
                </div>
              ))}
          </div>
        ) : (
          <div className="p-10 text-center">
            <CalendarDays className="mx-auto text-slate-300" size={28} />
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
      <section className="space-y-4">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Stethoscope size={19} className="text-[#176B55]" />
              <h2 className="text-lg font-bold text-[#173F35]">
                Doctors on duty today
              </h2>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              See which practitioners are assigned to each branch and their scheduled hours.
            </p>
          </div>
          <p className="text-sm font-medium text-slate-500">
            {doctorsOnDuty.filter((doctor) => doctor.status === "On duty").length} currently on duty
          </p>
        </div>

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
                  <h3 className="font-semibold text-[#173F35]">{branch}</h3>
                  <p className="text-xs text-slate-500">
                    {doctors.length} {doctors.length === 1 ? "doctor" : "doctors"} scheduled
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
                      <p className="font-semibold text-[#173F35]">{doctor.name}</p>
                      <p className="mt-0.5 text-sm text-slate-500">{doctor.specialty}</p>
                      <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                        <Clock3 size={13} />
                        {formatTime(doctor.start, currentDate)} – {formatTime(doctor.end, currentDate)}
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
      </section>

      {/* Analytics heading and filter */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-[#173F35]">Clinic analytics</h2>
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
            The charts, appointments, and doctor schedules currently use sample data.
            Connect your appointment, service, practitioner, branch, and working-hours
            records to display live clinic information.
          </p>
        </div>
      </div>
    </div>
  );
}
