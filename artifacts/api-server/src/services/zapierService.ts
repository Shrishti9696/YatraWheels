import axios from "axios";
import { logger } from "../lib/logger";

export interface ZapierLeadPayload {
  name: string;
  email: string;
  destination: string;
  budget: string;
  dates: string;
  aiPlan: string;
  source: string;
  timestamp: string;
}

export async function sendLeadToZapier(payload: ZapierLeadPayload): Promise<boolean> {
  const webhookUrl = process.env["ZAPIER_WEBHOOK_URL"];

  if (!webhookUrl) {
    logger.warn("ZAPIER_WEBHOOK_URL not set — skipping Zapier notification");
    return false;
  }

  try {
    const response = await axios.post(webhookUrl, payload, {
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "YatraWheels/1.0",
      },
      timeout: 10000,
    });

    logger.info(
      { email: payload.email, status: response.status },
      "Lead sent to Zapier successfully"
    );
    return true;
  } catch (err: any) {
    logger.error({ err: err.message, email: payload.email }, "Failed to send lead to Zapier");
    return false;
  }
}
