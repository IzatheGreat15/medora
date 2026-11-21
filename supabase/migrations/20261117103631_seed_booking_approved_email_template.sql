
INSERT INTO public.email_templates (
    clinic_id,
    code,
    name,
    description,
    subject,
    body,
    is_active
)
VALUES (
    NULL,
    'booking_approved',
    'Booking Approved',
    'Sent to patients when their appointment has been approved by the clinic.',
    'Your appointment at {{clinic_name}} has been approved!',
    $email$
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="color-scheme" content="light">
    <meta name="supported-color-schemes" content="light">
    <title>Your appointment is confirmed</title>
</head>

<body style="margin:0; padding:0; background-color:#F3F6F3; font-family:Arial, Helvetica, sans-serif; color:#34483A;">

    <!-- Preheader -->
    <div style="display:none; max-height:0; overflow:hidden; opacity:0; color:transparent;">
        Your appointment at {{clinic_name}} has been approved.
    </div>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
        style="background-color:#F3F6F3; padding:32px 12px;">
        <tr>
            <td align="center">

                <!-- Email container -->
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
                    style="max-width:600px; background-color:#FFFFFF; border-radius:12px; overflow:hidden;">

                    <!-- Clinic branding -->
                    <tr>
                        <td align="center" style="padding:28px 24px 20px;">

                            <img
                                src="{{clinic_logo_url}}"
                                alt="{{clinic_name}}"
                                width="150"
                                style="display:block; max-width:150px; max-height:70px; width:auto; height:auto; border:0; margin:0 auto 8px;"
                            >

                            <p style="margin:0; font-size:13px; line-height:20px; color:#7A897E;">
                                Your smile, our priority
                            </p>

                        </td>
                    </tr>

                    <!-- Header image -->
                    <tr>
                        <td>
                            <img
                                src="{{clinic_header_image_url}}"
                                alt="{{clinic_name}} dental clinic"
                                width="600"
                                style="display:block; width:100%; max-width:600px; height:auto; border:0;"
                            >
                        </td>
                    </tr>

                    <!-- Main content -->
                    <tr>
                        <td style="padding:32px 28px 24px;">

                            <!-- Confirmation badge -->
                            <table role="presentation" cellpadding="0" cellspacing="0" border="0"
                                style="margin-bottom:20px;">
                                <tr>
                                    <td style="background-color:#EAF3EC; border-radius:30px; padding:8px 14px;">
                                        <span style="font-size:12px; line-height:16px; font-weight:bold; color:#39764C;">
                                            &#10003; APPOINTMENT CONFIRMED
                                        </span>
                                    </td>
                                </tr>
                            </table>

                            <h1 style="margin:0 0 16px; font-size:27px; line-height:36px; font-weight:700; color:#263A2D;">
                                Your appointment is confirmed!
                            </h1>

                            <p style="margin:0 0 14px; font-size:15px; line-height:24px; color:#53645A;">
                                Hi {{patient_name}},
                            </p>

                            <p style="margin:0 0 24px; font-size:15px; line-height:24px; color:#53645A;">
                                Great news! Your appointment at <strong>{{clinic_name}}</strong> has been approved.
                                Here are your appointment details:
                            </p>

                            <!-- Appointment details -->
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
                                style="background-color:#F5F8F5; border:1px solid #E4EBE5; border-radius:10px;">

                                <tr>
                                    <td colspan="2" style="padding:20px 20px 12px;">
                                        <h2 style="margin:0; font-size:16px; line-height:22px; color:#34483A;">
                                            Appointment Details
                                        </h2>
                                    </td>
                                </tr>

                                <tr>
                                    <td width="35%" style="padding:9px 20px; font-size:13px; color:#78857B;">
                                        Date
                                    </td>
                                    <td style="padding:9px 20px; font-size:13px; font-weight:bold; color:#34483A; text-align:right;">
                                        {{appointment_date}}
                                    </td>
                                </tr>

                                <tr>
                                    <td width="35%" style="padding:9px 20px; font-size:13px; color:#78857B;">
                                        Time
                                    </td>
                                    <td style="padding:9px 20px; font-size:13px; font-weight:bold; color:#34483A; text-align:right;">
                                        {{appointment_time}}
                                    </td>
                                </tr>

                                <tr>
                                    <td width="35%" style="padding:9px 20px; font-size:13px; color:#78857B;">
                                        Doctor
                                    </td>
                                    <td style="padding:9px 20px; font-size:13px; font-weight:bold; color:#34483A; text-align:right;">
                                        {{doctor_name}}
                                    </td>
                                </tr>

                                <tr>
                                    <td width="35%" style="padding:9px 20px; font-size:13px; color:#78857B;">
                                        Service
                                    </td>
                                    <td style="padding:9px 20px; font-size:13px; font-weight:bold; color:#34483A; text-align:right;">
                                        {{service_name}}
                                    </td>
                                </tr>

                                <tr>
                                    <td width="35%" style="padding:9px 20px; font-size:13px; color:#78857B;">
                                        Branch
                                    </td>
                                    <td style="padding:9px 20px; font-size:13px; font-weight:bold; color:#34483A; text-align:right;">
                                        {{branch_name}}
                                    </td>
                                </tr>

                                <tr>
                                    <td width="35%" style="padding:9px 20px 20px; font-size:13px; color:#78857B; vertical-align:top;">
                                        Address
                                    </td>
                                    <td style="padding:9px 20px 20px; font-size:13px; font-weight:bold; line-height:20px; color:#34483A; text-align:right;">
                                        {{branch_address}}
                                    </td>
                                </tr>

                            </table>

                            <p style="margin:24px 0 20px; font-size:15px; line-height:24px; color:#53645A;">
                                We look forward to seeing you! If you have any questions or need assistance,
                                please contact our clinic.
                            </p>

                            <!-- Contact clinic button -->
                            <table role="presentation" cellpadding="0" cellspacing="0" border="0"
                                style="margin:0 auto;">
                                <tr>
                                    <td align="center" bgcolor="#52765E" style="border-radius:8px;">
                                        <a
                                            href="{{clinic_contact_url}}"
                                            target="_blank"
                                            style="display:inline-block; padding:14px 28px; font-size:14px; line-height:20px; font-weight:bold; color:#FFFFFF; text-decoration:none; border-radius:8px;"
                                        >
                                            Contact Clinic
                                        </a>
                                    </td>
                                </tr>
                            </table>

                            <p style="margin:22px 0 0; font-size:12px; line-height:20px; color:#879188; text-align:center;">
                                If you need to reschedule, please contact the clinic directly.
                            </p>

                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="padding:22px 24px; border-top:1px solid #E9EEE9; text-align:center;">

                            <p style="margin:0 0 6px; font-size:14px; font-weight:bold; color:#52765E;">
                                {{clinic_name}}
                            </p>

                            <p style="margin:0; font-size:12px; line-height:18px; color:#879188;">
                                This email was sent regarding your appointment with {{clinic_name}}.
                            </p>

                            <p style="margin:12px 0 0; font-size:11px; color:#A0AAA2;">
                                Powered by Medora
                            </p>

                        </td>
                    </tr>

                </table>
                <!-- End email container -->

            </td>
        </tr>
    </table>

</body>
</html>
$email$,
    TRUE
)
ON CONFLICT (code)
WHERE clinic_id IS NULL
DO NOTHING;
