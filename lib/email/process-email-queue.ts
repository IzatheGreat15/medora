
import "server-only";

import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { sendGmail } from "./providers/gmail";

import type { ProcessEmailResult } from "./types";

const BATCH_SIZE = 10;

function getRetryDelay(attempt: number): number {
  // 1 minute, 2 minutes, 4 minutes, 8 minutes...
  return Math.min(60 * 2 ** (attempt - 1), 60 * 60);
}

async function processOneEmail(
  email: {
    id: string;
    recipient_email: string;
    subject: string;
    body_html: string;
    body_text: string | null;
    attempts: number;
    max_attempts: number;
  }
): Promise<"sent" | "failed" | "skipped"> {
  const supabase = createSupabaseAdmin();

  const nextAttempt = email.attempts + 1;

  // Claim the email before processing.
  const { data: claimedEmail, error: claimError } = await supabase
    .from("emails")
    .update({
      status: "processing",
      attempts: nextAttempt,
      processing_started_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", email.id)
    .eq("status", "queued")
    .select("id")
    .maybeSingle();

  if (claimError) {
    console.error("Unable to claim email:", claimError);
    return "skipped";
  }

  // Another worker may already have claimed it.
  if (!claimedEmail) {
    return "skipped";
  }

  try {
    // Send email using Gmail API.
    const result = await sendGmail({
      to: email.recipient_email,
      subject: email.subject,
      html: email.body_html,
    });

    const { error: updateError } = await supabase
      .from("emails")
      .update({
        status: "sent",
        provider: "gmail",
        provider_message_id: result.messageId,
        sent_at: new Date().toISOString(),
        error_message: null,
        next_attempt_at: null,
        processing_started_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", email.id)
      .eq("status", "processing");

    if (updateError) {
      // Gmail may already have accepted the email.
      // Do not automatically send it again.
      console.error("Unable to mark email as sent:", updateError);
    }

    return "sent";
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unexpected email delivery error.";

    const exhausted = nextAttempt >= email.max_attempts;

    const nextAttemptAt = exhausted
      ? null
      : new Date(
          Date.now() + getRetryDelay(nextAttempt) * 1000
        ).toISOString();

    const { error: updateError } = await supabase
      .from("emails")
      .update({
        status: exhausted ? "failed" : "queued",
        error_message: message,
        next_attempt_at: nextAttemptAt,
        processing_started_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", email.id)
      .eq("status", "processing");

    if (updateError) {
      console.error("Unable to update failed email:", updateError);
    }

    console.error(
      `Email ${email.id} failed on attempt ${nextAttempt}/${email.max_attempts}:`,
      message
    );

    return "failed";
  }
}

export async function processEmailQueue(): Promise<ProcessEmailResult> {
  const supabase = createSupabaseAdmin();

  const result: ProcessEmailResult = {
    processed: 0,
    sent: 0,
    failed: 0,
    skipped: 0,
  };

  const now = new Date().toISOString();

  const { data: emails, error } = await supabase
    .from("emails")
    .select(`
      id,
      recipient_email,
      subject,
      body_html,
      body_text,
      attempts,
      max_attempts
    `)
    .eq("status", "queued")
    .lte("next_attempt_at", now)
    .order("created_at", { ascending: true })
    .limit(BATCH_SIZE);

  if (error) {
    throw new Error(
      `Unable to retrieve email queue: ${error.message}`
    );
  }

  if (!emails?.length) {
    return result;
  }

  for (const email of emails) {
    result.processed++;

    const status = await processOneEmail(email);

    if (status === "sent") {
      result.sent++;
    } else if (status === "failed") {
      result.failed++;
    } else {
      result.skipped++;
    }
  }

  return result;
}
