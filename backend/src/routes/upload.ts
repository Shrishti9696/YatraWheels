import { Router, Request, Response } from "express";
import multer from "multer";
import { saveImage } from "../services/imageService";
import { protect, vendorOnly } from "../middlewares/auth";
import { logger } from "../lib/logger";

const uploadRouter = Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

/**
 * POST /api/upload
 * Handles image uploads with automatic Cloudinary -> Local fallback.
 */
uploadRouter.post("/", protect, vendorOnly, upload.single("image"), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      res.status(400).json({ message: "No image file provided" });
      return;
    }

    const { url, isLocal } = await saveImage(req.file.buffer, req.file.originalname);

    res.json({
      success: true,
      url,
      storage: isLocal ? "local" : "cloudinary",
      message: isLocal ? "Saved locally (Cloudinary keys missing)" : "Uploaded to Cloudinary",
    });
  } catch (err: any) {
    logger.error({ err: err.message }, "Upload error");
    res.status(500).json({ message: "Failed to upload image" });
  }
});

export default uploadRouter;
