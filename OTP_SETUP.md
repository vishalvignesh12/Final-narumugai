# Narumugai OTP Configuration Guide

## Setting up Email Service for OTP

The application uses nodemailer to send OTPs to users. You need to configure your email service in the `.env.local` file.

### Required Environment Variables

```env
# Application Configuration
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Email Configuration (for OTP and other emails)
NODEMAILER_HOST=smtp.gmail.com
NODEMAILER_PORT=587
NODEMAILER_SECURE=false
NODEMAILER_EMAIL=your-email@gmail.com
NODEMAILER_PASSWORD=your-app-password
```

### Gmail Setup Instructions

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate an App Password**:
   - Go to Google Account settings
   - Navigate to Security > 2-Step Verification > App passwords
   - Generate a new app password for "Mail"
   - Use this 16-character password in the `NODEMAILER_PASSWORD` field
3. **Update the email** in `NODEMAILER_EMAIL` with your Gmail address

### Alternative Email Services

You can use any SMTP-compatible email service:

#### Outlook/Hotmail
```env
NODEMAILER_HOST=smtp-mail.outlook.com
NODEMAILER_PORT=587
NODEMAILER_SECURE=false
```

#### Yahoo Mail
```env
NODEMAILER_HOST=smtp.mail.yahoo.com
NODEMAILER_PORT=587
NODEMAILER_SECURE=false
```

### Testing OTP Functionality

After configuring your environment variables:

1. Restart your development server
2. Try the login or password reset functionality to test OTP sending
3. Check the server console for any error messages if OTPs aren't sending

### Troubleshooting

- If OTPs aren't sending, check the server console for error messages
- Ensure your email service allows SMTP access
- Verify your app password is correct (not your regular email password)
- Make sure your firewall isn't blocking the SMTP port