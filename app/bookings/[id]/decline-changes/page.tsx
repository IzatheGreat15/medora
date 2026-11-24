import { createSupabaseAdmin } from "@/lib/supabase/admin";
import DeclineChangesClient from "./DeclineChangesClient";

export const instant = false;

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function DeclineChangesPage({
  params,
}: PageProps) {
  const { id } = await params;

  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  if (!uuidRegex.test(id)) {
    return (
      <DeclineChangesClient
        booking={null}
        initialError="Invalid appointment link."
      />
    );
  }

  const supabase = createSupabaseAdmin();

  const { data: booking, error } = await supabase
    .from("bookings")
    .select(`
      id,
      clinic_id,
      patient_full_name,
      appointment_date,
      appointment_time,
      service_name,
      status,
      is_updated
    `)
    .eq("id", id)
    .maybeSingle();

  if (error || !booking) {
    return (
      <DeclineChangesClient
        booking={null}
        initialError="We couldn't find this appointment."
      />
    );
  }

  return (
    <DeclineChangesClient
      booking={{
        id: booking.id,
        clinicId: booking.clinic_id,
        patientName: booking.patient_full_name,
        appointmentDate: booking.appointment_date,
        appointmentTime: booking.appointment_time,
        serviceName: booking.service_name,
        status: booking.status,
        isUpdated: booking.is_updated,
      }}
      initialError={
        booking.status !== "Cancelled" &&
        (booking.status !== "Approved" || !booking.is_updated)
          ? "This appointment cannot be cancelled through this link."
          : null
      }
    />
  );
}