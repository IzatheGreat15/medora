
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
  clinicEmail: string;
  clinicPhone: string;
  clinicWebsiteUrl: string;
  clinicContactUrl: string;

  logoFile: File | null;
  removeLogo: boolean;

  emailHeaderImageFile: File | null;
  removeEmailHeaderImage: boolean;

  notifications: ClinicNotificationPreference;
  reminderDays: number;
};

export type ClinicEmailTemplate = {
  id: string;
  clinic_id: string | null;
  code: string;
  name: string;
  description: string | null;
  is_active: boolean;
  is_customized: boolean;
};

export type ClinicEmailTemplateDetails = {
  id: string;
  clinic_id: string | null;
  code: string;
  name: string;
  description: string | null;
  subject: string;
  body: string;
  is_active: boolean;
};

export type ClinicEmailBranding = {
  name: string;
  logo_url: string | null;
  website_url: string | null;
  contact_url: string | null;
  email_header_image_url: string | null;
};

export type ClinicEmailTemplateEditorData = {
  template: ClinicEmailTemplateDetails;
  clinic: ClinicEmailBranding;
};

// --------------------------------------------------
// AUTHORIZATION
// --------------------------------------------------

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

// --------------------------------------------------
// CLINIC SETTINGS
// --------------------------------------------------

export async function getClinicSettings() {
  const { admin, clinicId } = await getAuthorizedClinic();

  const { data: clinic, error: clinicError } = await admin
    .from("clinics")
    .select(`
      name,
      contact_email,
      phone,
      logo_url,
      website_url,
      contact_url,
      email_header_image_url
    `)
    .eq("id", clinicId)
    .single();

  if (clinicError) {
    throw new Error(clinicError.message);
  }

  const { data: settings, error: settingsError } = await admin
    .from("clinic_settings")
    .select("notification_preferences, reminder_days")
    .eq("clinic_id", clinicId)
    .maybeSingle();

  if (settingsError) {
    throw new Error(settingsError.message);
  }

  return {
    clinicName: clinic.name ?? "",
    clinicEmail: clinic.contact_email ?? "",
    clinicPhone: clinic.phone ?? "",
    logo: clinic.logo_url ?? "",
    clinicWebsiteUrl: clinic.website_url ?? "",
    clinicContactUrl: clinic.contact_url ?? "",
    emailHeaderImage: clinic.email_header_image_url ?? "",
    notifications: (settings?.notification_preferences ??
      {}) as ClinicNotificationPreference,
    reminderDays: settings?.reminder_days ?? 1,
  };
}

