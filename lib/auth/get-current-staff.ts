import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getCurrentStaff() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return null;
  }

  const { data: staff, error } = await supabase
    .from("staff")
    .select("first_name, last_name, role, clinic_role")
    .eq("id", user.id)
    .maybeSingle();

  if (error || !staff) {
    return null;
  }

  return staff;
}