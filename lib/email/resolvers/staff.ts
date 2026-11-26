import "server-only";

import type { EmailVariables } from "../types";
import { createSupabaseAdmin } from "@/lib/supabase/admin";

export async function resolveStaffVariables(
  staffId: string
): Promise<EmailVariables> {
  const supabase = createSupabaseAdmin();

  // Get staff details.
  const { data: staff, error: staffError } = await supabase
    .from("staff")
    .select("id, first_name, last_name")
    .eq("id", staffId)
    .single();

  if (staffError || !staff) {
    throw new Error(
      `Failed to resolve staff variables: ${
        staffError?.message ?? "Staff not found"
      }`
    );
  }

  // Get email from Supabase Auth.
  const { data: userData, error: userError } =
    await supabase.auth.admin.getUserById(staff.id);

  if (userError || !userData.user) {
    throw new Error(
      `Failed to resolve staff email: ${
        userError?.message ?? "User not found"
      }`
    );
  }

  return {
    staff_name: [staff.first_name, staff.last_name]
      .filter(Boolean)
      .join(" "),
    staff_email: userData.user.email ?? "",
  };
}