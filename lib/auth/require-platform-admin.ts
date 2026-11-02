
import "server-only";

import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdmin } from "@/lib/supabase/admin";

export async function requirePlatformAdmin() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login");
  }

  const admin = createSupabaseAdmin();

  const { data: staff, error: staffError } = await admin
    .from("staff")
    .select("id, first_name, last_name, role, clinic_id")
    .eq("id", user.id)
    .maybeSingle();

  if (
    staffError ||
    !staff ||
    staff.role !== "platform_admin" ||
    staff.clinic_id !== null
  ) {
    redirect("/login?error=unauthorized");
  }

  return { user, staff };
}
