
"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";

export async function signIn(formData: FormData) {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();

  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    redirect("/login?error=invalid_input");
  }

  const supabase = await createSupabaseServerClient();

  const { data: authData, error: signInError } =
    await supabase.auth.signInWithPassword({
      email,
      password,
    });

  if (signInError || !authData.user) {
    redirect("/login?error=invalid_credentials");
  }

  // Verify the authenticated user's identity before using the admin client.
  const { data: verifiedData, error: verifyError } =
    await supabase.auth.getUser();

  if (verifyError || !verifiedData.user) {
    await supabase.auth.signOut();
    redirect("/login?error=unauthorized");
  }

  // Use the server-only service-role client for the staff lookup.
  const admin = createSupabaseAdmin();

  const { data: staff, error: staffError } = await admin
    .from("staff")
    .select("role, clinic_id")
    .eq("id", verifiedData.user.id)
    .maybeSingle();

  if (staffError || !staff) {
    console.error("Staff lookup failed:", staffError?.message ?? "No staff record found");

    await supabase.auth.signOut();
    redirect("/login?error=unauthorized");
  }

  if (staff.role === "platform_admin" && staff.clinic_id === null) {
    redirect("/admin");
  }

  if (staff.role === "clinic_user" && staff.clinic_id !== null) {
    redirect("/dashboard");
  }

  await supabase.auth.signOut();
  redirect("/login?error=unauthorized");
}
