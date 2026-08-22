import { Response } from "express";
import { AuthRequest } from "../middlewares/auth";
import User, { PLAN_LIMITS, PLAN_PRICES, UserPlan } from "../models/User";
import { createPlanUpgradeOrder, verifyRazorpaySignature } from "../services/paymentService";
import { logger } from "../lib/logger";

const UPGRADEABLE_PLANS: Array<"pro" | "premium"> = ["pro", "premium"];

export async function getUpgradeStatus(req: AuthRequest, res: Response): Promise<void> {
  const user = await User.findById(req.user!.id).select(
    "name email plan usageCount usageLimit lastReset"
  );

  if (!user) {
    res.status(404).json({ success: false, message: "User not found" });
    return;
  }

  const isUnlimited = user.plan === "premium";
  const nextReset = new Date(
    new Date(user.lastReset).getTime() + 30 * 24 * 60 * 60 * 1000
  );

  res.json({
    success: true,
    plan: user.plan,
    usageCount: user.usageCount,
    usageLimit: isUnlimited ? null : user.usageLimit,
    unlimited: isUnlimited,
    nextReset: nextReset.toISOString(),
    pricing: {
      pro: { price: PLAN_PRICES.pro, currency: "INR", limit: PLAN_LIMITS.pro },
      premium: { price: PLAN_PRICES.premium, currency: "INR", limit: "Unlimited" },
    },
  });
}

export async function createUpgradeOrder(req: AuthRequest, res: Response): Promise<void> {
  const { plan } = req.body as { plan?: unknown };

  if (!plan || !UPGRADEABLE_PLANS.includes(plan as "pro" | "premium")) {
    res.status(400).json({
      success: false,
      message: `plan must be one of: ${UPGRADEABLE_PLANS.join(", ")}`,
    });
    return;
  }

  const targetPlan = plan as "pro" | "premium";
  const user = await User.findById(req.user!.id);

  if (!user) {
    res.status(404).json({ success: false, message: "User not found" });
    return;
  }

  if (user.plan === targetPlan) {
    res.status(400).json({
      success: false,
      message: `You are already on the ${targetPlan} plan`,
    });
    return;
  }

  if (user.plan === "premium" && targetPlan === "pro") {
    res.status(400).json({
      success: false,
      message: "Cannot downgrade from premium to pro",
    });
    return;
  }

  const amount = PLAN_PRICES[targetPlan];
  const order = await createPlanUpgradeOrder(amount, String(user._id), targetPlan);

  logger.info(
    { userId: user._id, targetPlan, orderId: order.id },
    "Plan upgrade order created"
  );

  res.status(201).json({
    success: true,
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    plan: targetPlan,
    keyId: process.env["RAZORPAY_KEY_ID"],
  });
}

export async function verifyUpgradePayment(req: AuthRequest, res: Response): Promise<void> {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature, plan } = req.body as {
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    razorpaySignature?: string;
    plan?: string;
  };

  if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature || !plan) {
    res.status(400).json({
      success: false,
      message: "razorpayOrderId, razorpayPaymentId, razorpaySignature and plan are required",
    });
    return;
  }

  if (!UPGRADEABLE_PLANS.includes(plan as "pro" | "premium")) {
    res.status(400).json({
      success: false,
      message: `plan must be one of: ${UPGRADEABLE_PLANS.join(", ")}`,
    });
    return;
  }

  const isValid = verifyRazorpaySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);

  if (!isValid) {
    logger.warn({ razorpayOrderId }, "Plan upgrade payment signature invalid");
    res.status(400).json({
      success: false,
      message: "Payment verification failed. Invalid signature.",
    });
    return;
  }

  const targetPlan = plan as UserPlan;
  const newLimit = PLAN_LIMITS[targetPlan];

  const user = await User.findByIdAndUpdate(
    req.user!.id,
    {
      plan: targetPlan,
      usageLimit: newLimit === -1 ? 999999 : newLimit,
    },
    { new: true }
  ).select("name email plan usageCount usageLimit");

  if (!user) {
    res.status(404).json({ success: false, message: "User not found" });
    return;
  }

  logger.info(
    { userId: user._id, plan: user.plan, razorpayPaymentId },
    "Plan upgrade completed successfully"
  );

  res.json({
    success: true,
    message: `Successfully upgraded to ${targetPlan} plan`,
    plan: user.plan,
    usageCount: user.usageCount,
    usageLimit: targetPlan === "premium" ? null : user.usageLimit,
    unlimited: targetPlan === "premium",
  });
}
