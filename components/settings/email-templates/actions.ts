
"use server";

import { getClinicContext } from "@/app/(dashboard)/bookings/actions";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
export async function resetEmailTemplate(code: string) {
  try {
    const context = await getClinicContext();

    if (!context?.clinicId) {
      return {
        success: false,
        error: "Unauthorized clinic access.",
      };
    }

    const adminSupabase = createSupabaseAdmin();

    // Verify that the global default exists.
    const { data: defaultTemplate, error: defaultError } =
      await adminSupabase
        .from("email_templates")
        .select("id")
        .eq("code", code)
        .is("clinic_id", null)
        .maybeSingle();

    if (defaultError || !defaultTemplate) {
      return {
        success: false,
        error: "Default email template not found.",
      };
    }

    // Delete only this clinic's customized template.
    const { error: deleteError } = await adminSupabase
      .from("email_templates")
      .delete()
      .eq("clinic_id", context.clinicId)
      .eq("code", code);

    if (deleteError) {
      return {
        success: false,
        error: deleteError.message,
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error("Reset email template error:", error);

    return {
      success: false,
      error: "Something went wrong.",
    };
  }
}
