import path from "path";
import fs from "fs";
import { isCloudinaryAvailable } from "../lib/envValidator";
import { logger } from "../lib/logger";

// Ensure the /uploads fallback directory exists
const UPLOADS_DIR = path.resolve(process.cwd(), "uploads");
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

/**
 * Saves an image — to Cloudinary if configured, otherwise to the local /uploads folder.
 * Returns the public URL of the saved image.
 */
export async function saveImage(
  fileBuffer: Buffer,
  fileName: string
): Promise<{ url: string; isLocal: boolean }> {
  if (isCloudinaryAvailable()) {
    try {
      // Dynamic import so cloudinary isn't required if not used
      const cloudinary = await import("cloudinary");
      cloudinary.v2.config({
        cloud_name: process.env["CLOUDINARY_CLOUD_NAME"],
        api_key: process.env["CLOUDINARY_API_KEY"],
        api_secret: process.env["CLOUDINARY_API_SECRET"],
      });

      const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
        const stream = cloudinary.v2.uploader.upload_stream(
          { folder: "yatrawheels", resource_type: "image" },
          (error, result) => {
            if (error || !result) reject(error || new Error("Upload failed"));
            else resolve(result);
          }
        );
        stream.end(fileBuffer);
      });

      logger.info({ url: result.secure_url }, "Image uploaded to Cloudinary");
      return { url: result.secure_url, isLocal: false };
    } catch (err: any) {
      logger.warn({ err: err.message }, "Cloudinary upload failed — falling back to local");
    }
  }

  // Fallback: save locally to /uploads
  const safeName = `${Date.now()}-${fileName.replace(/[^a-zA-Z0-9._-]/g, "")}`;
  const filePath = path.join(UPLOADS_DIR, safeName);
  fs.writeFileSync(filePath, fileBuffer);

  const localUrl = `/uploads/${safeName}`;
  logger.info({ path: localUrl }, "Image saved locally (Cloudinary not configured)");
  return { url: localUrl, isLocal: true };
}
