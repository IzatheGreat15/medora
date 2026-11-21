
export { sendEmail } from "./send-email";
export { renderEmailTemplate } from "./render-email-template";
export { resolveEmailVariables } from "./resolve-email-variables";
export { processEmailQueue } from "./process-email-queue";

export type {
  EmailTemplate,
  EmailVariables,
  EmailResolverIds,
  RenderedEmail,
  SendEmailOptions,
  SendEmailResult,
  ProcessEmailResult,
} from "./types";

// HOW TO SEND EMAIL
// 1. Create an email template in the database (email_templates table).
// 2. Use the sendEmail function to send an email using the template.
// 3. Provide the necessary parameters such as templateId, clinicId, recipient email, and any variables needed for the template.
// await sendEmail({
//   templateId: approvedTemplateId,
//   clinicId,
//   to: patient.email,
//   recipientName: patient.name,

//   resolverIds: {
//     id_booking: bookingId,
//   },
// });