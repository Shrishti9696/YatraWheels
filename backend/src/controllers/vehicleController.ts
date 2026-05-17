import { Request, Response } from "express";
import Vehicle from "../models/Vehicle";
import { extractVehicleFilters } from "../services/openaiService";

export async function getVehicles(req: Request, res: Response): Promise<void> {
  const { type, capacity, minPrice, maxPrice, location, page = "1", limit = "20" } = req.query;

  const filter: Record<string, any> = { isAvailable: true, isActive: true, isApproved: true };

  if (type && type !== "all") filter.type = type;
  if (capacity) filter.capacity = { $gte: Number(capacity) };
  if (minPrice || maxPrice) {
    filter.pricePerDay = {};
    if (minPrice) filter.pricePerDay.$gte = Number(minPrice);
    if (maxPrice) filter.pricePerDay.$lte = Number(maxPrice);
  }
  if (location) filter.location = new RegExp(String(location), "i");

  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.min(50, Number(limit));
  const skip = (pageNum - 1) * limitNum;

  const [vehicles, total] = await Promise.all([
    Vehicle.find(filter).skip(skip).limit(limitNum).lean(),
    Vehicle.countDocuments(filter),
  ]);

  res.json({
    vehicles,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      pages: Math.ceil(total / limitNum),
    },
  });
}

export async function getVehicleById(req: Request, res: Response): Promise<void> {
  const vehicle = await Vehicle.findById(req.params["id"]);
  if (!vehicle) {
    res.status(404).json({ message: "Vehicle not found" });
    return;
  }
  res.json(vehicle);
}

/**
 * Natural language AI search with graceful keyword fallback.
 */
export async function aiSearch(req: Request, res: Response): Promise<void> {
  const { query } = req.body;
  if (!query) {
    res.status(400).json({ message: "Search query is required" });
    return;
  }

  const aiFilters = await extractVehicleFilters(query);

  if (aiFilters) {
    const mongoFilter: any = { isAvailable: true, isActive: true, isApproved: true };
    if (aiFilters.type) mongoFilter.type = aiFilters.type;
    if (aiFilters.capacity) mongoFilter.capacity = { $gte: aiFilters.capacity };
    if (aiFilters.priceMax) mongoFilter.pricePerDay = { $lte: aiFilters.priceMax };
    if (aiFilters.features?.length) mongoFilter.features = { $all: aiFilters.features };

    const vehicles = await Vehicle.find(mongoFilter).limit(20).lean();
    res.json({ vehicles, aiSuggestion: aiFilters.suggestion });
  } else {
    // Fallback: simple keyword search
    const vehicles = await Vehicle.find({
      isAvailable: true,
      isActive: true,
      isApproved: true,
      $or: [
        { name: { $regex: query, $options: "i" } },
        { location: { $regex: query, $options: "i" } },
        { features: { $regex: query, $options: "i" } }
      ]
    }).limit(20).lean();

    res.json({ vehicles, aiSuggestion: null, fallbackSearch: true });
  }
}

export async function createVehicle(req: Request, res: Response): Promise<void> {
  const vehicle = await Vehicle.create(req.body);
  res.status(201).json(vehicle);
}

export async function updateVehicle(req: Request, res: Response): Promise<void> {
  const vehicle = await Vehicle.findByIdAndUpdate(req.params["id"], req.body, {
    new: true,
    runValidators: true,
  });
  if (!vehicle) {
    res.status(404).json({ message: "Vehicle not found" });
    return;
  }
  res.json(vehicle);
}

export async function deleteVehicle(req: Request, res: Response): Promise<void> {
  const vehicle = await Vehicle.findByIdAndUpdate(req.params["id"], { isActive: false });
  if (!vehicle) {
    res.status(404).json({ message: "Vehicle not found" });
    return;
  }
  res.json({ message: "Vehicle deactivated" });
}
