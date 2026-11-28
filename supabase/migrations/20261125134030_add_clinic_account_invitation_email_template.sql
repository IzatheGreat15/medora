
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
    'clinic_account_invitation',
    'Clinic Account Invitation',
    'Sent when a clinic administrator or staff member is invited to set up their Medora account.',
    'You''re invited to join {{clinic_name}} on Medora',
    $email$
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="color-scheme" content="light">
    <title>You're invited to join {{clinic_name}} on Medora</title>
</head>
<body style="margin:0;padding:0;background-color:#F3F6F3;font-family:Arial,Helvetica,sans-serif;color:#34483A;">

    <div style="display:none;font-size:1px;color:#F3F6F3;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">
        You've been invited to join {{clinic_name}} on Medora. Set up your password to get started.
    </div>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
        style="background-color:#F3F6F3;">
        <tr>
            <td align="center" style="padding:32px 12px;">

                <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0"
                    style="width:100%;max-width:600px;background-color:#FFFFFF;border-radius:12px;overflow:hidden;">

                    <!-- Clinic branding -->
                    <tr>
                        <td align="center" style="padding:28px 24px 20px;">
                            <img
                                src="{{clinic_logo_url}}"
                                alt="{{clinic_name}}"
                                width="150"
                                style="display:block;width:150px;max-width:100%;height:auto;border:0;"
                            >
                            <p style="margin:10px 0 0;font-size:13px;color:#7A897E;">
                                Your smile, our priority
                            </p>
                        </td>
                    </tr>

                    <!-- Clinic header image -->
                    <tr>
                        <td>
                            <img
                                src="{{clinic_header_image_url}}"
                                alt="{{clinic_name}}"
                                width="600"
                                style="display:block;width:100%;max-width:600px;height:200px;object-fit:cover;border:0;"
                            >
                        </td>
                    </tr>

                    <!-- Main content -->
                    <tr>
                        <td style="padding:32px 28px 24px;">

                            <!-- Invitation badge -->
                            <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                                <tr>
                                    <td style="background-color:#EAF3EC;border-radius:20px;padding:8px 14px;">
                                        <span style="font-size:11px;font-weight:bold;letter-spacing:0.4px;color:#39764C;">
                                            ✉ ACCOUNT INVITATION
                                        </span>
                                    </td>
                                </tr>
                            </table>

                            <h1 style="margin:22px 0 14px;font-size:27px;line-height:36px;color:#263A2D;">
                                Welcome to {{clinic_name}}!
                            </h1>

                            <p style="margin:0 0 14px;font-size:15px;line-height:24px;color:#53645A;">
                                Hi {{staff_name}},
                            </p>

                            <p style="margin:0 0 14px;font-size:15px;line-height:24px;color:#53645A;">
                                Your clinic account has been created on <strong>Medora</strong>.
                                We're excited to have you on board!
                            </p>

                            <p style="margin:0 0 24px;font-size:15px;line-height:24px;color:#53645A;">
                                To get started, set up your password using the button below.
                                Once your password is set, you'll be able to access your clinic workspace.
                            </p>

                            <!-- Account details -->
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
                                style="background-color:#F5F8F5;border:1px solid #E4EBE5;border-radius:10px;">
                                <tr>
                                    <td style="padding:20px 20px 10px;">
                                        <p style="margin:0 0 16px;font-size:14px;font-weight:bold;color:#34483A;">
                                            Your account details
                                        </p>

                                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                                            <tr>
                                                <td style="padding:10px 0;font-size:13px;color:#78857B;">
                                                    Clinic
                                                </td>
                                                <td align="right" style="padding:10px 0;font-size:13px;font-weight:bold;color:#34483A;">
                                                    {{clinic_name}}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td colspan="2" style="border-top:1px solid #E4EBE5;"></td>
                                            </tr>
                                            <tr>
                                                <td style="padding:10px 0;font-size:13px;color:#78857B;">
                                                    Email address
                                                </td>
                                                <td align="right" style="padding:10px 0;font-size:13px;font-weight:bold;color:#34483A;">
                                                    {{staff_email}}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td colspan="2" style="border-top:1px solid #E4EBE5;"></td>
                                            </tr>
                                            <tr>
                                                <td style="padding:10px 0;font-size:13px;color:#78857B;">
                                                    Account status
                                                </td>
                                                <td align="right" style="padding:10px 0;font-size:13px;font-weight:bold;color:#39764C;">
                                                    Setup required
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>

                            <!-- CTA -->
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                                <tr>
                                    <td align="center" style="padding:28px 0 24px;">
                                        <a
                                            href="{{set_password_url}}"
                                            target="_blank"
                                            style="display:inline-block;background-color:#52765E;color:#FFFFFF;text-decoration:none;font-size:15px;font-weight:bold;padding:15px 30px;border-radius:8px;"
                                        >
                                            Set Up My Password
                                        </a>
                                    </td>
                                </tr>
                            </table>

                            <!-- Security reminder -->
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
                                style="background-color:#FFFAF3;border:1px solid #F0E2CE;border-radius:8px;">
                                <tr>
                                    <td style="padding:16px;">
                                        <p style="margin:0 0 6px;font-size:13px;font-weight:bold;color:#805D35;">
                                            🔒 Security reminder
                                        </p>
                                        <p style="margin:0;font-size:12px;line-height:20px;color:#805D35;">
                                            This invitation link is valid for a limited time and can only be used once.
                                            If you weren't expecting this invitation, you can safely ignore this email.
                                        </p>
                                    </td>
                                </tr>
                            </table>

                            <p style="margin:24px 0 0;font-size:14px;line-height:23px;color:#53645A;">
                                We look forward to having you with us! If you need assistance,
                                please contact your clinic administrator.
                            </p>

                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="border-top:1px solid #E9EEE9;padding:22px 28px 26px;text-align:center;">
                            <p style="margin:0 0 8px;font-size:14px;font-weight:bold;color:#52765E;">
                                {{clinic_name}}
                            </p>
                            <p style="margin:0 0 12px;font-size:11px;line-height:18px;color:#879188;">
                                This email was sent because an account was created for you at {{clinic_name}}.
                            </p>
                            <p style="margin:0;font-size:11px;color:#A0AAA2;">
                                Powered by Medora
                            </p>
                        </td>
                    </tr>

                </table>

            </td>
        </tr>
    </table>

</body>
</html>
$email$,
    TRUE
)
ON CONFLICT (code) WHERE clinic_id IS NULL
DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    subject = EXCLUDED.subject,
    body = EXCLUDED.body,
    is_active = EXCLUDED.is_active;
