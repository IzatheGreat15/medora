import { google } from "googleapis";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");

  if (!code) {
    return NextResponse.json(
      { error: "Authorization code missing" },
      { status: 400 }
    );
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  const { tokens } = await oauth2Client.getToken(code);

  if (!tokens.refresh_token) {
    return NextResponse.json(
      { error: "Refresh token was not returned. Reauthorize with consent." },
      { status: 400 }
    );
  }

  return NextResponse.json({
    success: true,
    message: "Google account connected. Check your server terminal.",
  });
}