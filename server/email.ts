import nodemailer from "nodemailer";

let transporter: nodemailer.Transporter;

async function setupEmail() {
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    console.log("SMTP email transport configured with provided credentials.");
  } else {
    console.log("No SMTP credentials provided. Creating Ethereal test account...");
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    console.log("Ethereal test email transport configured.");
  }
}

setupEmail().catch(console.error);

const fromEmail = process.env.SMTP_FROM_EMAIL || "noreply@example.com";

export async function sendConfirmationEmail(to: string, token: string): Promise<void> {
  if (!transporter) await setupEmail();
  
  const baseUrl = process.env.REPL_SLUG && process.env.REPL_OWNER
    ? `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`
    : "http://localhost:5000";
  const link = `${baseUrl}/confirm-email?token=${token}`;

  const info = await transporter.sendMail({
    from: fromEmail,
    to,
    subject: "Confirm your Providence Forex account",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a1a2e;">Welcome to Providence Forex</h2>
        <p>Please confirm your email address by clicking the button below:</p>
        <a href="${link}" style="display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600;">Confirm Email</a>
        <p style="margin-top: 20px; color: #666;">Or copy and paste this link: <br/>${link}</p>
        <p style="color: #999; font-size: 12px; margin-top: 30px;">This link expires in 24 hours.</p>
      </div>
    `,
  });
  
  if (info.messageId && transporter.options.host === "smtp.ethereal.email") {
    console.log("Confirmation email sent! Preview URL: %s", nodemailer.getTestMessageUrl(info));
  }
}

export async function sendPasswordResetEmail(to: string, token: string): Promise<void> {
  if (!transporter) await setupEmail();

  const baseUrl = process.env.REPL_SLUG && process.env.REPL_OWNER
    ? `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`
    : "http://localhost:5000";
  const link = `${baseUrl}/reset-password?token=${token}`;

  const info = await transporter.sendMail({
    from: fromEmail,
    to,
    subject: "Reset your Providence Forex password",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a1a2e;">Password Reset Request</h2>
        <p>You requested to reset your password. Click the button below to set a new password:</p>
        <a href="${link}" style="display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600;">Reset Password</a>
        <p style="margin-top: 20px; color: #666;">Or copy and paste this link: <br/>${link}</p>
        <p style="color: #999; font-size: 12px; margin-top: 30px;">This link expires in 1 hour. If you didn't request this, please ignore this email.</p>
      </div>
    `,
  });
  
  if (info.messageId && transporter.options.host === "smtp.ethereal.email") {
    console.log("Password reset email sent! Preview URL: %s", nodemailer.getTestMessageUrl(info));
  }
}
