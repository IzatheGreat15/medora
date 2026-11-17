
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import type { Editor as TinyMCEEditor } from "tinymce";

import EmailTemplateEditForm from "@/components/settings/email-templates/EmailTemplateEditForm";
import EmailTemplatePreview from "@/components/settings/email-templates/EmailTemplatePreview";
import EmailTemplateTags from "@/components/settings/email-templates/EmailTemplateTags";

import {
  getClinicEmailTemplateByCode,
  saveClinicEmailTemplate,
  type ClinicEmailBranding,
  type ClinicEmailTemplateDetails,
} from "@/components/settings/settings-data-actions";
import Toast, { ToastType } from "@/components/shared/Toast";

export default function EmailTemplatePage() {
  const params = useParams<{ code: string }>();
  const router = useRouter();

  const code = params.code;

  const [template, setTemplate] =
    useState<ClinicEmailTemplateDetails | null>(null);

  const [clinic, setClinic] =
    useState<ClinicEmailBranding | null>(null);

  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const [toast, setToast] = useState<{
    message: string;
    type: ToastType;
  } | null>(null);

  const editorRef = useRef<TinyMCEEditor | null>(null);

  // --------------------------------------------------
  // LOAD EMAIL TEMPLATE + CLINIC BRANDING
  // --------------------------------------------------

  useEffect(() => {
    let isMounted = true;

    async function loadTemplate() {
      try {
        setLoading(true);
        setError(null);

        const result = await getClinicEmailTemplateByCode(code);

        if (!result) {
          throw new Error("Email template not found.");
        }

        if (!isMounted) return;

        setTemplate(result.template);
        setClinic(result.clinic);

        setSubject(result.template.subject);
        setBody(result.template.body);
      } catch (err) {
        if (!isMounted) return;

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load email template."
        );
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    if (code) {
      loadTemplate();
    }

    return () => {
      isMounted = false;
    };
  }, [code]);

  // --------------------------------------------------
  // INSERT TEMPLATE VARIABLE INTO TINYMCE
  // --------------------------------------------------

  const handleInsertTag = useCallback((tag: string) => {
    const editor = editorRef.current;

    if (!editor) return;

    editor.focus();
    editor.insertContent(tag);
  }, []);

  // --------------------------------------------------
  // SAVE EMAIL TEMPLATE
  // --------------------------------------------------

  const handleSave = async () => {
    if (!template || saving) return;

    try {
      setSaving(true);
      setToast(null);

      const savedTemplate = await saveClinicEmailTemplate({
        code: template.code,
        subject,
        body,
      });

      setTemplate(savedTemplate);
      setSubject(savedTemplate.subject);
      setBody(savedTemplate.body);

      setToast({
        message: "Email template saved successfully.",
        type: "success",
      });
    } catch (err) {
      setToast({
        message:
          err instanceof Error
            ? err.message
            : "Failed to save email template.",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  // --------------------------------------------------
  // LOADING STATE
  // --------------------------------------------------

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-sm text-gray-500">
          Loading email template...
        </p>
      </div>
    );
  }

  // --------------------------------------------------
  // ERROR STATE
  // --------------------------------------------------

  if (error && (!template || !clinic)) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <h2 className="font-semibold text-red-700">
          Unable to load email template
        </h2>

        <p className="mt-2 text-sm text-red-600">
          {error}
        </p>

        <button
          type="button"
          onClick={() => router.back()}
          className="mt-4 text-sm font-medium text-red-700 hover:underline"
        >
          Go back
        </button>
      </div>
    );
  }

  if (!template || !clinic) return null;

  // --------------------------------------------------
  // PAGE
  // --------------------------------------------------

  return (
    <div className="space-y-6">

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Page Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="flex items-center gap-3 text-2xl font-semibold text-gray-900">
            {template.name}

            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                template.is_active
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {template.is_active ? "Active" : "Inactive"}
            </span>
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            {template.description || template.code}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#176B55] px-5 text-sm font-semibold text-white transition hover:bg-[#125642] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? (
              <>
                <svg
                  className="h-4 w-4 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  />
                </svg>
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </div>

      {/* Three-column editor */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.15fr_1.4fr_0.75fr]">

        {/* 1. Email Template Form */}
        <EmailTemplateEditForm
          subject={subject}
          body={body}
          onSubjectChange={setSubject}
          onBodyChange={setBody}
          onEditorReady={(editor) => {
            editorRef.current = editor;
          }}
        />

        {/* 2. Live Email Preview */}
        <EmailTemplatePreview
          subject={subject}
          body={body}
          clinic={clinic}
        />

        {/* 3. Available Template Variables */}
        <EmailTemplateTags
          onInsert={handleInsertTag}
        />

      </div>
    </div>
  );
}
