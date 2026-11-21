"use client";

import { useRef } from "react";
import { Editor } from "@tinymce/tinymce-react";
import type { Editor as TinyMCEEditor } from "tinymce";

type Props = {
  subject: string;
  body: string;
  onSubjectChange: (value: string) => void;
  onBodyChange: (value: string) => void;
  onEditorReady?: (editor: TinyMCEEditor) => void;
};

export default function EmailTemplateEditForm({
  subject,
  body,
  onSubjectChange,
  onBodyChange,
  onEditorReady,
}: Props) {
  const editorRef = useRef<TinyMCEEditor | null>(null);

  return (
    <div className="rounded-xl border border-gray-200 bg-white space-y-4 p-5 shadow-sm">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Email Subject
        </label>

        <input
          type="text"
          value={subject}
          onChange={(e) => onSubjectChange(e.target.value)}
          placeholder="Enter email subject..."
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-[#6B8F71] focus:ring-2 focus:ring-[#6B8F71]/20"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Email Body
        </label>

        <Editor
          tinymceScriptSrc="/tinymce/tinymce.min.js"
          licenseKey="gpl"
          value={body}
          onInit={(_, editor) => {
            editorRef.current = editor;
            onEditorReady?.(editor);
          }}
          onEditorChange={(content) => onBodyChange(content)}
          init={{
            height: 550,
            menubar: false,
            branding: false,
            promotion: false,
            toolbar_mode: "wrap",
            plugins: [
              "advlist",
              "autolink",
              "lists",
              "link",
              "image",
              "charmap",
              "preview",
              "anchor",
              "searchreplace",
              "visualblocks",
              "code",
              "fullscreen",
              "insertdatetime",
              "table",
              "help",
              "wordcount",
            ],
            toolbar:
              "undo redo | blocks | bold italic underline | " +
              "forecolor backcolor | alignleft aligncenter " +
              "alignright | bullist numlist | link image table | " +
              "removeformat | code",
            content_style: `
              body {
                font-family: Arial, Helvetica, sans-serif;
                font-size: 14px;
                color: #374151;
                padding: 12px;
              }
            `,
            skin: "oxide",
            content_css: "default",
            relative_urls: false,
            convert_urls: false,
          }}
        />
      </div>
    </div>
  );
}
