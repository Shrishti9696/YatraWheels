import nodemailer from "nodemailer";
import { Resend } from "resend";
import { logger } from "../lib/logger";

const GMAIL_USER = "yatrawheels.official@gmail.com";
const FROM_NAME = "YatraWheels";

function getResend(): Resend | null {
  const key = process.env["RESEND_API_KEY"];
  if (!key) return null;
  return new Resend(key);
}

function createGmailTransporter() {
  const pass = process.env["GMAIL_APP_PASSWORD"];
  if (!pass) return null;
  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: { user: GMAIL_USER, pass: pass.replace(/\s/g, "") },
  });
}

interface BookingConfirmationData {
  userName: string;
  userEmail: string;
  bookingId: string;
  vehicleName: string;
  pickupLocation: string;
  dropLocation: string;
  date: string;
  passengers: number;
  totalPrice: number;
  razorpayPaymentId: string;
}

function bookingHtml(data: BookingConfirmationData, travelDate: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0f172a;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a;padding:40px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#1e293b;border-radius:16px;overflow:hidden;max-width:600px;width:100%;">
        <tr><td style="background:linear-gradient(135deg,#6d28d9,#7c3aed);padding:32px 40px;text-align:center;">
          <div style="font-size:28px;font-weight:800;color:#fff;letter-spacing:-0.5px;">🚗 YatraWheels</div>
          <div style="color:#c4b5fd;font-size:14px;margin-top:6px;">Your Journey, Our Commitment</div>
        </td></tr>
        <tr><td style="background:#064e3b;padding:16px 40px;text-align:center;">
          <span style="color:#34d399;font-size:18px;font-weight:700;">✅ Booking Confirmed!</span>
        </td></tr>
        <tr><td style="padding:36px 40px;">
          <p style="color:#94a3b8;font-size:15px;margin:0 0 24px;">Hi <strong style="color:#e2e8f0;">${data.userName}</strong>,</p>
          <p style="color:#94a3b8;font-size:15px;margin:0 0 28px;">Your booking has been confirmed and payment received. Here are your trip details:</p>
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a;border-radius:12px;padding:24px;margin-bottom:28px;">
            <tr><td style="padding:10px 0;border-bottom:1px solid #1e293b;"><span style="color:#64748b;font-size:13px;">Booking ID</span><br><span style="color:#a78bfa;font-weight:700;font-size:15px;">#${data.bookingId.slice(-8).toUpperCase()}</span></td></tr>
            <tr><td style="padding:10px 0;border-bottom:1px solid #1e293b;"><span style="color:#64748b;font-size:13px;">Vehicle</span><br><span style="color:#e2e8f0;font-weight:600;font-size:15px;">${data.vehicleName}</span></td></tr>
            <tr><td style="padding:10px 0;border-bottom:1px solid #1e293b;"><span style="color:#64748b;font-size:13px;">Route</span><br><span style="color:#e2e8f0;font-weight:600;font-size:15px;">${data.pickupLocation} → ${data.dropLocation}</span></td></tr>
            <tr><td style="padding:10px 0;border-bottom:1px solid #1e293b;"><span style="color:#64748b;font-size:13px;">Travel Date</span><br><span style="color:#e2e8f0;font-weight:600;font-size:15px;">${travelDate}</span></td></tr>
            <tr><td style="padding:10px 0;border-bottom:1px solid #1e293b;"><span style="color:#64748b;font-size:13px;">Passengers</span><br><span style="color:#e2e8f0;font-weight:600;font-size:15px;">${data.passengers}</span></td></tr>
            <tr><td style="padding:10px 0;border-bottom:1px solid #1e293b;"><span style="color:#64748b;font-size:13px;">Payment ID</span><br><span style="color:#e2e8f0;font-size:13px;">${data.razorpayPaymentId}</span></td></tr>
            <tr><td style="padding:14px 0 0;"><span style="color:#64748b;font-size:13px;">Amount Paid</span><br><span style="color:#34d399;font-weight:800;font-size:22px;">₹${data.totalPrice.toLocaleString("en-IN")}</span></td></tr>
          </table>
          <p style="color:#64748b;font-size:13px;margin:0;">Need help? Reach us at <a href="mailto:yatrawheels.official@gmail.com" style="color:#a78bfa;">yatrawheels.official@gmail.com</a></p>
        </td></tr>
        <tr><td style="background:#0f172a;padding:20px 40px;text-align:center;border-top:1px solid #1e293b;">
          <p style="color:#475569;font-size:12px;margin:0;">© 2025 YatraWheels. All rights reserved.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function otpHtml(name: string, otp: string, roleLabel: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0f172a;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a;padding:40px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#1e293b;border-radius:16px;overflow:hidden;max-width:600px;width:100%;">
        <tr><td style="background:linear-gradient(135deg,#6d28d9,#7c3aed);padding:32px 40px;text-align:center;">
          <div style="font-size:28px;font-weight:800;color:#fff;">🚗 YatraWheels</div>
          <div style="color:#c4b5fd;font-size:14px;margin-top:6px;">${roleLabel} Verification</div>
        </td></tr>
        <tr><td style="padding:40px;">
          <p style="color:#94a3b8;font-size:15px;margin:0 0 16px;">Hi <strong style="color:#e2e8f0;">${name}</strong>,</p>
          <p style="color:#94a3b8;font-size:15px;margin:0 0 32px;">Use the OTP below to verify your <strong style="color:#a78bfa;">${roleLabel}</strong> account. This code expires in <strong style="color:#e2e8f0;">10 minutes</strong>.</p>
          <div style="background:#0f172a;border:2px solid #6d28d9;border-radius:12px;padding:28px;text-align:center;margin-bottom:32px;">
            <div style="color:#64748b;font-size:13px;margin-bottom:12px;letter-spacing:1px;text-transform:uppercase;">Your Verification Code</div>
            <div style="color:#a78bfa;font-size:48px;font-weight:900;letter-spacing:12px;">${otp}</div>
          </div>
          <p style="color:#ef4444;font-size:13px;margin:0 0 8px;">⚠️ Do not share this code with anyone.</p>
          <p style="color:#64748b;font-size:13px;margin:0;">If you didn't request this, ignore this email.</p>
        </td></tr>
        <tr><td style="background:#0f172a;padding:20px 40px;text-align:center;border-top:1px solid #1e293b;">
          <p style="color:#475569;font-size:12px;margin:0;">© 2025 YatraWheels. All rights reserved.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function sendBookingConfirmationEmail(data: BookingConfirmationData): Promise<boolean> {
  const travelDate = new Date(data.date).toLocaleDateString("en-IN", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });
  const subject = `Booking Confirmed ✅ — ${data.vehicleName} | YatraWheels`;
  const html = bookingHtml(data, travelDate);

  const resend = getResend();
  if (resend) {
    try {
      const { error } = await resend.emails.send({
        from: `${FROM_NAME} <onboarding@resend.dev>`,
        to: data.userEmail,
        subject,
        html,
      });
      if (error) throw new Error(error.message);
      logger.info({ bookingId: data.bookingId, email: data.userEmail }, "Booking confirmation email sent via Resend");
      return true;
    } catch (err: any) {
      logger.error({ err: err.message }, "Resend failed for booking confirmation, trying Gmail");
    }
  }

  const transporter = createGmailTransporter();
  if (transporter) {
    try {
      await transporter.sendMail({ from: `"${FROM_NAME}" <${GMAIL_USER}>`, to: data.userEmail, subject, html });
      logger.info({ bookingId: data.bookingId, email: data.userEmail }, "Booking confirmation email sent via Gmail");
      return true;
    } catch (err: any) {
      logger.error({ err: err.message }, "Gmail failed for booking confirmation, trying Zapier");
    }
  }

  const zapierUrl = process.env["ZAPIER_WEBHOOK_URL"];
  if (!zapierUrl) {
    logger.warn("No email method available — RESEND_API_KEY, GMAIL_APP_PASSWORD, and ZAPIER_WEBHOOK_URL all missing/failing");
    return false;
  }
  try {
    const res = await fetch(zapierUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "booking_confirmation",
        subject,
        recipient_name: data.userName,
        recipient_email: data.userEmail,
        booking_id: data.bookingId,
        vehicle_name: data.vehicleName,
        pickup_location: data.pickupLocation,
        drop_location: data.dropLocation,
        travel_date: travelDate,
        passengers: data.passengers,
        total_amount: `₹${data.totalPrice.toLocaleString("en-IN")}`,
        payment_id: data.razorpayPaymentId,
        body: `Hi ${data.userName}, your booking for ${data.vehicleName} from ${data.pickupLocation} to ${data.dropLocation} on ${travelDate} is confirmed. Amount: ₹${data.totalPrice.toLocaleString("en-IN")}. Booking ID: #${data.bookingId.slice(-8).toUpperCase()}.`,
        source: "YatraWheels",
      }),
    });
    if (!res.ok) { logger.warn({ status: res.status }, "Zapier booking email returned non-OK"); return false; }
    logger.info({ bookingId: data.bookingId, email: data.userEmail }, "Booking confirmation sent via Zapier");
    return true;
  } catch (err: any) {
    logger.error({ err: err.message }, "All email methods failed for booking confirmation");
    return false;
  }
}

