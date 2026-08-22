import { Request, Response } from "express";
import Trip from "../models/Trip";
import { generateTripPlan } from "../services/aiService";
import { AuthRequest } from "../middlewares/auth";

export async function createTrip(req: AuthRequest, res: Response): Promise<void> {
  const { destination, days, passengers, budget } = req.body;
  const userId = req.user!.id;

  if (!destination || !days || !passengers || !budget) {
    res.status(400).json({ message: "destination, days, passengers, and budget are required" });
    return;
  }

  const plan = await generateTripPlan({
    destination,
    days: Number(days),
    passengers: Number(passengers),
    budget,
  });

  const trip = await Trip.create({
    userId,
    destination,
    days: Number(days),
    passengers: Number(passengers),
    budget,
    suggestedVehicleId: plan.vehicleRecommendation?._id,
    estimatedCost: plan.estimatedCost,
    itinerary: plan.itinerary,
    highlights: plan.highlights,
  });

  res.status(201).json({
    trip,
    vehicleRecommendation: plan.vehicleRecommendation,
    estimatedCost: plan.estimatedCost,
    highlights: plan.highlights,
  });
}

export async function getUserTrips(req: AuthRequest, res: Response): Promise<void> {
  const userId = req.user!.id;
  const trips = await Trip.find({ userId })
    .populate("suggestedVehicleId", "name type imageUrl pricePerDay")
    .sort({ createdAt: -1 })
    .lean();
  res.json(trips);
}
