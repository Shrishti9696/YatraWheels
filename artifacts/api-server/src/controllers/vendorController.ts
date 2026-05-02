import { Response } from "express";
import { AuthRequest } from "../middlewares/auth";
import Vehicle from "../models/Vehicle";
import Booking from "../models/Booking";
import { logger } from "../lib/logger";

export async function getVendorDashboard(req: AuthRequest, res: Response): Promise<void> {
  const vendorId = req.user!.id;

  const [vehicles, bookings] = await Promise.all([
    Vehicle.find({ vendorId }),
    Booking.find({ vendorId }),
  ]);

  const totalVehicles = vehicles.length;
  const availableVehicles = vehicles.filter(v => v.isAvailable).length;
  const totalBookings = bookings.length;
  const confirmedBookings = bookings.filter(b => b.status === "confirmed" || b.status === "completed").length;
  const totalEarnings = bookings
    .filter(b => b.paymentStatus === "paid")
    .reduce((sum, b) => sum + (b.vendorAmount || 0), 0);
  const pendingBookings = bookings.filter(b => b.status === "pending").length;

  const recentBookings = await Booking.find({ vendorId })
    .sort({ createdAt: -1 })
    .limit(5)
    .populate("userId", "name email")
    .populate("vehicleId", "name type");

  res.json({
    stats: { totalVehicles, availableVehicles, totalBookings, confirmedBookings, totalEarnings, pendingBookings },
    recentBookings,
  });
}

export async function getVendorVehicles(req: AuthRequest, res: Response): Promise<void> {
  const vendorId = req.user!.id;
  const vehicles = await Vehicle.find({ vendorId }).sort({ createdAt: -1 });
  res.json(vehicles);
}

export async function addVehicle(req: AuthRequest, res: Response): Promise<void> {
  const vendorId = req.user!.id;
  const { name, type, capacity, pricePerDay, pricePerKm, location, features, imageUrl } = req.body;

  if (!name || !type || !capacity || !pricePerDay || !pricePerKm || !location) {
    res.status(400).json({ message: "All required fields must be provided" });
    return;
  }

  const vehicle = await Vehicle.create({
    vendorId,
    name,
    type,
    capacity: Number(capacity),
    pricePerDay: Number(pricePerDay),
    pricePerKm: Number(pricePerKm),
    location,
    features: features || [],
    imageUrl: imageUrl || "",
    isApproved: true,
  });

  res.status(201).json(vehicle);
}

export async function updateVehicle(req: AuthRequest, res: Response): Promise<void> {
  const vendorId = req.user!.id;
  const { id } = req.params;

  const vehicle = await Vehicle.findOne({ _id: id, vendorId });
  if (!vehicle) {
    res.status(404).json({ message: "Vehicle not found or not yours" });
    return;
  }

  const updates = req.body;
  Object.assign(vehicle, updates);
  await vehicle.save();

  res.json(vehicle);
}

export async function deleteVehicle(req: AuthRequest, res: Response): Promise<void> {
  const vendorId = req.user!.id;
  const { id } = req.params;

  const vehicle = await Vehicle.findOneAndDelete({ _id: id, vendorId });
  if (!vehicle) {
    res.status(404).json({ message: "Vehicle not found or not yours" });
    return;
  }

  res.json({ message: "Vehicle deleted successfully" });
}

export async function getVendorBookings(req: AuthRequest, res: Response): Promise<void> {
  const vendorId = req.user!.id;
  const bookings = await Booking.find({ vendorId })
    .sort({ createdAt: -1 })
    .populate("userId", "name email")
    .populate("vehicleId", "name type imageUrl")
    .populate("driverId", "userId")
    .lean();

  res.json(bookings);
}

export async function updateBookingStatus(req: AuthRequest, res: Response): Promise<void> {
  const vendorId = req.user!.id;
  const { id } = req.params;
  const { status } = req.body;

  const allowed = ["confirmed", "cancelled", "ongoing", "completed"];
  if (!allowed.includes(status)) {
    res.status(400).json({ message: "Invalid status" });
    return;
  }

  const booking = await Booking.findOne({ _id: id, vendorId });
  if (!booking) {
    res.status(404).json({ message: "Booking not found or not yours" });
    return;
  }

  booking.status = status;

  if (status === "completed") {
    booking.payoutStatus = "paid";
    logger.info(
      { bookingId: id, vendorAmount: booking.vendorAmount, driverAmount: booking.driverAmount },
      "Auto-payout triggered on trip completion"
    );
  }

  await booking.save();

  res.json(booking);
}