export async function saveClinicSettings(input: ClinicSettingsInput) {
  const { admin, clinicId } = await getAuthorizedClinic();

  const clinicName = input.clinicName.trim();

  if (!clinicName) {
    throw new Error("Clinic name is required.");
  }

  if (clinicName.length > 120) {
    throw new Error("Clinic name must be 120 characters or fewer.");
  }

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

  // Get current clinic image URLs.
  const { data: currentClinic, error: currentClinicError } = await admin
    .from("clinics")
    .select("logo_url, email_header_image_url")
    .eq("id", clinicId)
    .single();

  if (currentClinicError) {
    throw new Error(currentClinicError.message);
  }

  let logoUrl: string | null = currentClinic.logo_url ?? null;
  let emailHeaderImageUrl: string | null =
    currentClinic.email_header_image_url ?? null;

  // Upload clinic logo.
  if (input.logoFile) {
    const extension = ALLOWED_TYPES[input.logoFile.type];

    if (!extension) {
      throw new Error("Logo must be a PNG, JPG, or WebP image.");
    }

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

    if (uploadError) {
      throw new Error(`Logo upload failed: ${uploadError.message}`);
    }

    const { data: publicUrl } = admin.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    logoUrl = publicUrl.publicUrl;
  } else if (input.removeLogo) {
    logoUrl = null;
  }

  // Upload email header image.
  if (input.emailHeaderImageFile) {
    const extension = ALLOWED_TYPES[input.emailHeaderImageFile.type];

    if (!extension) {
      throw new Error(
        "Email header image must be a PNG, JPG, or WebP image."
      );
    }

    if (input.emailHeaderImageFile.size > MAX_LOGO_SIZE) {
      throw new Error("The email header image must be 2 MB or smaller.");
    }

    const filePath = `${clinicId}/email-headers/${crypto.randomUUID()}.${extension}`;
    const bytes = new Uint8Array(
      await input.emailHeaderImageFile.arrayBuffer()
    );

    const { error: uploadError } = await admin.storage
      .from(BUCKET_NAME)
      .upload(filePath, bytes, {
        contentType: input.emailHeaderImageFile.type,
        upsert: false,
        cacheControl: "3600",
      });

    if (uploadError) {
      throw new Error(
        `Email header image upload failed: ${uploadError.message}`
      );
    }

    const { data: publicUrl } = admin.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    emailHeaderImageUrl = publicUrl.publicUrl;
  } else if (input.removeEmailHeaderImage) {
    emailHeaderImageUrl = null;
  }

  // Update clinic information.
  const { error: clinicUpdateError } = await admin
    .from("clinics")
    .update({
      name: clinicName,
      contact_email: input.clinicEmail.trim() || null,
      phone: input.clinicPhone.trim() || null,
      website_url: input.clinicWebsiteUrl.trim() || null,
      contact_url: input.clinicContactUrl.trim() || null,
      logo_url: logoUrl,
      email_header_image_url: emailHeaderImageUrl,
    })
    .eq("id", clinicId);

  if (clinicUpdateError) {
    throw new Error(clinicUpdateError.message);
  }

  // Save notification preferences.
  const { error: settingsUpsertError } = await admin
    .from("clinic_settings")
    .upsert(
      {
        clinic_id: clinicId,
        notification_preferences: notifications,
        reminder_days: input.reminderDays,
      },
      { onConflict: "clinic_id" }
    );

  if (settingsUpsertError) {
    throw new Error(settingsUpsertError.message);
  }

  return {
    logo: logoUrl,
    emailHeaderImage: emailHeaderImageUrl,
  };
}
// --------------------------------------------------
// EMAIL TEMPLATE LIST
// --------------------------------------------------

export async function getClinicEmailTemplates(): Promise<
  ClinicEmailTemplate[]
> {
  const { admin, clinicId } = await getAuthorizedClinic();

  const { data, error } = await admin
    .from("email_templates")
    .select("id, clinic_id, code, name, description, is_active")
    .or(`clinic_id.is.null,clinic_id.eq.${clinicId}`)
    .order("name");

  if (error) {
    throw new Error(error.message);
  }

  const globalTemplates = (data ?? []).filter(
    (template) => template.clinic_id === null
  );

  const clinicTemplates = (data ?? []).filter(
    (template) => template.clinic_id === clinicId
  );

  const clinicTemplateMap = new Map(
    clinicTemplates.map((template) => [template.code, template])
  );

  return globalTemplates.map((globalTemplate) => {
    const clinicTemplate = clinicTemplateMap.get(globalTemplate.code);
    const effectiveTemplate = clinicTemplate ?? globalTemplate;

    return {
      id: effectiveTemplate.id,
      clinic_id: effectiveTemplate.clinic_id,
      code: globalTemplate.code,
      name: globalTemplate.name,
      description: globalTemplate.description,
      is_active: effectiveTemplate.is_active,
      is_customized: Boolean(clinicTemplate),
    };
  });
}

// --------------------------------------------------
// RESET EMAIL TEMPLATE
// --------------------------------------------------

export async function resetClinicEmailTemplate(code: string) {
  const { admin, clinicId } = await getAuthorizedClinic();

  if (!code || code.length > 100) {
    throw new Error("Invalid email template.");
  }

  // Verify that the global template exists.
  const { data: defaultTemplate, error: defaultError } = await admin
    .from("email_templates")
    .select("id")
    .eq("code", code)
    .is("clinic_id", null)
    .maybeSingle();

  if (defaultError) {
    throw new Error(defaultError.message);
  }

  if (!defaultTemplate) {
    throw new Error("Default email template not found.");
  }

  // Delete only this clinic's customized version.
  const { error: deleteError } = await admin
    .from("email_templates")
    .delete()
    .eq("clinic_id", clinicId)
    .eq("code", code);

  if (deleteError) {
    throw new Error(deleteError.message);
  }

  return { success: true };
}

