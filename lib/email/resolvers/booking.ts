
import "server-only";

import { createSupabaseAdmin } from "@/lib/supabase/admin";
import type { EmailVariables } from "../types";

export async function resolveBookingVariables(
  bookingId: string
): Promise<EmailVariables> {
  const supabase = createSupabaseAdmin();

  const { data: booking, error } = await supabase
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
      service_price,
      service_duration
    `)
    .eq("id", bookingId)
    .single();

  if (error || !booking) {
    throw new Error("Unable to retrieve booking information.");
  }

  const { data: clinic } = await supabase
    .from("clinics")
    .select(`
      id,
      name,
      contact_email,
      phone,
      logo_url,
      website_url,
      contact_url,
      email_header_image_url
    `)
    .eq("id", booking.clinic_id)
    .single();

  const { data: branch } = await supabase
    .from("branches")
    .select("id, name, address, phone, email, clinic_id")
    .eq("id", booking.branch_id)
    .single();

  const { data: doctor } = await supabase
    .from("doctors")
    .select("id, name, specialty, email, phone, clinic_id")
    .eq("id", booking.doctor_id)
    .single();

  if (
    !clinic ||
    !branch ||
    !doctor ||
    branch.clinic_id !== booking.clinic_id ||
    doctor.clinic_id !== booking.clinic_id
  ) {
    throw new Error("Unable to retrieve valid booking relationships.");
  }

  return {
    patient_name: booking.patient_full_name,
    patient_email: booking.patient_email,
    patient_phone: booking.patient_phone,
    patient_notes: booking.patient_notes,

    clinic_name: clinic.name,
    clinic_email: clinic.contact_email,
    clinic_phone: clinic.phone,
    clinic_logo_url: clinic.logo_url,
    clinic_website_url: clinic.website_url,
    clinic_contact_url: clinic.contact_url,
    clinic_header_image_url: clinic.email_header_image_url,

    branch_name: branch.name,
    branch_address: branch.address,
    branch_phone: branch.phone,
    branch_email: branch.email,

    doctor_name: doctor.name,
    doctor_email: doctor.email,
    doctor_phone: doctor.phone,
    doctor_specialty: doctor.specialty,

    service_name: booking.service_name,
    service_price: booking.service_price,
    service_duration: booking.service_duration,

    appointment_date: new Date(
      `${booking.appointment_date}T00:00:00`
    ).toLocaleDateString("en-PH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),

    appointment_time: new Date(
      `1970-01-01T${booking.appointment_time}`
    ).toLocaleTimeString("en-PH", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }),

    booking_id: booking.id,
    decline_url: `${process.env.NEXT_PUBLIC_APP_URL}/bookings/${booking.id}/decline-changes`,
  };
}
