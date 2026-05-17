import OpenAI from "openai";
import { logger } from "../lib/logger";

let client: OpenAI | null = null;

function getClient(): OpenAI | null {
  const apiKey = process.env["OPENAI_API_KEY"];
  if (!apiKey) return null;
  
  if (!client) {
    client = new OpenAI({ apiKey });
  }
  return client;
}

export interface LeadPlanParams {
  name: string;
  destination: string;
  budget: string;
  dates: string;
}

export async function generateLeadTravelPlan(params: LeadPlanParams): Promise<string> {
  const { name, destination, budget, dates } = params;
  const openai = getClient();
  if (!openai) throw new Error("OpenAI API key missing");

  const prompt = `You are an expert Indian travel consultant for YatraWheels... [omitted for brevity, keep existing logic]`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a friendly, expert travel consultant for YatraWheels." },
        { role: "user", content: prompt },
      ],
      max_tokens: 1000,
    });
    return response.choices[0]?.message?.content || "";
  } catch (err: any) {
    logger.error({ err: err.message }, "OpenAI API call failed");
    throw new Error(`Failed to generate travel plan: ${err.message}`);
  }
}

/**
 * Extracts structured filters from a natural language query for vehicle search.
 */
export async function extractVehicleFilters(query: string) {
  const openai = getClient();
  if (!openai) return null;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a search assistant for YatraWheels. Convert user queries into JSON filters.
          JSON Schema: { "type": "car"|"van"|"bus"|"luxury", "capacity": number, "priceMax": number, "features": string[], "suggestion": string }
          Keep 'suggestion' as a friendly 1-sentence response about what you found.
          If capacity is mentioned (e.g. "for 7 people"), set capacity to 7.`
        },
        { role: "user", content: query }
      ],
      response_format: { type: "json_object" }
    });

    const content = response.choices[0]?.message?.content;
    return content ? JSON.parse(content) : null;
  } catch (err) {
    logger.error({ err }, "AI Filter extraction failed");
    return null;
  }
}
