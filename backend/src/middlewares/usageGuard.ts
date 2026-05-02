import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User, { PLAN_LIMITS, UserPlan } from "../models/User";
import { AuthRequest } from "./auth";
import { logger } from "../lib/logger";

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export interface UsageRequest extends AuthRequest {
  aiUser?: InstanceType<typeof User>;
}

export async function usageGuard(
  req: UsageRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    next();
    return;
  }

  const token = authHeader.split(" ")[1];
  let decoded: { id: string; email: string; role: string };

  try {
    const secret = process.env["JWT_SECRET"] ?? process.env["SESSION_SECRET"] ?? "fallback-secret";
    decoded = jwt.verify(token, secret) as { id: string; email: string; role: string };
  } catch {
    res.status(401).json({ success: false, message: "Invalid or expired token." });
    return;
  }

  const user = await User.findById(decoded.id);
  if (!user) {
    res.status(401).json({ success: false, message: "User not found." });
    return;
  }

  const now = new Date();
  const msSinceReset = now.getTime() - new Date(user.lastReset).getTime();
  if (msSinceReset >= THIRTY_DAYS_MS) {
    user.usageCount = 0;
    user.lastReset = now;
    user.usageLimit = PLAN_LIMITS[user.plan as UserPlan] ?? PLAN_LIMITS.free;
    await user.save();
    logger.info({ userId: user._id, plan: user.plan }, "Monthly usage reset applied");
  }

  if (user.plan !== "premium" && user.usageCount >= user.usageLimit) {
    logger.warn(
      { userId: user._id, plan: user.plan, usageCount: user.usageCount, usageLimit: user.usageLimit },
      "Usage limit exceeded"
    );
    res.status(429).json({
      success: false,
      message: "You have reached your monthly AI usage limit. Please upgrade your plan.",
      plan: user.plan,
      usageCount: user.usageCount,
      usageLimit: user.usageLimit,
    });
    return;
  }

  req.user = { id: String(user._id), email: user.email, role: user.role };
  req.aiUser = user;
  next();
}
