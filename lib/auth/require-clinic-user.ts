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

  const { data: clinic, error } = await admin
    .from("clinics")
    .select("id, status, trial_ends_at")
    .eq("id", staff.clinic_id)
    .maybeSingle();

  let hasAccess = false;

  if (!error && clinic) {
    const status = String(clinic.status).toLowerCase();

    if (status === "active") {
      hasAccess = true;
    } else if (status === "trial" && clinic.trial_ends_at) {
      hasAccess =
        Date.now() <= new Date(clinic.trial_ends_at).getTime();
    }
  }

  if (!hasAccess) {
    const supabase = await createSupabaseAdmin();
    await supabase.auth.signOut();
    redirect("/login?error=unauthorized");
  }

  return {
    user,
    staff,
    clinicId: staff.clinic_id,
  };
}