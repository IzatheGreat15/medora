
import "server-only";

import { createSupabaseAdmin } from "@/lib/supabase/admin";

const TIME_ZONE = "Asia/Manila";

export type DashboardAppointmentStatus =
  | "Pending"
  | "Approved"
  | "Rejected"
  | "Cancelled"
  | "Completed";

export type DashboardData = {
  today: string;
  stats: {
    appointmentsToday: number;
    awaitingApproval: number;
    doctors: number;
    completedThisMonth: number;
  };
  branches: string[];
  todayAppointments: {
    id: string;
    patient: string;
    service: string;
    doctor: string;
    branch: string;
    time: string;
    status: DashboardAppointmentStatus;
  }[];
  doctorsOnDuty: {
    id: string;
    name: string;
    specialty: string;
    branch: string;
    start: string;
    end: string;
    status: "On duty" | "Off duty";
  }[];
  analyticsBookings: {
    date: string;
    status: DashboardAppointmentStatus;
    service: string;
    branch: string;
  }[];
};

function getManilaDate(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function getManilaTime(date = new Date()) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(date);
}

function getManilaDayOfWeek(dateString: string) {
  const date = new Date(`${dateString}T12:00:00+08:00`);
  return date.getDay();
}

function getMonthStart(dateString: string) {
  return `${dateString.slice(0, 7)}-01`;
}

function normalizeTime(time: string) {
  return time.slice(0, 5);
}

function isWithinWorkingHours(
  currentTime: string,
  startTime: string,
  endTime: string,
) {
  const current = currentTime.slice(0, 5);
  const start = normalizeTime(startTime);
  const end = normalizeTime(endTime);

  return current >= start && current < end;
}

function formatDatabaseError(
  message: string,
  operation: string,
): Error {
  return new Error(`Dashboard ${operation} failed: ${message}`);
}

