import "server-only";

import { createSupabaseAdmin } from "@/lib/supabase/admin";

export async function resolveStaffPasswordUrl(
  email: string
): Promise<string> {
  const supabase = createSupabaseAdmin();

  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  if (!appUrl) {
    throw new Error("NEXT_PUBLIC_APP_URL is not configured.");
  }

  const { data, error } = await supabase.auth.admin.generateLink({
    type: "recovery",
    email,
    options: {
      redirectTo: `${appUrl}/set-password`,
    },
  });

  if (error || !data.properties?.action_link) {
    throw new Error(
      error?.message ?? "Failed to generate password setup link."
    );
  }

  return data.properties.action_link;
}