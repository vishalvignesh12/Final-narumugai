export const passwordResetLink = (url) => `
<!doctype html>
<html lang="en">
  <body style="margin:0;background:#f8fafc;font-family:Arial,sans-serif;color:#1f2937">
    <div style="max-width:560px;margin:32px auto;padding:32px;background:#fff;border-radius:12px">
      <h1 style="color:#ec4899;margin-top:0">Reset your Narumugai password</h1>
      <p>We received a request to reset the password for your account.</p>
      <p style="margin:28px 0"><a href="${url}" style="background:#ec4899;color:#fff;padding:13px 22px;border-radius:8px;text-decoration:none;font-weight:bold">Choose a new password</a></p>
      <p>This link expires in 30 minutes and can be used once. If you did not request a reset, you can ignore this email.</p>
    </div>
  </body>
</html>`
