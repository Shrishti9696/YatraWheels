import { Request, Response } from "express";
import Booking from "../models/Booking";
import Vehicle from "../models/Vehicle";
import { buildPriceBreakdown, estimateDistance } from "../services/pricingService";
import { AuthRequest } from "../middlewares/auth";

export async function createBooking(req: AuthRequest, res: Response): Promise<void> {
  const { vehicleId, pickupLocation, dropLocation, date, returnDate, passengers } = req.body;
  const userId = req.user!.id;

  if (!vehicleId || !pickupLocation || !dropLocation || !date || !passengers) {
    res.status(400).json({ message: "Missing required booking fields" });
    return;
  }

  const vehicle = await Vehicle.findById(vehicleId);
  if (!vehicle) {
    res.status(404).json({ message: "Vehicle not found" });
    return;
  }

  const vendorId = vehicle.vendorId;

  if (!vehicle.isAvailable) {
    res.status(409).json({ message: "Vehicle is not available" });
    return;
  }

  if (passengers > vehicle.capacity) {
    res.status(400).json({
      message: `Passengers (${passengers}) exceed vehicle capacity (${vehicle.capacity})`,
    });
    return;
  }

  const bookingDate = new Date(date);
  const duplicate = await Booking.findOne({
    vehicleId,
    date: bookingDate,
    status: { $ne: "cancelled" },
  });

  if (duplicate) {
    res.status(409).json({ message: "Vehicle is already booked for this date" });
    return;
  }

  const returnD = returnDate ? new Date(returnDate) : new Date(bookingDate);
  const days = Math.max(
    1,
    Math.ceil((returnD.getTime() - bookingDate.getTime()) / (1000 * 60 * 60 * 24))
  );
  const distanceKm = estimateDistance(pickupLocation, dropLocation);
  const pricing = buildPriceBreakdown(vehicle, days, distanceKm);

  const booking = await Booking.create({
    userId,
    vehicleId,
    vendorId,
    pickupLocation,
    dropLocation,
    date: bookingDate,
    returnDate: returnD,
    passengers,
    totalPrice: pricing.total,
    status: "pending",
  });

  res.status(201).json({ booking, pricing });
}

export async function getUserBookings(req: AuthRequest, res: Response): Promise<void> {
  const userId = req.user!.id;
  const bookings = await Booking.find({ userId })
    .populate("vehicleId", "name type imageUrl pricePerDay")
    .sort({ createdAt: -1 })
    .lean();
  res.json(bookings);
}

export async function getBookingById(req: AuthRequest, res: Response): Promise<void> {
  const booking = await Booking.findById(req.params["id"])
    .populate("vehicleId")
    .populate("userId", "name email");

  if (!booking) {
    res.status(404).json({ message: "Booking not found" });
    return;
  }

  const ownerId = String(booking.userId._id ?? booking.userId);
  if (ownerId !== req.user!.id && req.user!.role !== "admin") {
    res.status(403).json({ message: "Not authorized to view this booking" });
    return;
  }

  res.json(booking);
}

export async function updateBookingStatus(req: AuthRequest, res: Response): Promise<void> {
  const { status } = req.body;
  const allowed = ["pending", "confirmed", "cancelled"];
  if (!allowed.includes(status)) {
    res.status(400).json({ message: "Invalid status" });
    return;
  }

  const booking = await Booking.findByIdAndUpdate(
    req.params["id"],
    { status },
    { new: true }
  );
  if (!booking) {
    res.status(404).json({ message: "Booking not found" });
    return;
  }
  res.json(booking);
}

export async function cancelBooking(req: AuthRequest, res: Response): Promise<void> {
  const booking = await Booking.findById(req.params["id"]);
  if (!booking) {
    res.status(404).json({ message: "Booking not found" });
    return;
  }

  if (String(booking.userId) !== req.user!.id && req.user!.role !== "admin") {
    res.status(403).json({ message: "Not authorized to cancel this booking" });
    return;
  }

  booking.status = "cancelled";
  await booking.save();

  res.json({ message: "Booking cancelled", booking });
}
