import OpenAI from "openai";
import { logger } from "../lib/logger";

let client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!client) {
    const apiKey = process.env["OPENAI_API_KEY"];
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY environment variable is not set");
    }
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

  const prompt = `You are an expert Indian travel consultant for YatraWheels, a premium vehicle booking and travel planning platform.

A new customer has enquired about a trip. Generate a personalized travel plan for them.

Customer Details:
- Name: ${name}
- Destination: ${destination}
- Travel Dates: ${dates}
- Budget: ${budget}

Please provide a well-structured response with exactly these 3 sections:

**Travel Plan:**
A day-by-day itinerary for their trip to ${destination}, covering key highlights, recommended activities, and the best places to visit. Keep it practical and exciting.

**Budget Suggestion:**
Break down how they should allocate the ${budget} budget across transport, accommodation, food, and activities. Include YatraWheels vehicle recommendations.

**Top 3 Recommendations:**
1. [First recommendation - a must-see or must-do]
2. [Second recommendation - a hidden gem or local experience]
3. [Third recommendation - practical travel tip specific to ${destination}]

Keep the tone warm, professional, and enthusiastic. Make ${name} feel excited about their trip!`;

  try {
    const openai = getClient();

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a friendly, expert travel consultant for YatraWheels. Always provide practical, well-formatted travel advice. Use clear section headers and bullet points for readability.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 1000,
      temperature: 0.7,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("OpenAI returned an empty response");
    }

    logger.info({ destination, model: "gpt-4o-mini" }, "OpenAI travel plan generated");
    return content;
  } catch (err: any) {
    logger.error({ err: err.message }, "OpenAI API call failed");
    throw new Error(`Failed to generate travel plan: ${err.message}`);
  }
}
