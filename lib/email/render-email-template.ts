
import "server-only";

import type {
  EmailTemplate,
  EmailVariables,
  RenderedEmail,
} from "./types";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function escapeAttribute(value: string): string {
  return escapeHtml(value);
}

function replaceVariables(
  content: string,
  variables: EmailVariables
): string {
  return content.replace(
    /{{\s*([a-zA-Z0-9_]+)\s*}}/g,
    (match, key: string) => {
      if (!(key in variables)) {
        return match;
      }

      const value = variables[key];

      return value === null || value === undefined
        ? ""
        : escapeHtml(String(value));
    }
  );
}

function validateImageUrl(value: string): string {
  try {
    const url = new URL(value);

    if (!["https:", "http:"].includes(url.protocol)) {
      return "";
    }

    return escapeAttribute(url.toString());
  } catch {
    return "";
  }
}

export function renderEmailTemplate(
  template: EmailTemplate,
  variables: EmailVariables = {}
): RenderedEmail {
  const replaceHtmlVariables = (content: string): string => {
    return content.replace(
      /{{\s*([a-zA-Z0-9_]+)\s*}}/g,
      (match, key: string) => {
        if (!(key in variables)) {
          return match;
        }

        const value = variables[key];

        if (value === null || value === undefined) {
          return "";
        }

        // Validate URLs used in image src attributes.
        const isImageSource = new RegExp(
          `src\\s*=\\s*["']{{\\s*${key}\\s*}}["']`,
          "i"
        ).test(content);

        if (isImageSource) {
          return validateImageUrl(String(value));
        }

        return escapeHtml(String(value));
      }
    );
  };

  const subject = replaceVariables(template.subject, variables);
  const bodyHtml = replaceHtmlVariables(template.body);

  const unresolvedVariables = [
    ...new Set(
      [
        ...subject.matchAll(/{{\s*([a-zA-Z0-9_]+)\s*}}/g),
      ]
        .map((match) => match[1])
        .concat(
          [
            ...bodyHtml.matchAll(/{{\s*([a-zA-Z0-9_]+)\s*}}/g),
          ].map((match) => match[1])
        )
    ),
  ];

  if (unresolvedVariables.length > 0) {
    throw new Error(
      `Unresolved email variables: ${unresolvedVariables.join(", ")}`
    );
  }

  const bodyText = bodyHtml
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<\/(p|div|tr|h[1-6]|li)>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .trim();

  return {
    subject,
    bodyHtml,
    bodyText,
  };
}