// --------------------------------------------------
// GET EMAIL TEMPLATE + CLINIC BRANDING
// --------------------------------------------------

export async function getClinicEmailTemplateByCode(
  code: string
): Promise<ClinicEmailTemplateEditorData | null> {
  if (!code || code.length > 100) {
    throw new Error("Invalid email template code.");
  }

  const { admin, clinicId } = await getAuthorizedClinic();

  // 1. Fetch clinic information and branding.
  const { data: clinic, error: clinicError } = await admin
    .from("clinics")
    .select(`
      name,
      logo_url,
      website_url,
      contact_url,
      email_header_image_url
    `)
    .eq("id", clinicId)
    .single();

  if (clinicError) {
    throw new Error(clinicError.message);
  }

  // 2. Check for a clinic-specific template first.
  const { data: customizedTemplate, error: customizedError } = await admin
    .from("email_templates")
    .select(`
      id,
      clinic_id,
      code,
      name,
      description,
      subject,
      body,
      is_active
    `)
    .eq("clinic_id", clinicId)
    .eq("code", code)
    .maybeSingle();

  if (customizedError) {
    throw new Error(customizedError.message);
  }

  // 3. Fall back to the global template if no customization exists.
  let effectiveTemplate = customizedTemplate;

  if (!effectiveTemplate) {
    const { data: globalTemplate, error: globalError } = await admin
      .from("email_templates")
      .select(`
        id,
        clinic_id,
        code,
        name,
        description,
        subject,
        body,
        is_active
      `)
      .is("clinic_id", null)
      .eq("code", code)
      .maybeSingle();

    if (globalError) {
      throw new Error(globalError.message);
    }

    effectiveTemplate = globalTemplate;
  }

  // 4. Return null if the template does not exist.
  if (!effectiveTemplate) {
    return null;
  }

  // 5. Return the template and its clinic branding.
  return {
    template: effectiveTemplate,
    clinic: {
      name: clinic.name ?? "",
      logo_url: clinic.logo_url ?? null,
      website_url: clinic.website_url ?? null,
      contact_url: clinic.contact_url ?? null,
      email_header_image_url: clinic.email_header_image_url ?? null,
    },
  };
}

export async function saveClinicEmailTemplate(input: {
  code: string;
  subject: string;
  body: string;
}): Promise<ClinicEmailTemplateDetails> {
  const { admin, clinicId } = await getAuthorizedClinic();

  const { staff } = await getCurrentStaff();

  if (!staff) {
    throw new Error("You are not authorized to manage email templates.");
  }

  const code = input.code?.trim();
  const subject = input.subject?.trim();
  const body = input.body;

  if (!code || !subject || !body?.trim()) {
    throw new Error("Email template code, subject, and body are required.");
  }

  // 1. Retrieve the global template
  const { data: globalTemplate, error: globalError } = await admin
    .from("email_templates")
    .select("code, name, description, is_active")
    .is("clinic_id", null)
    .eq("code", code)
    .single();

  if (globalError || !globalTemplate) {
    throw new Error("Global email template not found.");
  }

  // 2. Check whether a clinic-specific template already exists
  const { data: existingTemplate, error: existingError } = await admin
    .from("email_templates")
    .select("id")
    .eq("clinic_id", clinicId)
    .eq("code", code)
    .maybeSingle();

  if (existingError) {
    throw new Error(existingError.message);
  }

  // 3. Update existing clinic template
  if (existingTemplate) {
    const { data, error } = await admin
      .from("email_templates")
      .update({
        subject,
        body,
        updated_by: staff.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existingTemplate.id)
      .eq("clinic_id", clinicId)
      .select("*")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data as ClinicEmailTemplateDetails;
  }

  // 4. Otherwise, create a clinic-specific copy of the global template
  const { data, error } = await admin
    .from("email_templates")
    .insert({
      clinic_id: clinicId,
      code: globalTemplate.code,
      name: globalTemplate.name,
      description: globalTemplate.description,
      subject,
      body,
      is_active: globalTemplate.is_active,
      created_by: staff.id,
      updated_by: staff.id,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as ClinicEmailTemplateDetails;
}
