
"use client";

import type { ClinicEmailBranding } from "@/components/settings/settings-data-actions";

type Props = {
  subject: string;
  body: string;
  clinic: ClinicEmailBranding;
};

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return entities[character];
  });
}

function isSafeUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function renderSampleValues(
  content: string,
  values: Record<string, string>
) {
  return content.replace(
    /\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g,
    (match, key: string) => {
      if (!Object.prototype.hasOwnProperty.call(values, key)) {
        return match;
      }

      return escapeHtml(values[key]);
    }
  );
}

export default function EmailTemplatePreview({
  subject,
  body,
  clinic,
}: Props) {
  const contactUrl =
    clinic.contact_url || clinic.website_url || "";

  const sampleValues: Record<string, string> = {
    // Patient
    patient_name: "Sarah Johnson",

    // Actual clinic information
    clinic_name: clinic.name || "Your Clinic",
    clinic_logo_url:
      clinic.logo_url && isSafeUrl(clinic.logo_url)
        ? clinic.logo_url
        : "",
    clinic_header_image_url:
      clinic.email_header_image_url &&
      isSafeUrl(clinic.email_header_image_url)
        ? clinic.email_header_image_url
        : "",
    clinic_contact_url:
      contactUrl && isSafeUrl(contactUrl)
        ? contactUrl
        : "#",

    // Sample appointment information
    appointment_date: "November 20, 2026",
    appointment_time: "10:00 AM",
    doctor_name: "Dr. Maria Santos",
    service_name: "Dental Cleaning",
    branch_name: "Cebu City Branch",
    branch_address: "Cebu City, Philippines",

    // Sample confirmation information
    accept_url: "https://example.com/accept",
    decline_url: "https://example.com/decline",
    confirmation_deadline: "November 19, 2026",
  };

  const previewSubject = renderSampleValues(
    subject,
    sampleValues
  );

  const previewBody = renderSampleValues(
    body,
    sampleValues
  );

  // Keep the preview isolated from the parent application.
  // This is a preview only, not the production email renderer.
  const previewDocument = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0"
        />

        <style>
          * {
            box-sizing: border-box;
          }

          html,
          body {
            margin: 0;
            padding: 0;
          }

          body {
            padding: 16px;
            background: #f3f4f6;
            font-family: Arial, Helvetica, sans-serif;
          }

          img {
            max-width: 100%;
            height: auto;
          }

          a {
            cursor: pointer;
          }
        </style>
      </head>

      <body>
        ${previewBody}
      </body>
    </html>
  `;

  return (
    <div className="rounded-xl border border-gray-200 bg-white space-y-4 shadow-sm">
      {/* Preview Card */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">

        {/* Subject */}
        <div className="border-b border-gray-200 bg-gray-50 p-3">
          <p className="mb-1 text-xs font-medium text-gray-500">
            EMAIL SUBJECT
          </p>

          <p className="break-words text-sm font-medium text-gray-800">
            {previewSubject}
          </p>
        </div>

        {/* Email Body */}
        <iframe
          title="Email template preview"
          srcDoc={previewDocument}
          sandbox=""
          referrerPolicy="no-referrer"
          className="w-full bg-white"
          style={{ height: "650px" }}
        />
      </div>
    </div>
  );
}
