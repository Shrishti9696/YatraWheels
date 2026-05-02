import { Request, Response } from "express";
import { logger } from "../lib/logger";
import Lead from "../models/Lead";
import User from "../models/User";
import { generateLeadTravelPlan } from "../services/openaiService";
import { sendLeadToZapier } from "../services/zapierService";
import { UsageRequest } from "../middlewares/usageGuard";

interface LeadBody {
  name?: unknown;
  email?: unknown;
  destination?: unknown;
  budget?: unknown;
  dates?: unknown;
}

function validateLeadBody(body: LeadBody): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!body.name || typeof body.name !== "string" || body.name.trim().length < 2) {
    errors.push("name: must be a string with at least 2 characters");
  }

  if (
    !body.email ||
    typeof body.email !== "string" ||
    !/^\S+@\S+\.\S+$/.test(body.email.trim())
  ) {
    errors.push("email: must be a valid email address");
  }

  if (
    !body.destination ||
    typeof body.destination !== "string" ||
    body.destination.trim().length < 2
  ) {
    errors.push("destination: must be a string with at least 2 characters");
  }

  if (!body.budget || typeof body.budget !== "string" || body.budget.trim().length < 1) {
    errors.push("budget: must be a non-empty string");
  }

  if (!body.dates || typeof body.dates !== "string" || body.dates.trim().length < 1) {
    errors.push("dates: must be a non-empty string");
  }

  return { valid: errors.length === 0, errors };
}

export async function createLead(req: UsageRequest, res: Response): Promise<void> {
  const body = req.body as LeadBody;

  const { valid, errors } = validateLeadBody(body);
  if (!valid) {
    res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
    });
    return;
  }

  const name = (body.name as string).trim();
  const email = (body.email as string).trim().toLowerCase();
  const destination = (body.destination as string).trim();
  const budget = (body.budget as string).trim();
  const dates = (body.dates as string).trim();

  try {
    const existingLead = await Lead.findOne({ email, destination, dates });
    if (existingLead) {
      res.status(409).json({
        success: false,
        message: "A lead for this email, destination, and dates already exists",
        aiPlan: existingLead.aiPlan,
      });
      return;
    }

    logger.info({ email, destination }, "Processing new lead");

    let aiPlan = "";
    let aiUsed = false;

    try {
      aiPlan = await generateLeadTravelPlan({ name, destination, budget, dates });
      aiUsed = true;
    } catch (aiErr: any) {
      logger.warn({ err: aiErr.message }, "OpenAI unavailable — saving lead without AI plan");
      aiPlan =
        `Hi ${name}! Thank you for your interest in visiting ${destination}. ` +
        `Our travel team will reach out to you shortly with a personalised plan for your trip on ${dates} with a ${budget} budget. ` +
        `We look forward to making your journey unforgettable!`;
    }

    const lead = await Lead.create({ name, email, destination, budget, dates, aiPlan });

    // Increment usage count for authenticated users after a successful AI call
    if (aiUsed && req.aiUser) {
      await User.findByIdAndUpdate(req.aiUser._id, { $inc: { usageCount: 1 } });
      logger.info(
        { userId: req.aiUser._id, plan: req.aiUser.plan },
        "AI usage count incremented"
      );
    }

    const zapierSent = await sendLeadToZapier({
      name,
      email,
      destination,
      budget,
      dates,
      aiPlan,
      source: "YatraWheels",
      timestamp: new Date().toISOString(),
    });

    if (zapierSent) {
      await Lead.findByIdAndUpdate(lead._id, { zapierSent: true });
    }

    logger.info({ leadId: lead._id, email }, "Lead created successfully");

    res.status(201).json({
      success: true,
      message: "Lead processed successfully",
      aiPlan,
    });
  } catch (err: any) {
    if (err.code === 11000) {
      res.status(409).json({
        success: false,
        message: "A lead for this email, destination, and dates already exists",
      });
      return;
    }

    logger.error({ err: err.message }, "Failed to process lead");
    res.status(500).json({
      success: false,
      message: "Failed to process your request. Please try again.",
    });
  }
}

export async function getLeads(req: Request, res: Response): Promise<void> {
  try {
    const page = Math.max(1, parseInt(String(req.query["page"] ?? "1")));
    const limit = Math.min(50, Math.max(1, parseInt(String(req.query["limit"] ?? "20"))));
    const skip = (page - 1) * limit;

    const [leads, total] = await Promise.all([
      Lead.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Lead.countDocuments(),
    ]);

    res.json({
      success: true,
      data: leads,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err: any) {
    logger.error({ err: err.message }, "Failed to fetch leads");
    res.status(500).json({ success: false, message: "Failed to fetch leads" });
  }
}
