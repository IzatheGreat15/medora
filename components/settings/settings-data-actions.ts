"use server";

import "server-only";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { getCurrentStaff } from "@/lib/auth/get-current-staff";

const BUCKET_NAME = "clinic-logos";
const MAX_LOGO_SIZE = 2 * 1024 * 1024;
const ALLOWED_TYPES: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

export type ClinicNotificationPreference = Record<string, boolean>;

export type ClinicSettingsInput = {
  clinicName: string;
  notifications: ClinicNotificationPreference;
  reminderDays: number;
  logoFile: File | null;
  removeLogo: boolean;
};

async function getAuthorizedClinic() {
  const { staff } = await getCurrentStaff();

  if (!staff || staff.role !== "clinic_user" || !staff.clinic_id) {
    throw new Error("You are not authorized to manage clinic settings.");
  }

  return {
    admin: createSupabaseAdmin(),
    clinicId: staff.clinic_id,
  };
}

export async function getClinicSettings() {
  const { admin, clinicId } = await getAuthorizedClinic();

  const { data: clinic, error: clinicError } = await admin
    .from("clinics")
    .select("name, logo_url")
    .eq("id", clinicId)
    .single();

  if (clinicError) throw new Error(clinicError.message);

  const { data: settings, error: settingsError } = await admin
    .from("clinic_settings")
    .select("notification_preferences, reminder_days")
    .eq("clinic_id", clinicId)
    .maybeSingle();

  if (settingsError) throw new Error(settingsError.message);

  return {
    clinicName: clinic.name ?? "",
    logo: clinic.logo_url ?? "",
    notifications: (settings?.notification_preferences ?? {}) as ClinicNotificationPreference,
    reminderDays: settings?.reminder_days ?? 1,
  };
}

export async function saveClinicSettings(input: ClinicSettingsInput) {
  const { admin, clinicId } = await getAuthorizedClinic();

  const clinicName = input.clinicName.trim();
  if (!clinicName) throw new Error("Clinic name is required.");
  if (clinicName.length > 120) throw new Error("Clinic name must be 120 characters or fewer.");

  const validReminderDays = [1, 2, 3, 7];
  if (!validReminderDays.includes(input.reminderDays)) {
    throw new Error("Invalid appointment reminder timing.");
  }

  const allowedEvents = [
    "booking_received",
    "booking_confirmed",
    "booking_cancelled",
    "booking_rescheduled",
    "appointment_reminder",
  ];
  const notifications: ClinicNotificationPreference = {};
  for (const event of allowedEvents) {
    notifications[event] = Boolean(input.notifications?.[event]);
  }

  const { data: currentClinic, error: currentClinicError } = await admin
    .from("clinics")
    .select("logo_url")
    .eq("id", clinicId)
    .single();

  if (currentClinicError) throw new Error(currentClinicError.message);

  let logoUrl: string | null = currentClinic.logo_url ?? null;

  if (input.logoFile) {
    const extension = ALLOWED_TYPES[input.logoFile.type];
    if (!extension) throw new Error("Logo must be a PNG, JPG, or WebP image.");
    if (input.logoFile.size > MAX_LOGO_SIZE) {
      throw new Error("The logo must be 2 MB or smaller.");
    }

    const filePath = `${clinicId}/${crypto.randomUUID()}.${extension}`;
    const bytes = new Uint8Array(await input.logoFile.arrayBuffer());

    const { error: uploadError } = await admin.storage
      .from(BUCKET_NAME)
      .upload(filePath, bytes, {
        contentType: input.logoFile.type,
        upsert: false,
        cacheControl: "3600",
      });

    if (uploadError) throw new Error(`Logo upload failed: ${uploadError.message}`);

    const { data: publicUrl } = admin.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    logoUrl = publicUrl.publicUrl;
  } else if (input.removeLogo) {
    logoUrl = null;
  }

  const { error: clinicUpdateError } = await admin
    .from("clinics")
    .update({
      name: clinicName,
      logo_url: logoUrl,
    })
    .eq("id", clinicId);

  if (clinicUpdateError) throw new Error(clinicUpdateError.message);

  const { error: settingsUpsertError } = await admin
    .from("clinic_settings")
    .upsert(
      {
        clinic_id: clinicId,
        notification_preferences: notifications,
        reminder_days: input.reminderDays,
      },
      { onConflict: "clinic_id" },
    );

  if (settingsUpsertError) throw new Error(settingsUpsertError.message);

  return { logo: logoUrl };
}
