
import { google } from "googleapis";

type SendGmailOptions = {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
};

function encodeBase64Url(value: string): string {
  return Buffer.from(value)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export async function sendGmail({
  to,
  subject,
  html,
  replyTo,
}: SendGmailOptions) {
  const {
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI,
    GMAIL_REFRESH_TOKEN,
    GMAIL_SENDER_EMAIL,
  } = process.env;

  if (
    !GOOGLE_CLIENT_ID ||
    !GOOGLE_CLIENT_SECRET ||
    !GOOGLE_REDIRECT_URI ||
    !GMAIL_REFRESH_TOKEN ||
    !GMAIL_SENDER_EMAIL
  ) {
    throw new Error("Missing Gmail API environment variables.");
  }

  const oauth2Client = new google.auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI
  );

  oauth2Client.setCredentials({
    refresh_token: GMAIL_REFRESH_TOKEN,
  });

  const gmail = google.gmail({
    version: "v1",
    auth: oauth2Client,
  });

  const headers = [
    `From: Medora <${GMAIL_SENDER_EMAIL}>`,
    `To: ${to}`,
    `Subject: ${subject}`,
    "MIME-Version: 1.0",
    "Content-Type: text/html; charset=UTF-8",
  ];

  if (replyTo) {
    headers.push(`Reply-To: ${replyTo}`);
  }

  const message = [
    ...headers,
    "",
    html,
  ].join("\r\n");

  const raw = encodeBase64Url(message);

  const { data } = await gmail.users.messages.send({
    userId: "me",
    requestBody: {
      raw,
    },
  });

  return {
    success: true,
    messageId: data.id,
  };
}
