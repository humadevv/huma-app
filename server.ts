import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory verification codes store with 10-minute expiration
interface VerificationRecord {
  code: string;
  target: string;
  expiresAt: number;
  attempts: number;
}

const verificationStore = new Map<string, VerificationRecord>();

// Helper to configure SMTP or email transporter if credentials exist
function getMailTransporter() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;

  if (host && user && pass) {
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
  }
  return null;
}

// 1. API: Send Verification Code to Email
app.post("/api/auth/send-verification-code", async (req, res) => {
  try {
    const { email, type = "signup" } = req.body;

    if (!email || typeof email !== "string") {
      return res.status(400).json({ success: false, error: "Valid email address is required." });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Generate secure 6-digit verification code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    verificationStore.set(cleanEmail, {
      code,
      target: cleanEmail,
      expiresAt,
      attempts: 0,
    });

    const subject = type === "signup" 
      ? "Your HUMA Verification Code" 
      : "HUMA Account Security Code";

    const htmlContent = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; background-color: #09090b; color: #ffffff; border-radius: 16px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="font-size: 28px; font-weight: 900; letter-spacing: -0.5px; color: #0095f6; margin: 0;">HUMA</h1>
          <p style="font-size: 14px; color: #a1a1aa; margin-top: 6px;">Human Made • Authentic Social Experience</p>
        </div>
        <div style="background-color: #18181b; padding: 24px; border-radius: 12px; border: 1px solid #27272a; text-align: center;">
          <p style="font-size: 14px; color: #d4d4d8; margin: 0 0 16px 0;">
            Use the 6-digit code below to verify your email address (<strong>${cleanEmail}</strong>).
          </p>
          <div style="display: inline-block; font-family: monospace; font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #38bdf8; background: #0c4a6e; padding: 12px 24px; border-radius: 8px; border: 1px solid #0284c7; margin: 12px 0;">
            ${code}
          </div>
          <p style="font-size: 12px; color: #71717a; margin-top: 16px; margin-bottom: 0;">
            This verification code will expire in 10 minutes. If you did not request this code, you can safely ignore this email.
          </p>
        </div>
        <div style="text-align: center; margin-top: 24px; font-size: 11px; color: #52525b;">
          &copy; ${new Date().getFullYear()} HUMA (Human Made). All rights reserved.
        </div>
      </div>
    `;

    // Attempt delivery via Resend API if RESEND_API_KEY is available
    if (process.env.RESEND_API_KEY) {
      try {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: process.env.EMAIL_FROM || "HUMA <verify@huma.com>",
            to: [cleanEmail],
            subject,
            html: htmlContent,
          }),
        });
        console.log(`[Email] Dispatched verification code via Resend to ${cleanEmail}`);
      } catch (err) {
        console.error("[Email] Resend delivery error:", err);
      }
    } else {
      // Attempt delivery via SMTP if configured
      const transporter = getMailTransporter();
      if (transporter) {
        try {
          await transporter.sendMail({
            from: process.env.SMTP_FROM || process.env.SMTP_USER || "HUMA <verify@huma.com>",
            to: cleanEmail,
            subject,
            html: htmlContent,
          });
          console.log(`[Email] Dispatched verification code via SMTP to ${cleanEmail}`);
        } catch (err) {
          console.error("[Email] SMTP delivery error:", err);
        }
      } else {
        // Safe server-side log for dev environment
        console.log(`[Auth Notice] Generated verification code for ${cleanEmail}: ${code}`);
      }
    }

    // Never return the code to the frontend client
    return res.json({
      success: true,
      message: `A 6-digit verification code was sent to ${cleanEmail}. Please check your inbox and spam folder.`,
      email: cleanEmail,
    });
  } catch (error) {
    console.error("[Auth] send-verification-code error:", error);
    return res.status(500).json({ success: false, error: "Failed to send verification code. Please try again." });
  }
});

// 2. API: Verify 6-Digit Code
app.post("/api/auth/verify-code", (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ success: false, error: "Email and verification code are required." });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanCode = code.toString().trim();

    const record = verificationStore.get(cleanEmail);

    if (!record) {
      return res.status(400).json({
        success: false,
        error: "No verification code was requested for this email, or it has expired.",
      });
    }

    if (Date.now() > record.expiresAt) {
      verificationStore.delete(cleanEmail);
      return res.status(400).json({
        success: false,
        error: "Verification code has expired. Please request a new one.",
      });
    }

    record.attempts += 1;
    if (record.attempts > 5) {
      verificationStore.delete(cleanEmail);
      return res.status(429).json({
        success: false,
        error: "Too many incorrect attempts. Please request a new verification code.",
      });
    }

    if (record.code !== cleanCode) {
      return res.status(400).json({
        success: false,
        error: "Invalid verification code. Please check your email and try again.",
      });
    }

    // Successful verification -> delete record to prevent replay
    verificationStore.delete(cleanEmail);

    return res.json({
      success: true,
      message: "Email successfully verified!",
      verifiedEmail: cleanEmail,
    });
  } catch (error) {
    console.error("[Auth] verify-code error:", error);
    return res.status(500).json({ success: false, error: "Failed to verify code. Please try again." });
  }
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Start Express Server with Vite integration
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`HUMA production/dev server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
