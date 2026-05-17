import { Request, Response } from "express";
import Booking from "../models/Booking";
import Vehicle from "../models/Vehicle";
import { AuthRequest } from "../middlewares/auth";
import { logger } from "../lib/logger";

/**
 * Creates a new booking with price calculation and availability validation.
 */
export async function createBooking(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { vehicleId, pickupLocation, dropLocation, date, returnDate, passengers, withDriver } = req.body;
    const userId = req.user!.id;

    if (!vehicleId || !pickupLocation || !date || !passengers) {
      res.status(400).json({ message: "Missing required booking fields" });
      return;
    }

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      res.status(404).json({ message: "Vehicle not found" });
      return;
    }

    // 1. Validate dates
    const startDate = new Date(date);
    const endDate = returnDate ? new Date(returnDate) : new Date(startDate);
    const now = new Date();

    if (startDate < now) {
      res.status(400).json({ message: "Booking date cannot be in the past" });
      return;
    }

    // 2. Check for overlapping bookings
    const overlapping = await Booking.findOne({
      vehicleId,
      status: { $in: ["pending", "confirmed", "ongoing"] },
      $or: [
        { date: { $lte: endDate }, returnDate: { $gte: startDate } }
      ]
    });

    if (overlapping) {
      res.status(409).json({ message: "Vehicle is already booked for these dates" });
      return;
    }

    // 3. Prevent duplicate active bookings for the same user on the same vehicle
    const activeUserBooking = await Booking.findOne({
      userId,
      vehicleId,
      status: { $in: ["pending", "confirmed", "ongoing"] }
    });

    if (activeUserBooking) {
      res.status(409).json({ message: "You already have an active booking for this vehicle" });
      return;
    }

    // 4. Calculate Price
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
    
    const basePrice = days * vehicle.pricePerDay;
    const driverFee = withDriver ? days * 500 : 0; // Flat 500/day for driver
    const platformFee = Math.round(basePrice * 0.1); // 10% platform fee
    const totalPrice = basePrice + driverFee + platformFee;

    const booking = await Booking.create({
      userId,
      vehicleId,
      vendorId: vehicle.vendorId,
      pickupLocation,
      dropLocation: dropLocation || pickupLocation,
      date: startDate,
      returnDate: endDate,
      passengers,
      withDriver: !!withDriver,
      vehicleCost: basePrice,
      driverFee,
      platformFee,
      totalPrice,
      status: "pending",
      paymentStatus: "unpaid"
    });

    res.status(201).json(booking);
  } catch (err: any) {
    logger.error({ err: err.message }, "Error creating booking");
    res.status(500).json({ message: "Internal server error" });
  }
}

/**
 * Returns all bookings for the authenticated user.
 */
export async function getUserBookings(req: AuthRequest, res: Response): Promise<void> {
  try {
    const bookings = await Booking.find({ userId: req.user!.id })
      .populate("vehicleId", "name type imageUrl pricePerDay")
      .populate("driverId", "userId rating")
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
}

/**
 * Returns a single booking with full details.
 */
export async function getBookingById(req: AuthRequest, res: Response): Promise<void> {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate({
        path: "vehicleId",
        select: "name type imageUrl pricePerDay location features"
      })
      .populate({
        path: "driverId",
        populate: { path: "userId", select: "name phone" }
      });

    if (!booking) {
      res.status(404).json({ message: "Booking not found" });
      return;
    }

    if (String(booking.userId) !== req.user!.id && req.user!.role !== "admin") {
      res.status(403).json({ message: "Unauthorized" });
      return;
    }

    res.json(booking);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
}

/**
 * Cancels a booking if it meets the criteria (24h before start).
 */
export async function cancelBooking(req: AuthRequest, res: Response): Promise<void> {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      res.status(404).json({ message: "Booking not found" });
      return;
    }

    if (String(booking.userId) !== req.user!.id && req.user!.role !== "admin") {
      res.status(403).json({ message: "Unauthorized" });
      return;
    }

    if (!["pending", "confirmed"].includes(booking.status)) {
      res.status(400).json({ message: `Cannot cancel a booking that is ${booking.status}` });
      return;
    }

    const now = new Date();
    const startTime = new Date(booking.date);
    const hoursDiff = (startTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursDiff < 24) {
      res.status(400).json({ message: "Cancellations must be done at least 24 hours before pickup" });
      return;
    }

    booking.status = "cancelled";
    await booking.save();

    res.json({ message: "Booking cancelled successfully", booking });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
}

/**
 * Returns all booked dates for a specific vehicle to disable them in UI.
 */
export async function getBookedDates(req: Request, res: Response): Promise<void> {
  try {
    const { vehicleId } = req.params;
    const bookings = await Booking.find({
      vehicleId,
      status: { $in: ["confirmed", "ongoing", "pending"] },
      date: { $gte: new Date() }
    }).select("date returnDate");

    const dates = bookings.map(b => ({
      start: b.date,
      end: b.returnDate || b.date
    }));

    res.json(dates);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
}
