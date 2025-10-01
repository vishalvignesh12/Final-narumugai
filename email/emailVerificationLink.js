export const emailVerificationLink = (link) => {
    const html = `
<!DOCTYPE html>
<html lang="en" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:v="urn:schemas-microsoft-com:vml">

<head>
    <title>Email Verification - Narumugai</title>
    <meta content="text/html; charset=utf-8" http-equiv="Content-Type" />
    <meta content="width=device-width, initial-scale=1.0" name="viewport" />
    <style>
        * {
            box-sizing: border-box;
        }

        body {
            margin: 0;
            padding: 0;

        }

        a[x-apple-data-detectors] {
            color: inherit !important;
            text-decoration: inherit !important;
        }

        #MessageViewBody a {
            color: inherit;
            text-decoration: none;
        }

        p {
            line-height: inherit
        }

        .desktop_hide,
        .desktop_hide table {
            mso-hide: all;
            display: none;
            max-height: 0px;
            overflow: hidden;
        }

        .image_block img+div {
            display: none;
        }

        sup,
        sub {
            font-size: 75%;
            line-height: 0;
        }

        @media (max-width:520px) {
            .desktop_hide table.icons-inner {
                display: inline-block !important;
            }

            .icons-inner {
                text-align: center;
            }

            .icons-inner td {
                margin: 0 auto;
            }

            .mobile_hide {
                display: none;
            }

            .row-content {
                width: 100% !important;
            }

            .stack .column {
                width: 100%;
                display: block;
            }

            .mobile_hide {
                min-height: 0;
                max-height: 0;
                max-width: 0;
                overflow: hidden;
                font-size: 0px;
            }

            .desktop_hide,
            .desktop_hide table {
                display: table !important;
                max-height: none !important;
            }
        }
    </style>
</head>

<body class="body"
    style="background-color: #FFFFFF; margin: 0; padding: 0; -webkit-text-size-adjust: none; text-size-adjust: none;">
    <table border="0" cellpadding="0" cellspacing="0" class="nl-container" role="presentation"
        style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #FFFFFF;" width="100%">
        <tbody>
            <tr>
                <td>
                    <table align="center" border="0" cellpadding="0" cellspacing="0" class="row row-1"
                        role="presentation"
                        style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #f5f5f5; padding:50px 0;"
                        width="100%">
                        <tbody>
                            <tr>
                                <td>
                                    <table align="center" border="0" cellpadding="0" cellspacing="0"
                                        class="row-content stack" role="presentation"
                                        style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #ffffff; color: #000000; width: 500px; margin: 0 auto;"
                                        width="500">
                                        <tbody>
                                            <tr>
                                                <td class="column column-1"
                                                    style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-bottom: 20px; padding-top: 15px; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;"
                                                    width="100%">
                                                    <table border="0" cellpadding="0" cellspacing="0"
                                                        class="image_block block-1" role="presentation"
                                                        style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;"
                                                        width="100%">
                                                        <tr>
                                                            <td class="pad"
                                                                style="padding-bottom:5px;padding-left:5px;padding-right:5px;width:100%;">
                                                                <div align="center" class="alignment"
                                                                    style="line-height:10px">
                                                                    <div style="max-width: 250px;"><img
                                                                            alt="Email Verification" height="auto"
                                                                            src="https://res.cloudinary.com/dg7efdu9o/image/upload/v1747200655/otp-email_rsq47y.webp"
                                                                            style="display: block; height: auto; border: 0; width: 100%;"
                                                                            title="Email Verification" width="250" /></div>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                    <table border="0" cellpadding="0" cellspacing="0"
                                                        class="heading_block block-2" role="presentation"
                                                        style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;"
                                                        width="100%">
                                                        <tr>
                                                            <td class="pad" style="text-align:center;width:100%;">
                                                                <h1
                                                                    style="margin: 0; color: #ec4899; direction: ltr; font-family: Tahoma, Verdana, Segoe, sans-serif; font-size: 28px; font-weight: bold; letter-spacing: normal; line-height: 120%; text-align: center; margin-top: 0; margin-bottom: 0; mso-line-height-alt: 34px;">
                                                                    <strong>Email Verification</strong>
                                                                </h1>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                    <table border="0" cellpadding="10" cellspacing="0"
                                                        class="paragraph_block block-3" role="presentation"
                                                        style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;"
                                                        width="100%">
                                                        <tr>
                                                            <td class="pad">
                                                                <div
                                                                    style="color:#374151;font-family:Tahoma,Verdana,Segoe,sans-serif;font-size:15px;line-height:150%;text-align:center;mso-line-height-alt:22px;">
                                                                    <p style="margin: 0 0 10px 0; word-break: break-word;">Thank you for registering with Narumugai!</p>
                                                                    <p style="margin: 0; word-break: break-word;">Please click the button below to verify your email address and activate your account:</p>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                    <table border="0" cellpadding="10" cellspacing="0"
                                                        class="heading_block block-4" role="presentation"
                                                        style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;"
                                                        width="100%">
                                                        <tr>
                                                            <td class="pad" style="text-align: center;">
                                                                <a href="${link}"
                                                                    style="background: linear-gradient(135deg, #ec4899, #f472b6); color:white; padding:12px 35px; text-decoration: none; border-radius: 50px; font-weight: bold; display: inline-block; box-shadow: 0 4px 15px rgba(236, 72, 153, 0.3);">Verify Email</a>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                    <table border="0" cellpadding="10" cellspacing="0"
                                                        class="paragraph_block block-3" role="presentation"
                                                        style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;"
                                                        width="100%">
                                                        <tr>
                                                            <td class="pad">
                                                                <div
                                                                    style="color:#374151;font-family:Tahoma,Verdana,Segoe,sans-serif;font-size:14px;line-height:150%;text-align:center;mso-line-height-alt:21px;">
                                                                    <p style="margin: 10px 0 0 0; word-break: break-word;">If the button above doesn’t work, you can copy and paste the following link into your browser:</p>
                                                                    <a href="${link}" style="color: #ec4899; text-decoration: none; word-break: break-word; display: inline-block; padding: 8px; background-color: #f8fafc; border-radius: 8px; margin: 5px 0;">${link}</a>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                    <table border="0" cellpadding="0" cellspacing="0"
                                                        class="paragraph_block block-5" role="presentation"
                                                        style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;"
                                                        width="100%">
                                                        <tr>
                                                            <td class="pad"
                                                                style="padding-bottom:5px;padding-left:10px;padding-right:10px;padding-top:10px;">
                                                                <div
                                                                    style="color:#6b7280;font-family:Tahoma,Verdana,Segoe,sans-serif;font-size:13px;line-height:150%;text-align:center;mso-line-height-alt:19.5px;">
                                                                    <p style="margin: 10px 0 0 0;"><strong>Note:</strong> This verification link will expire in 1 hour. If you did not create an account with Narumugai, you can safely ignore this email.</p>
                                                                    <p style="margin: 15px 0 0 0; padding-top: 10px; border-top: 1px solid #e5e7eb;">
                                                                        <strong style="color: #ec4899; font-size: 16px;">Welcome to Narumugai!</strong><br/>
                                                                        <span style="color: #4b5563;">Your premier destination for exquisite sarees</span><br/>
                                                                        <a href="https://narumugai.com" target="_blank" style="color: #ec4899; text-decoration: none; font-weight: bold;">www.narumugai.com</a>
                                                                    </p>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </td>
            </tr>
        </tbody>
    </table>
</body>

</html>

      `;

    return html;
};