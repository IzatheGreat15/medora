"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function logout() {
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("Logout error:", error.message);
    throw new Error("Failed to log out.");
  }

  redirect("/login");
}