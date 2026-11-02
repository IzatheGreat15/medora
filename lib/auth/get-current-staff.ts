
import "server-only";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { DashboardStaff } from "@/components/dashboard/DashboardLayoutClient";

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
      staffError?.message ?? "No staff record found",
    );

    await supabase.auth.signOut();
    redirect("/login?error=unauthorized");
  }

  // Validate the staff record's role and clinic assignment.
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

  // Platform admins do not belong to a clinic.
  let clinic: { id: string; name: string } | null = null;

  if (validClinicUser) {
    const { data, error: clinicError } = await admin
      .from("clinics")
      .select("id, name")
      .eq("id", staff.clinic_id)
      .maybeSingle();

    if (clinicError || !data) {
      console.error(
        "Failed to retrieve clinic:",
        clinicError?.message ?? "Clinic not found",
      );

      redirect("/login?error=unauthorized");
    }

    clinic = data;
  }

  // Attach the clinic information to the staff object.
  const clinicStaff: DashboardStaff = {
    id: staff.id,
    first_name: staff.first_name,
    last_name: staff.last_name,
    role: "clinic_user",
    clinic_role: staff.clinic_role as "owner" | "manager" | "staff",
    clinic_id: staff.clinic_id,
    clinic_name: clinic?.name ?? '',
  };

  return {
    user,
    staff: clinicStaff,
  };
}
