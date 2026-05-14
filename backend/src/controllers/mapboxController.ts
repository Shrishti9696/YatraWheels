import { Request, Response } from "express";
import { isMapboxAvailable } from "../lib/envValidator";
import { logger } from "../lib/logger";

/**
 * Guard for any route/controller that requires Mapbox.
 * Returns 503 with a clean message if MAPBOX_TOKEN is not set.
 */
export function requireMapbox(_req: Request, res: Response): void {
  if (!isMapboxAvailable()) {
    logger.warn("MAPBOX_TOKEN not set — live tracking unavailable");
    res.status(503).json({ success: false, message: "Live tracking is currently unavailable" });
    return;
  }

  // If token IS available, return it for frontend map initialization
  res.json({
    success: true,
    token: process.env["MAPBOX_TOKEN"],
  });
}
