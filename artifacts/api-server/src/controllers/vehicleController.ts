import { Request, Response } from "express";
import Vehicle from "../models/Vehicle";

export async function getVehicles(req: Request, res: Response): Promise<void> {
  const { type, capacity, minPrice, maxPrice, location, page = "1", limit = "20" } = req.query;

  const filter: Record<string, any> = { isAvailable: true };

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
  const vehicle = await Vehicle.findByIdAndDelete(req.params["id"]);
  if (!vehicle) {
    res.status(404).json({ message: "Vehicle not found" });
    return;
  }
  res.json({ message: "Vehicle deleted" });
}
