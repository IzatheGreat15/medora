
import "server-only";

import { createSupabaseAdmin } from "@/lib/supabase/admin";

import { renderEmailTemplate } from "./render-email-template";
import { resolveEmailVariables } from "./resolve-email-variables";

import type {
  EmailTemplate,
  SendEmailOptions,
  SendEmailResult,
} from "./types";
import { processEmailQueue } from "./process-email-queue";

export async function sendEmail({
  templateId,
  clinicId,
  to,
  recipientName = null,
  resolverIds = {},
  variables = {},
  metadata = {},
}: SendEmailOptions): Promise<SendEmailResult> {
  const supabase = createSupabaseAdmin();

  try {
    if (!to || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
      throw new Error("Invalid recipient email address.");
    }

    // Retrieve template.
    const { data: templateData, error: templateError } =
      await supabase
        .from("email_templates")
        .select(`
          id,
          clinic_id,
          code,
          name,
          subject,
          body,
          is_active
        `)
        .eq("id", templateId)
        .single();

    if (templateError || !templateData) {
      throw new Error("Email template not found.");
    }

    const template = templateData as EmailTemplate;

    if (!template.is_active) {
      throw new Error("Email template is inactive.");
    }

    if (
      template.clinic_id !== null &&
      template.clinic_id !== clinicId
    ) {
      throw new Error("Email template does not belong to this clinic.");
    }

    // Resolve variables using supplied record IDs.
    const resolvedVariables = await resolveEmailVariables({
      ...resolverIds,
      ...(clinicId ? { id_clinic: clinicId } : {}),
    }, template.body);

    // Explicit variables override automatically resolved variables.
    const finalVariables = {
      ...resolvedVariables,
      ...variables,
    };

    // Render email.
    const rendered = renderEmailTemplate(
      template,
      finalVariables
    );

    // Queue email.
    const { data: emailRecord, error: insertError } =
      await supabase
        .from("emails")
        .insert({
          clinic_id: clinicId,
          recipient_email: to,
          recipient_name: recipientName,
          subject: rendered.subject,
          body_html: rendered.bodyHtml,
          body_text: rendered.bodyText,
          email_type: template.code,
          status: "queued",
          provider: "gmail",
          attempts: 0,
          max_attempts: 5,
          next_attempt_at: new Date().toISOString(),
          metadata: {
            ...metadata,
            email_template_id: template.id,
          },
        })
        .select("id")
        .single();

    if (insertError || !emailRecord) {
      throw new Error(
        `Unable to queue email: ${insertError?.message}`
      );
    }

    // Process the email queue in the background. This is a best-effort attempt to send emails immediately after they are queued, but it does not block the response to the caller.
    let status = "queued";
    try {
      await processEmailQueue();
      status = "sent";
    } catch (error) {
      // Do not fail the original operation just because
      // email processing encountered an unexpected error.
      console.error("Email queue processing error:", error);
    }

    return {
      success: true,
      emailId: emailRecord.id,
      status: status,
    };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unexpected email error.";

    console.error("sendEmail error:", message);

    return {
      success: false,
      error: message,
    };
  }
}
