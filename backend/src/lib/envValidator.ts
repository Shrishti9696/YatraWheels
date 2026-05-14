import { logger } from "./logger";

// ────────────────────────────────────────────────────────────────────────────
// Startup environment-variable validation
// Logs warnings for missing vars but never crashes the server.
// ────────────────────────────────────────────────────────────────────────────

interface EnvVarSpec {
  name: string;
  required: boolean;
  featureLabel: string;
}

const ENV_VARS: EnvVarSpec[] = [
  // Critical — server won't work properly without these
  { name: "PORT", required: true, featureLabel: "Server" },
  { name: "MONGODB_URI", required: true, featureLabel: "Database" },
  { name: "JWT_SECRET", required: true, featureLabel: "Authentication" },

  // Optional — features degrade gracefully
  { name: "FRONTEND_URL", required: false, featureLabel: "CORS" },
  { name: "JWT_EXPIRES_IN", required: false, featureLabel: "Auth token expiry" },
  { name: "SESSION_SECRET", required: false, featureLabel: "Session fallback" },
  { name: "OPENAI_API_KEY", required: false, featureLabel: "AI Travel Planner & YatraBot" },
  { name: "MAPBOX_TOKEN", required: false, featureLabel: "Live vehicle tracking" },
  { name: "RAZORPAY_KEY_ID", required: false, featureLabel: "Online payments" },
  { name: "RAZORPAY_KEY_SECRET", required: false, featureLabel: "Online payments" },
  { name: "RAZORPAY_WEBHOOK_SECRET", required: false, featureLabel: "Payment webhooks" },
  { name: "CLOUDINARY_CLOUD_NAME", required: false, featureLabel: "Cloud image uploads" },
  { name: "CLOUDINARY_API_KEY", required: false, featureLabel: "Cloud image uploads" },
  { name: "CLOUDINARY_API_SECRET", required: false, featureLabel: "Cloud image uploads" },
  { name: "ZAPIER_WEBHOOK_URL", required: false, featureLabel: "Email notifications" },
];

export function validateEnv(): void {
  logger.info("──── Environment Variable Check ────");

  const missingRequired: string[] = [];
  const missingOptional: string[] = [];

  for (const spec of ENV_VARS) {
    const value = process.env[spec.name];
    if (!value || value.trim() === "") {
      if (spec.required) {
        missingRequired.push(spec.name);
        logger.warn(
          `⚠️  MISSING [REQUIRED]  ${spec.name}  →  ${spec.featureLabel} may not work`
        );
      } else {
        missingOptional.push(spec.name);
        logger.warn(
          `ℹ️  MISSING [OPTIONAL]  ${spec.name}  →  ${spec.featureLabel} will be disabled`
        );
      }
    }
  }

  if (missingRequired.length === 0 && missingOptional.length === 0) {
    logger.info("✅  All environment variables are set");
  } else {
    if (missingRequired.length > 0) {
      logger.warn(
        { vars: missingRequired },
        `⚠️  ${missingRequired.length} required env var(s) missing — some core features may fail`
      );
    }
    if (missingOptional.length > 0) {
      logger.info(
        `ℹ️  ${missingOptional.length} optional env var(s) missing — related features disabled gracefully`
      );
    }
  }

  logger.info("────────────────────────────────────");
}

// ── Feature-availability helpers ──────────────────────────────────────────
// Used by controllers and the /api/config/features endpoint.

export function isOpenAIAvailable(): boolean {
  return Boolean(process.env["OPENAI_API_KEY"]);
}

export function isMapboxAvailable(): boolean {
  return Boolean(process.env["MAPBOX_TOKEN"]);
}

export function isRazorpayAvailable(): boolean {
  return Boolean(process.env["RAZORPAY_KEY_ID"] && process.env["RAZORPAY_KEY_SECRET"]);
}

export function isCloudinaryAvailable(): boolean {
  return Boolean(
    process.env["CLOUDINARY_CLOUD_NAME"] &&
    process.env["CLOUDINARY_API_KEY"] &&
    process.env["CLOUDINARY_API_SECRET"]
  );
}
