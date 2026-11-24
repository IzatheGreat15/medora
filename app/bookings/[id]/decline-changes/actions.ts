"use server";

import { createSupabaseAdmin } from "@/lib/supabase/admin";

export async function cancelUpdatedBooking(bookingId: string) {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  if (!uuidRegex.test(bookingId)) {
    return {
      success: false,
      message: "Invalid booking.",
    };
  }

  const supabase = createSupabaseAdmin();

  // Retrieve the booking.
  const { data: booking, error: fetchError } = await supabase
    .from("bookings")
    .select("id, status, is_updated")
    .eq("id", bookingId)
    .maybeSingle();

  if (fetchError || !booking) {
    return {
      success: false,
      message: "We couldn't find this appointment.",
    };
  }

  if (booking.status === "Cancelled") {
    return {
      success: true,
      alreadyCancelled: true,
    };
  }

  // Only allow cancellation of approved, updated appointments.
  if (booking.status !== "Approved" || !booking.is_updated) {
    return {
      success: false,
      message: "This appointment cannot be cancelled through this link.",
    };
  }

  // Update booking status.
  const { data, error } = await supabase
    .from("bookings")
    .update({
      status: "Cancelled",
    })
    .eq("id", bookingId)
    .eq("status", "Approved")
    .eq("is_updated", true)
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("Failed to cancel booking:", error.message);

    return {
      success: false,
      message: "Unable to cancel your appointment. Please try again.",
    };
  }

  if (!data) {
    return {
      success: false,
      message: "This appointment could not be cancelled. Please refresh the page.",
    };
  }

  return {
    success: true,
    alreadyCancelled: false,
  };
}