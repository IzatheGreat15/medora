
import "server-only";

import { redirect } from "next/navigation";
import { getCurrentStaff } from "@/lib/auth/get-current-staff";
import { createSupabaseAdmin } from "@/lib/supabase/admin";

export async function requireClinicUser() {
  const { user, staff } = await getCurrentStaff();

  if (staff.role !== "clinic_user" || !staff.clinic_id) {
    redirect("/admin");
  }

  const admin = createSupabaseAdmin();

  const { data: clinic, error: clinicError } = await admin
    .from("clinics")
    .select("id, name")
    .eq("id", staff.clinic_id)
    .maybeSingle();

  if (clinicError || !clinic) {
    console.error(
      "Failed to retrieve clinic:",
      clinicError?.message ?? "Clinic not found"
    );

    redirect("/login?error=unauthorized");
  }

  return {
    user,
    staff,
    clinicId: clinic.id,
    clinicName: clinic.name,
  };
}
