import { sendEmail } from "@/lib/email";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // const result = await sendEmail({
    //   templateId: "daee9386-8bef-4e3e-905b-45fd87a521f4",
    //   clinicId: "37bd1f04-ba30-49d0-be2e-12b99343c0fe",
    //   to: "monzalesiza@gmail.com",
    //   recipientName: "John Doe",

    //   resolverIds: {
    //     id_booking: "053d3998-bef8-4779-bc2d-1c50a2352a63",
    //   },
    // });

    return NextResponse.json({
      success: true,
      message: "Email sent successfully!",
    });
  } catch (error) {
    console.error("Gmail API error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to send email.",
      },
      { status: 500 }
    );
  }
}