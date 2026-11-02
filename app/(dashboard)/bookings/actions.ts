
"use server";

import "server-only";

import { getCurrentStaff } from "@/lib/auth/get-current-staff";
import { createSupabaseAdmin } from "@/lib/supabase/admin";

export type DashboardBooking = {
  id: string;
  patient: string;
  email: string;
  phone: string;
  service: string;
  doctor: string;
  branch: string;
  date: string;
  time: string;
  duration: number;
  status: "Pending" | "Confirmed" | "Declined" | "Completed";
  notes: string;
};

export async function getClinicContext() {
  const { staff } = await getCurrentStaff();

  if (
    staff.role !== "clinic_user" ||
    !staff.clinic_id
  ) {
    throw new Error("You are not authorized to access clinic bookings.");
  }

  return {
    clinicId: staff.clinic_id,
    supabase: createSupabaseAdmin(),
  };
}

function mapStatus(
  status: string,
): DashboardBooking["status"] {
  switch (status) {
    case "Pending":
      return "Pending";
    case "Approved":
    case "Confirmed":
      return "Confirmed";
    case "Rejected":
    case "Declined":
      return "Declined";
    case "Completed":
      return "Completed";
    default:
      return "Pending";
  }
}

export async function getClinicBookings(): Promise<DashboardBooking[]> {
  const { clinicId, supabase } = await getClinicContext();

  const { data, error } = await supabase
    .from("bookings")
    .select(`
      id,
      clinic_id,
      branch_id,
      doctor_id,
      service_id,
      patient_full_name,
      patient_email,
      patient_phone,
      patient_notes,
      appointment_date,
      appointment_time,
      service_name,
      service_duration,
      status
    `)
    .eq("clinic_id", clinicId)
    .order("appointment_date", { ascending: false })
    .order("appointment_time", { ascending: false });

  if (error) {
    console.error("Failed to fetch bookings:", error.message);
    throw new Error("Unable to load bookings.");
  }

  const bookings = data ?? [];

  if (!bookings.length) return [];

  const branchIds = [
    ...new Set(bookings.map((booking) => booking.branch_id)),
  ];

  const doctorIds = [
    ...new Set(bookings.map((booking) => booking.doctor_id)),
  ];

  const [branchResult, doctorResult] = await Promise.all([
    supabase
      .from("branches")
      .select("id, name")
      .eq("clinic_id", clinicId)
      .in("id", branchIds),

    supabase
      .from("doctors")
      .select("id, name")
      .eq("clinic_id", clinicId)
      .in("id", doctorIds),
  ]);

  if (branchResult.error || doctorResult.error) {
    console.error(
      "Failed to load booking relationships:",
      branchResult.error?.message,
      doctorResult.error?.message,
    );

    throw new Error("Unable to load booking details.");
  }

  const branchMap = new Map(
    (branchResult.data ?? []).map((item) => [item.id, item.name]),
  );

  const doctorMap = new Map(
    (doctorResult.data ?? []).map((item) => [item.id, item.name]),
  );

  return bookings.map((booking) => ({
    id: booking.id,
    patient: booking.patient_full_name,
    email: booking.patient_email,
    phone: booking.patient_phone,
    service: booking.service_name,
    doctor: doctorMap.get(booking.doctor_id) ?? "Unknown doctor",
    branch: branchMap.get(booking.branch_id) ?? "Unknown branch",
    date: booking.appointment_date,
    time: String(booking.appointment_time).slice(0, 5),
    duration: Number(booking.service_duration),
    status: mapStatus(booking.status),
    notes: booking.patient_notes ?? "",
  }));
}

export async function updateBookingStatus(
  bookingId: string,
  status: "Approved" | "Rejected",
) {
  if (
    typeof bookingId !== "string" ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      bookingId,
    )
  ) {
    throw new Error("Invalid booking.");
  }

  if (!["Approved", "Rejected"].includes(status)) {
    throw new Error("Invalid booking status.");
  }

  const { clinicId, supabase } = await getClinicContext();

  const { data, error } = await supabase
    .from("bookings")
    .update({ status })
    .eq("id", bookingId)
    .eq("clinic_id", clinicId)
    .eq("status", "Pending")
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("Failed to update booking:", error.message);
    throw new Error("Unable to update booking status.");
  }

  if (!data) {
    throw new Error(
      "This booking is no longer pending or is unavailable.",
    );
  }

  return { success: true };
}
