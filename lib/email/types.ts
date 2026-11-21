export type EmailTemplate = {
  id: string;
  clinic_id: string | null;
  code: string;
  name: string;
  subject: string;
  body: string;
  is_active: boolean;
};

export type EmailVariables = Record<
  string,
  string | number | boolean | null | undefined
>;

export type EmailResolverIds = {
  id_booking?: string;
  id_clinic?: string;
  id_doctor?: string;
  id_branch?: string;
  id_service?: string;
  id_staff?: string;
};

export type RenderedEmail = {
  subject: string;
  bodyHtml: string;
  bodyText: string;
};

export type SendEmailOptions = {
  templateId: string;
  clinicId: string | null;
  to: string;
  recipientName?: string | null;
  resolverIds?: EmailResolverIds;
  variables?: EmailVariables;
  metadata?: Record<string, unknown>;
};

export type SendEmailResult = {
  success: boolean;
  emailId?: string;
  status?: string;
  error?: string;
};

export type ProcessEmailResult = {
  processed: number;
  sent: number;
  failed: number;
  skipped: number;
};

