
import "server-only";

import { createSupabaseAdmin } from "@/lib/supabase/admin";
import type { EmailVariables } from "../types";

export async function resolveClinicVariables(
  clinicId: string
): Promise<EmailVariables> {
  const supabase = createSupabaseAdmin();

  const { data: clinic, error } = await supabase
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
    .eq("id", clinicId)
    .single();

  if (error || !clinic) {
    throw new Error("Unable to retrieve clinic information.");
  }

  return {
    clinic_id: clinic.id,
    clinic_name: clinic.name,
    clinic_email: clinic.contact_email,
    clinic_phone: clinic.phone,
    clinic_logo_url: clinic.logo_url,
    clinic_website_url: clinic.website_url,
    clinic_contact_url: clinic.contact_url,
    clinic_header_image_url: clinic.email_header_image_url,
    booking_url: `${process.env.NEXT_PUBLIC_APP_URL}/book-an-appointment?clinic=${clinic.id}`,
  };
}
