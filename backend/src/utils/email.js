// src/utils/email.js
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

// Using Resend's shared test address since no custom domain is verified yet.
// Once you verify your own domain on Resend, change this to e.g. 'FleetTrack <noreply@yourdomain.com>'
const FROM_ADDRESS = 'FleetTrack <onboarding@resend.dev>';

async function sendPasswordResetEmail(toEmail, resetUrl) {
  await resend.emails.send({
    from: FROM_ADDRESS,
    to: toEmail,
    subject: 'Reset your FleetTrack password',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #1c1b19;">Reset your password</h2>
        <p>We received a request to reset your FleetTrack password. Click the button below to choose a new one.</p>
        <p style="margin: 28px 0;">
          <a href="${resetUrl}" style="background: #e8542a; color: white; padding: 12px 24px; border-radius: 7px; text-decoration: none; font-weight: 600;">
            Reset Password
          </a>
        </p>
        <p style="color: #6b6862; font-size: 0.9em;">This link expires in 30 minutes. If you didn't request this, you can safely ignore this email.</p>
        <p style="color: #6b6862; font-size: 0.8em;">If the button doesn't work, copy this link into your browser:<br>${resetUrl}</p>
      </div>
    `,
  });
}

module.exports = { sendPasswordResetEmail };
