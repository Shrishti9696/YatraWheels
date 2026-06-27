import { Request, Response } from "express";
import { logger } from "../lib/logger";
import OpenAI from "openai";
import Vehicle from "../models/Vehicle";

function buildSystemPrompt(vehicleContext: string): string {
  return `You are YatraBot, a friendly and expert AI travel assistant for YatraWheels — India's premium vehicle booking and travel planning platform.

Your goal is to help users plan their perfect trip by collecting information conversationally, then generating a comprehensive plan.

## REAL-TIME VEHICLE INVENTORY (use this to make accurate recommendations):
${vehicleContext}

CONVERSATION FLOW:
1. Greet the user warmly and ask where they want to travel
2. Gather: destination, number of days, number of travelers, budget range (budget/moderate/premium/luxury)
3. Ask naturally, 1-2 questions at a time
4. When you have all 4 pieces of info, summarize and ask: "I have everything I need! Shall I create your personalized trip plan?"
5. When user says yes/sure/go ahead/create it: generate the complete plan with the JSON block below

BUDGET RANGES (for reference):
- budget: ₹10K–25K total
- moderate: ₹25K–60K total  
- premium: ₹60K–1.5L total
- luxury: ₹1.5L+ total

When recommending a vehicle, always pick one from the REAL-TIME INVENTORY above that best matches the group size and budget. Use the exact name, type, capacity, pricePerDay, and features from the inventory.

When generating the final plan (ONLY after user confirms), end your message with this exact block:

[PLAN]
{
  "destination": "City Name",
  "days": 3,
  "people": 2,
  "budget": "moderate",
  "estimatedCost": 45000,
  "highlights": ["Highlight 1", "Highlight 2", "Highlight 3", "Highlight 4"],
  "vehicleRecommendation": {
    "name": "Toyota Innova Crysta",
    "type": "van",
    "capacity": 7,
    "pricePerDay": 4500,
    "features": ["AC", "GPS", "Music System", "Comfortable Seating"]
  },
  "itinerary": [
    {
      "day": 1,
      "title": "Arrival & First Impressions",
      "activities": [
        {"time": "10:00 AM", "activity": "Arrive and check-in", "duration": "1h"},
        {"time": "12:00 PM", "activity": "Local lunch at famous restaurant", "duration": "1.5h"},
        {"time": "03:00 PM", "activity": "Evening sightseeing", "duration": "3h"}
      ],
      "accommodation": "Hotel name and area",
      "meals": "Lunch and dinner at local spots"
    }
  ]
}
[/PLAN]

Make the plan detailed, exciting, and specific to the destination. Include real places, actual restaurant names, and specific attractions.
Keep all chat responses concise (2-4 sentences). Be warm, enthusiastic, and use occasional emojis.
NEVER include the [PLAN] block unless the user has explicitly confirmed they want the plan created.`;
}

function getOpenAIClient(): OpenAI {
  const apiKey = process.env["OPENAI_API_KEY"];
  if (!apiKey) throw new Error("OPENAI_API_KEY not set");
  return new OpenAI({ apiKey });
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

async function fetchVehicleContext(): Promise<string> {
  try {
    const vehicles = await Vehicle.find({ isAvailable: true, isApproved: true })
      .select("name type capacity pricePerDay pricePerKm location features rating")
      .limit(20)
      .lean();

    if (vehicles.length === 0) return "No vehicles currently available.";

    return vehicles
      .map(
        v =>
          `• ${v.name} (${v.type}, ${v.capacity} seats) — ₹${v.pricePerDay}/day + ₹${v.pricePerKm}/km | Location: ${v.location} | Rating: ${v.rating}★ | Features: ${(v.features as string[]).join(", ")}`
      )
      .join("\n");
  } catch {
    return "Vehicle data temporarily unavailable.";
  }
}

export async function handleAIChat(req: Request, res: Response): Promise<void> {
  const { messages } = req.body as { messages: ChatMessage[] };

  if (!Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ message: "messages array is required" });
    return;
  }

  try {
    const [openai, vehicleContext] = await Promise.all([
      Promise.resolve(getOpenAIClient()),
      fetchVehicleContext(),
    ]);

    const systemPrompt = buildSystemPrompt(vehicleContext);

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages,
      ],
      max_tokens: 1500,
      temperature: 0.75,
    });

    const content = response.choices[0]?.message?.content ?? "";
    logger.info({ messageCount: messages.length }, "AI chat response generated");

    res.json({ content });
  } catch (err: any) {
    logger.warn({ err: err.message }, "OpenAI unavailable — returning fallback");

    const lastUserMsg = messages[messages.length - 1]?.content?.toLowerCase() ?? "";
    const wantsYes = ["yes", "sure", "ok", "go", "create", "generate", "proceed"].some(w => lastUserMsg.includes(w));
    const dest = extractDestination(messages);

    let fallback: string;
    if (wantsYes && dest) {
      fallback = `I'd love to create your ${dest} plan! Our AI is temporarily at capacity — please try again in a moment, or browse our available fleet while you wait. 🙏`;
    } else if (messages.length === 1) {
      fallback = `Welcome to YatraWheels AI Planner! 🌟 I'm YatraBot, your personal travel assistant. Where in India would you like to travel? I'll craft a perfect itinerary just for you!`;
    } else {
      fallback = `Great choice! I'm gathering the best options for you. Could you tell me more about your travel dates and how many travelers will be joining?`;
    }

    res.json({ content: fallback });
  }
}

function extractDestination(messages: ChatMessage[]): string {
  const popular = ["goa", "manali", "udaipur", "jaipur", "kerala", "mumbai", "delhi", "agra", "rishikesh", "ooty", "coorg", "darjeeling", "shimla", "leh", "ladakh", "andaman", "munnar", "mysore", "varanasi", "amritsar"];
  const text = messages.map(m => m.content).join(" ").toLowerCase();
  for (const dest of popular) {
    if (text.includes(dest)) return dest.charAt(0).toUpperCase() + dest.slice(1);
  }
  return "";
}
