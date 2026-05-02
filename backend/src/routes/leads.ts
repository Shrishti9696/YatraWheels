import { Router } from "express";
import { createLead, getLeads } from "../controllers/leadController";
import { protect, adminOnly } from "../middlewares/auth";
import { usageGuard } from "../middlewares/usageGuard";

const router = Router();

// POST /api/lead — public but usage-aware (authenticated users get usage limit enforcement)
router.post("/", usageGuard, createLead);

// GET /api/lead — admin only
router.get("/", protect, adminOnly, getLeads);

export default router;
