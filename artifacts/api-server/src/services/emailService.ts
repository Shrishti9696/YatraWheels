import { logger } from "../lib/logger";

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

export async function sendBookingConfirmationEmail(data: BookingConfirmationData): Promise<boolean> {
  const zapierUrl = process.env["ZAPIER_WEBHOOK_URL"];
  if (!zapierUrl) {
    logger.warn("ZAPIER_WEBHOOK_URL not set — skipping booking confirmation email");
    return false;
  }

  const payload = {
    type: "booking_confirmation",
    subject: `Booking Confirmed ✅ — ${data.vehicleName} | YatraWheels`,
    recipient_name: data.userName,
    recipient_email: data.userEmail,
    booking_id: data.bookingId,
    vehicle_name: data.vehicleName,
    pickup_location: data.pickupLocation,
    drop_location: data.dropLocation,
    travel_date: new Date(data.date).toLocaleDateString("en-IN", {
      weekday: "long", year: "numeric", month: "long", day: "numeric"
    }),
    passengers: data.passengers,
    total_amount: `₹${data.totalPrice.toLocaleString("en-IN")}`,
    payment_id: data.razorpayPaymentId,
    confirmation_message: `Your booking is confirmed! Your ${data.vehicleName} is all set for your journey from ${data.pickupLocation} to ${data.dropLocation}.`,
    support_email: "yatrawheels.official@gmail.com",
    timestamp: new Date().toISOString(),
    source: "YatraWheels",
  };

  try {
    const res = await fetch(zapierUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      logger.warn({ status: res.status }, "Zapier booking email webhook returned non-OK");
      return false;
    }

    logger.info({ bookingId: data.bookingId, email: data.userEmail }, "Booking confirmation email sent via Zapier");
    return true;
  } catch (err: any) {
    logger.error({ err: err.message }, "Failed to send booking confirmation email");
    return false;
  }
}

export async function sendOTPEmail(email: string, name: string, otp: string, role: string): Promise<boolean> {
  const zapierUrl = process.env["ZAPIER_WEBHOOK_URL"];
  if (!zapierUrl) {
    logger.warn("ZAPIER_WEBHOOK_URL not set — skipping OTP email");
    return false;
  }

  const roleLabel = role === "vendor" ? "Vendor" : "Driver";

  const payload = {
    type: "otp_verification",
    subject: `Your YatraWheels verification code: ${otp}`,
    recipient_name: name,
    recipient_email: email,
    otp_code: otp,
    role: roleLabel,
    expires_in: "10 minutes",
    message: `Your ${roleLabel} two-factor authentication code is ${otp}. This code expires in 10 minutes. Do not share this code with anyone.`,
    support_email: "yatrawheels.official@gmail.com",
    timestamp: new Date().toISOString(),
    source: "YatraWheels",
  };

  try {
    const res = await fetch(zapierUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      logger.warn({ status: res.status }, "Zapier OTP email webhook returned non-OK");
      return false;
    }

    logger.info({ email }, "OTP email sent via Zapier");
    return true;
  } catch (err: any) {
    logger.error({ err: err.message }, "Failed to send OTP email");
    return false;
  }
}
