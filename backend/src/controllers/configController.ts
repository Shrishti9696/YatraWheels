import { Request, Response } from "express";
import {
  isOpenAIAvailable,
  isMapboxAvailable,
  isRazorpayAvailable,
  isCloudinaryAvailable,
} from "../lib/envValidator";

/**
 * GET /api/config/features
 * Returns which optional features are currently available based on env config.
 * The frontend uses this to show/hide features and display "Coming soon" badges.
 */
export function getFeatures(_req: Request, res: Response): void {
  res.json({
    success: true,
    features: {
      AI_SEARCH: isOpenAIAvailable(),
      LIVE_TRACKING: isMapboxAvailable(),
      PAYMENTS: isRazorpayAvailable(),
      CLOUD_UPLOADS: isCloudinaryAvailable(),
    },
  });
}
