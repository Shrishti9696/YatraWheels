import Razorpay from "razorpay";
import crypto from "crypto";
import { logger } from "../lib/logger";

let razorpay: Razorpay | null = null;

function getRazorpay(): Razorpay {
  if (!razorpay) {
    const keyId = process.env["RAZORPAY_KEY_ID"];
    const keySecret = process.env["RAZORPAY_KEY_SECRET"];

    if (!keyId || !keySecret) {
      throw new Error("Razorpay credentials are not configured");
    }

    razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
  }
  return razorpay;
}

export async function createRazorpayOrder(amountInRupees: number, bookingId: string) {
  const rp = getRazorpay();
  const amountInPaise = Math.round(amountInRupees * 100);

  const order = await rp.orders.create({
    amount: amountInPaise,
    currency: "INR",
    receipt: `booking_${bookingId}`,
    notes: { bookingId },
  });

  logger.info({ orderId: order.id, amount: amountInPaise }, "Razorpay order created");
  return order;
}

export async function createPlanUpgradeOrder(
  amountInRupees: number,
  userId: string,
  plan: "pro" | "premium"
) {
  const rp = getRazorpay();
  const amountInPaise = Math.round(amountInRupees * 100);

  const order = await rp.orders.create({
    amount: amountInPaise,
    currency: "INR",
    receipt: `plan_${plan}_${userId.slice(-8)}`,
    notes: { userId, plan, type: "plan_upgrade" },
  });

  logger.info(
    { orderId: order.id, amount: amountInPaise, plan, userId },
    "Razorpay plan upgrade order created"
  );
  return order;
}

export function verifyRazorpaySignature(
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string
): boolean {
  const keySecret = process.env["RAZORPAY_KEY_SECRET"];
  if (!keySecret) throw new Error("Razorpay key secret not configured");

  const body = `${razorpayOrderId}|${razorpayPaymentId}`;
  const expectedSignature = crypto
    .createHmac("sha256", keySecret)
    .update(body)
    .digest("hex");

  const isValid = expectedSignature === razorpaySignature;
  logger.info({ isValid, razorpayOrderId }, "Razorpay signature verification");
  return isValid;
}
