
"use client";

import { useState } from "react";

type Tag = {
  label: string;
  value: string;
};

type TagGroup = {
  name: string;
  tags: Tag[];
};

type Props = {
  onInsert: (tag: string) => void;
};

const tagGroups: TagGroup[] = [
  {
    name: "Patient",
    tags: [{ label: "Patient Name", value: "{{patient_name}}" }],
  },
  {
    name: "Clinic",
    tags: [
      { label: "Clinic Name", value: "{{clinic_name}}" },
      { label: "Clinic Logo URL", value: "{{clinic_logo_url}}" },
      { label: "Clinic Header Image", value: "{{clinic_header_image_url}}" },
      { label: "Clinic Contact URL", value: "{{clinic_contact_url}}" },
    ],
  },
  {
    name: "Appointment",
    tags: [
      { label: "Appointment Date", value: "{{appointment_date}}" },
      { label: "Appointment Time", value: "{{appointment_time}}" },
      { label: "Doctor Name", value: "{{doctor_name}}" },
      { label: "Service Name", value: "{{service_name}}" },
    ],
  },
  {
    name: "Branch",
    tags: [
      { label: "Branch Name", value: "{{branch_name}}" },
      { label: "Branch Address", value: "{{branch_address}}" },
    ],
  },
  {
    name: "Confirmation",
    tags: [
      { label: "Accept URL", value: "{{accept_url}}" },
      { label: "Decline URL", value: "{{decline_url}}" },
      { label: "Confirmation Deadline", value: "{{confirmation_deadline}}" },
    ],
  },
];

export default function EmailTemplateTags({ onInsert }: Props) {
  const [copiedTag, setCopiedTag] = useState<string | null>(null);

  const handleCopy = async (tag: string) => {
    try {
      await navigator.clipboard.writeText(tag);
      setCopiedTag(tag);

      window.setTimeout(() => {
        setCopiedTag((current) => current === tag ? null : current);
      }, 2000);
    } catch {
      setCopiedTag(null);
    }
  };

  return (
    <div className="max-h-[calc(100vh-180px)] overflow-y-auto rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-5">
        <h2 className="text-base font-semibold text-gray-900">
          Available Tags
        </h2>
        <p className="mt-1 text-xs text-gray-500">
          Copy or insert variables into your email.
        </p>
      </div>

      <div className="space-y-5">
        {tagGroups.map((group) => (
          <div key={group.name}>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
              {group.name}
            </h3>

            <div className="divide-y divide-gray-100">
              {group.tags.map((tag) => (
                <div key={tag.value} className="py-2.5 first:pt-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-gray-800">
                      {tag.label}
                    </p>

                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleCopy(tag.value)}
                        title="Copy variable"
                        aria-label={`Copy ${tag.label}`}
                        className="rounded-md p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                      >
                        {copiedTag === tag.value ? (
                          <svg
                            className="h-4 w-4 text-green-600"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="m5 12 4 4L19 6" />
                          </svg>
                        ) : (
                          <svg
                            className="h-4 w-4"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                          >
                            <rect x="8" y="8" width="13" height="13" rx="2" />
                            <path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3" />
                          </svg>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => onInsert(tag.value)}
                        title="Insert into email"
                        aria-label={`Insert ${tag.label}`}
                        className="rounded-md p-1.5 text-[#6B8F71] transition hover:bg-green-50 hover:text-[#58785E]"
                      >
                        <svg
                          className="h-4 w-4"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M12 5v14M5 12h14" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <code className="mt-1 block break-all text-xs text-gray-400">
                    {tag.value}
                  </code>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