export async function getDashboardData(
  clinicId: string,
): Promise<DashboardData> {
  const supabase = createSupabaseAdmin();

  const now = new Date();
  const today = getManilaDate(now);
  const currentTime = getManilaTime(now);
  const monthStart = getMonthStart(today);

  const analyticsStart = new Date(
    new Date(`${today}T12:00:00+08:00`).getTime() -
      89 * 24 * 60 * 60 * 1000,
  );

  const analyticsStartDate = getManilaDate(analyticsStart);

  const [
    todayBookingsResult,
    monthCompletedResult,
    analyticsBookingsResult,
    doctorsResult,
    branchesResult,
    doctorBranchesResult,
  ] = await Promise.all([
    supabase
      .from("bookings")
      .select(
        "id, patient_full_name, service_name, doctor_id, branch_id, appointment_date, appointment_time, status",
      )
      .eq("clinic_id", clinicId)
      .eq("appointment_date", today)
      .order("appointment_time", { ascending: true }),

    supabase
      .from("bookings")
      .select("id", { count: "exact", head: true })
      .eq("clinic_id", clinicId)
      .eq("status", "Completed")
      .gte("appointment_date", monthStart)
      .lte("appointment_date", today),

    supabase
      .from("bookings")
      .select(
        "id, appointment_date, status, service_name, branch_id",
      )
      .eq("clinic_id", clinicId)
      .gte("appointment_date", analyticsStartDate)
      .lte("appointment_date", today),

    supabase
      .from("doctors")
      .select("id, name, specialty, status")
      .eq("clinic_id", clinicId)
      .eq("status", "Active"),

    supabase
      .from("branches")
      .select("id, name")
      .eq("clinic_id", clinicId),

    supabase
      .from("doctor_branches")
      .select("id, doctor_id, branch_id")
      .eq("clinic_id", clinicId),
  ]);

  if (todayBookingsResult.error) {
    throw formatDatabaseError(
      todayBookingsResult.error.message,
      "today's bookings",
    );
  }

  if (monthCompletedResult.error) {
    throw formatDatabaseError(
      monthCompletedResult.error.message,
      "monthly completed bookings",
    );
  }

  if (analyticsBookingsResult.error) {
    throw formatDatabaseError(
      analyticsBookingsResult.error.message,
      "analytics bookings",
    );
  }

  if (doctorsResult.error) {
    throw formatDatabaseError(
      doctorsResult.error.message,
      "doctors",
    );
  }

  if (branchesResult.error) {
    throw formatDatabaseError(
      branchesResult.error.message,
      "branches",
    );
  }

  if (doctorBranchesResult.error) {
    throw formatDatabaseError(
      doctorBranchesResult.error.message,
      "doctor branch assignments",
    );
  }

  const bookings = todayBookingsResult.data ?? [];
  const doctors = doctorsResult.data ?? [];
  const branches = branchesResult.data ?? [];
  const doctorBranches = doctorBranchesResult.data ?? [];
  const analyticsBookings = analyticsBookingsResult.data ?? [];

  const branchMap = new Map(
    branches.map((branch) => [branch.id, branch.name]),
  );

  const doctorMap = new Map(
    doctors.map((doctor) => [doctor.id, doctor]),
  );

  const doctorBranchIds = doctorBranches.map(
    (assignment) => assignment.id,
  );

  let workingHours: {
    doctor_branch_id: string;
    day_of_week: number;
    start_time: string;
    end_time: string;
  }[] = [];

  if (doctorBranchIds.length > 0) {
    const workingHoursResult = await supabase
      .from("doctor_working_hours")
      .select(
        "doctor_branch_id, day_of_week, start_time, end_time",
      )
      .in("doctor_branch_id", doctorBranchIds);

    if (workingHoursResult.error) {
      throw formatDatabaseError(
        workingHoursResult.error.message,
        "doctor working hours",
      );
    }

    workingHours = workingHoursResult.data ?? [];
  }

  const currentDay = getManilaDayOfWeek(today);

  const doctorsOnDuty = doctorBranches.flatMap((assignment) => {
    const doctor = doctorMap.get(assignment.doctor_id);
    const branch = branchMap.get(assignment.branch_id);

    if (!doctor || !branch) return [];

    const schedules = workingHours.filter(
      (schedule) =>
        schedule.doctor_branch_id === assignment.id &&
        schedule.day_of_week === currentDay,
    );

    return schedules.map((schedule) => ({
      id: `${assignment.id}-${schedule.start_time}`,
      name: doctor.name,
      specialty: doctor.specialty ?? "",
      branch,
      start: normalizeTime(schedule.start_time),
      end: normalizeTime(schedule.end_time),
      status: isWithinWorkingHours(
        currentTime,
        schedule.start_time,
        schedule.end_time,
      )
        ? ("On duty" as const)
        : ("Off duty" as const),
    }));
  });

  const todayAppointments = bookings.map((booking) => ({
    id: booking.id,
    patient: booking.patient_full_name,
    service: booking.service_name,
    doctor: doctorMap.get(booking.doctor_id)?.name ?? "Unassigned",
    branch: branchMap.get(booking.branch_id) ?? "Unknown branch",
    time: normalizeTime(booking.appointment_time),
    status: booking.status as DashboardAppointmentStatus,
  }));

  const analytics = analyticsBookings.map((booking) => ({
    date: booking.appointment_date,
    status: booking.status as DashboardAppointmentStatus,
    service: booking.service_name ?? "Unspecified service",
    branch: branchMap.get(booking.branch_id) ?? "Unknown branch",
  }));

  return {
    today,
    stats: {
      appointmentsToday: bookings.length,
      awaitingApproval: bookings.filter(
        (booking) => booking.status === "Pending",
      ).length,
      doctors: doctors.length,
      completedThisMonth: monthCompletedResult.count ?? 0,
    },
    branches: branches.map((branch) => branch.name),
    todayAppointments,
    doctorsOnDuty,
    analyticsBookings: analytics,
  };
}
