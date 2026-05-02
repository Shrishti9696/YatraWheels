import { Response } from "express";
import { AuthRequest } from "../middlewares/auth";
import Driver from "../models/Driver";
import Booking from "../models/Booking";

export async function getDriverProfile(req: AuthRequest, res: Response): Promise<void> {
  const userId = req.user!.id;
  const driver = await Driver.findOne({ userId }).populate("userId", "name email");
  if (!driver) {
    res.status(404).json({ message: "Driver profile not found" });
    return;
  }
  res.json(driver);
}

export async function getDriverDashboard(req: AuthRequest, res: Response): Promise<void> {
  const userId = req.user!.id;
  const driver = await Driver.findOne({ userId });
  if (!driver) {
    res.status(404).json({ message: "Driver profile not found" });
    return;
  }

  const bookings = await Booking.find({ driverId: driver._id });
  const completedTrips = bookings.filter(b => b.status === "completed").length;
  const upcomingTrips = bookings.filter(b => b.status === "confirmed" || b.status === "ongoing").length;
  const totalEarnings = bookings
    .filter(b => b.status === "completed")
    .reduce((sum, b) => sum + (b.driverAmount || 0), 0);

  const recentBookings = await Booking.find({ driverId: driver._id })
    .sort({ createdAt: -1 })
    .limit(5)
    .populate("userId", "name email")
    .populate("vehicleId", "name type imageUrl");

  res.json({
    driver,
    stats: {
      totalTrips: driver.totalTrips,
      completedTrips,
      upcomingTrips,
      totalEarnings,
      rating: driver.rating,
      isAvailable: driver.isAvailable,
    },
    recentBookings,
  });
}

export async function toggleAvailability(req: AuthRequest, res: Response): Promise<void> {
  const userId = req.user!.id;
  const driver = await Driver.findOne({ userId });
  if (!driver) {
    res.status(404).json({ message: "Driver profile not found" });
    return;
  }

  driver.isAvailable = !driver.isAvailable;
  await driver.save();

  res.json({ isAvailable: driver.isAvailable });
}

export async function getDriverBookings(req: AuthRequest, res: Response): Promise<void> {
  const userId = req.user!.id;
  const driver = await Driver.findOne({ userId });
  if (!driver) {
    res.status(404).json({ message: "Driver profile not found" });
    return;
  }

  const bookings = await Booking.find({ driverId: driver._id })
    .sort({ createdAt: -1 })
    .populate("userId", "name email")
    .populate("vehicleId", "name type imageUrl")
    .lean();

  res.json(bookings);
}

export async function getAvailableDrivers(req: AuthRequest, res: Response): Promise<void> {
  const { city } = req.query as { city?: string };
  const filter: Record<string, any> = { isAvailable: true, status: "approved" };
  if (city && city.trim()) {
    filter["city"] = { $regex: city.trim(), $options: "i" };
  }
  const drivers = await Driver.find(filter)
    .populate("userId", "name email")
    .lean();
  res.json(drivers);
}

export async function updateDriverProfile(req: AuthRequest, res: Response): Promise<void> {
  const userId = req.user!.id;
  const driver = await Driver.findOne({ userId });
  if (!driver) {
    res.status(404).json({ message: "Driver profile not found" });
    return;
  }

  const { licenseNumber, licenseUrl, city } = req.body;
  if (licenseNumber) driver.licenseNumber = licenseNumber;
  if (licenseUrl) driver.licenseUrl = licenseUrl;
  if (city !== undefined) driver.city = city;
  await driver.save();

  res.json(driver);
}