export async function sendOTPEmail(email: string, name: string, otp: string, role: string): Promise<boolean> {
  const roleLabel = role === "vendor" ? "Vendor" : "Driver";
  const subject = `${otp} — YatraWheels ${roleLabel} verification code`;
  const html = otpHtml(name, otp, roleLabel);

  const resend = getResend();
  if (resend) {
    try {
      const { error } = await resend.emails.send({
        from: `${FROM_NAME} <onboarding@resend.dev>`,
        to: email,
        subject,
        html,
      });
      if (error) throw new Error(error.message);
      logger.info({ email }, "OTP email sent via Resend");
      return true;
    } catch (err: any) {
      logger.error({ err: err.message }, "Resend failed for OTP, trying Gmail");
    }
  }

  const transporter = createGmailTransporter();
  if (transporter) {
    try {
      await transporter.sendMail({ from: `"${FROM_NAME}" <${GMAIL_USER}>`, to: email, subject, html });
      logger.info({ email }, "OTP email sent via Gmail");
      return true;
    } catch (err: any) {
      logger.error({ err: err.message }, "Gmail failed for OTP — all methods exhausted");
    }
  }

  logger.warn({ email }, "No working email provider for OTP — RESEND_API_KEY not set, Gmail credentials invalid");
  return false;
}
