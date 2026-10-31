
import "server-only";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdmin } from "@/lib/supabase/admin";

export async function getCurrentStaff() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  const admin = createSupabaseAdmin();

  const { data: staff, error: staffError } = await admin
    .from("staff")
    .select("id, clinic_id, first_name, last_name, role, clinic_role")
    .eq("id", user.id)
    .maybeSingle();

  if (staffError || !staff) {
    console.error(
      "Failed to retrieve current staff:",
      staffError?.message ?? "No staff record found"
    );

    await supabase.auth.signOut();
    redirect("/login?error=unauthorized");
  }

  // Validate that the staff record matches the expected role structure.
  const validPlatformAdmin =
    staff.role === "platform_admin" &&
    staff.clinic_id === null &&
    staff.clinic_role === null;

  const validClinicUser =
    staff.role === "clinic_user" &&
    staff.clinic_id !== null &&
    ["owner", "manager", "staff"].includes(staff.clinic_role);

  if (!validPlatformAdmin && !validClinicUser) {
    await supabase.auth.signOut();
    redirect("/login?error=unauthorized");
  }

  return {
    user,
    staff,
  };
}
