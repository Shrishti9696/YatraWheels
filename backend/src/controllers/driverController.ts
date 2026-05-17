import { Response } from "express";
import { AuthRequest } from "../middlewares/auth";
import Driver from "../models/Driver";
import Booking from "../models/Booking";
import { io } from "../index";
import { logger } from "../lib/logger";

/**
 * Returns driver profile and summary stats.
 */
export async function getDriverProfile(req: AuthRequest, res: Response): Promise<void> {
  const userId = req.user!.id;
  const driver = await Driver.findOne({ userId }).populate("userId", "name email");
  if (!driver) {
    res.status(404).json({ message: "Driver profile not found" });
    return;
  }
  res.json(driver);
}

/**
 * Toggles driver availability status.
 */
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

/**
 * Updates driver's current GPS coordinates.
 */
export async function updateLocation(req: AuthRequest, res: Response): Promise<void> {
  const userId = req.user!.id;
  const { lat, lng } = req.body;

  const driver = await Driver.findOneAndUpdate(
    { userId },
    { $set: { currentLocation: { lat, lng } } },
    { new: true }
  );

  if (!driver) {
    res.status(404).json({ message: "Driver not found" });
    return;
  }

  res.json({ status: "success" });
}

/**
 * Updates the status of an assigned trip.
 */
export async function updateTripStatus(req: AuthRequest, res: Response): Promise<void> {
  const userId = req.user!.id;
  const { bookingId } = req.params;
  const { status } = req.body; // en_route, picked_up, completed

  const driver = await Driver.findOne({ userId });
  if (!driver) {
    res.status(404).json({ message: "Driver profile not found" });
    return;
  }

  const booking = await Booking.findOne({ _id: bookingId, driverId: driver._id });
  if (!booking) {
    res.status(404).json({ message: "Booking not found or not assigned to you" });
    return;
  }

  booking.status = status === "completed" ? "completed" : "ongoing";
  (booking as any).driverStatus = status;

  if (status === "completed") {
    driver.totalTrips += 1;
    driver.totalEarnings += booking.driverAmount || 0;
    await driver.save();
  }

  await booking.save();

  // Notify user
  io.to(booking.userId.toString()).emit("trip:status_update", {
    bookingId,
    status,
    message: `Driver is now ${status.replace("_", " ")}`
  });

  res.json(booking);
}

/**
 * Returns detailed earnings data with mock fallbacks.
 */
export async function getDriverEarnings(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.id;
    const driver = await Driver.findOne({ userId });
    if (!driver) {
      res.status(404).json({ message: "Driver not found" });
      return;
    }

    const bookings = await Booking.find({ 
      driverId: driver._id, 
      status: "completed" 
    }).sort({ createdAt: -1 });

    if (bookings.length === 0) {
      // Mock data for new drivers
      return res.json({
        totalEarnings: 15400,
        thisWeekEarnings: 2800,
        pendingPayout: 4500,
        recentTrips: [
          { date: new Date(), from: "Airport T3", to: "Cyber City", fare: 450, status: "completed" },
          { date: new Date(Date.now() - 86400000), from: "Huda City", to: "Connaught Place", fare: 600, status: "completed" }
        ],
        weeklyData: [
          { day: "Mon", amount: 450 }, { day: "Tue", amount: 800 }, { day: "Wed", amount: 0 },
          { day: "Thu", amount: 550 }, { day: "Fri", amount: 1200 }, { day: "Sat", amount: 900 }, { day: "Sun", amount: 0 }
        ]
      });
    }

    const totalEarnings = driver.totalEarnings;
    const thisWeekEarnings = bookings
      .filter(b => b.createdAt >= new Date(Date.now() - 7 * 86400000))
      .reduce((sum, b) => sum + (b.driverAmount || 0), 0);

    res.json({
      totalEarnings,
      thisWeekEarnings,
      pendingPayout: 0, // Simplified for now
      recentTrips: bookings.slice(0, 5).map(b => ({
        date: b.createdAt,
        from: b.pickupLocation,
        to: b.dropLocation,
        fare: b.driverAmount,
        status: b.status
      })),
      weeklyData: [] // Would calculate properly in full impl
    });
  } catch (err: any) {
    res.status(500).json({ message: "Error fetching earnings" });
  }
}

/**
 * Handles driver license upload.
 */
export async function uploadLicense(req: AuthRequest, res: Response): Promise<void> {
  const userId = req.user!.id;
  const { licenseNumber, licenseImageUrl } = req.body;

  const driver = await Driver.findOne({ userId });
  if (!driver) {
    res.status(404).json({ message: "Driver profile not found" });
    return;
  }

  driver.licenseNumber = licenseNumber;
  driver.licenseImageUrl = licenseImageUrl;
  driver.status = "pending";
  await driver.save();

  res.json({ message: "License uploaded for review", driver });
}

/**
 * Returns list of currently available and approved drivers.
 */
export async function getAvailableDrivers(req: any, res: Response): Promise<void> {
  try {
    const drivers = await Driver.find({ status: "approved", isAvailable: true }).populate("userId", "name email");
    res.json(drivers);
  } catch (err: any) {
    logger.error({ err: err.message }, "Error fetching available drivers");
    res.status(500).json({ message: "Error fetching available drivers" });
  }
}

