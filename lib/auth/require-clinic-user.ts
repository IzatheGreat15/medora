
import "server-only";

import { redirect } from "next/navigation";
import { getCurrentStaff } from "@/lib/auth/get-current-staff";
import { createSupabaseAdmin } from "@/lib/supabase/admin";

export async function requireClinicUser() {
  const { user, staff } = await getCurrentStaff();

  if (staff.role !== "clinic_user" || !staff.clinic_id) {
    redirect("/admin");
  }

  return {
    user,
    staff,
    clinicId: staff.clinic_id,
  };
}
