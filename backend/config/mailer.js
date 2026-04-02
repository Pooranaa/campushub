const nodemailer = require("nodemailer");

const createTransporter = () => {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: String(process.env.SMTP_SECURE || "false") === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
};

const sendVerificationCodeEmail = async ({ email, name, code }) => {
  const transporter = createTransporter();

  if (!transporter) {
    throw new Error("Email service is not configured. Please set SMTP environment variables.");
  }

  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: email,
    subject: "CampusHub verification code",
    text: `Hello ${name}, your CampusHub verification code is ${code}. It is valid for 10 minutes.`,
    html: `
      <div style="font-family:Segoe UI,Arial,sans-serif;line-height:1.6;color:#223046">
        <h2 style="margin-bottom:8px;">CampusHub Email Verification</h2>
        <p>Hello ${name},</p>
        <p>Your verification code is:</p>
        <div style="display:inline-block;padding:12px 18px;border-radius:12px;background:#eef3f8;font-size:24px;font-weight:700;letter-spacing:6px;">
          ${code}
        </div>
        <p style="margin-top:16px;">This code is valid for 10 minutes.</p>
      </div>
    `
  });
};

module.exports = {
  sendVerificationCodeEmail
};
