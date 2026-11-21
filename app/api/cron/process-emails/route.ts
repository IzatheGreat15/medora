
import { NextRequest, NextResponse } from "next/server";

import { processEmailQueue } from "@/lib/email";

export const maxDuration = 60;

export async function GET(request: NextRequest) {
  const authorization = request.headers.get("authorization");

  if (
    !process.env.CRON_SECRET ||
    authorization !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const result = await processEmailQueue();

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("Email cron error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to process email queue.",
      },
      { status: 500 }
    );
  }
}
