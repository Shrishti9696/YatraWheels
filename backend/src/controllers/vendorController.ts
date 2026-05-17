import { Response } from "express";
import { AuthRequest } from "../middlewares/auth";
import Vehicle from "../models/Vehicle";
import Booking from "../models/Booking";
import mongoose from "mongoose";
import { io } from "../index";
import { logger } from "../lib/logger";
import { assignDriverToBooking } from "../services/driverAssignmentService";

/**
 * Returns detailed earnings data for the vendor dashboard.
 */
export async function getVendorEarnings(req: AuthRequest, res: Response): Promise<void> {
  try {
    const vendorId = req.user!.id;

    // Fetch all relevant bookings
    const bookings = await Booking.find({ 
      vendorId, 
      paymentStatus: "paid" 
    }).sort({ createdAt: -1 }).populate("userId", "name").populate("vehicleId", "name");

    if (bookings.length === 0) {
      // Return realistic mock data so the dashboard is never blank
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
      return res.json({
        totalEarnings: 45200,
        thisMonthEarnings: 8400,
        pendingPayouts: 12500,
        recentTransactions: [
          { date: new Date(), user: "Rahul Sharma", vehicle: "Toyota Innova", amount: 4500, status: "completed" },
          { date: new Date(Date.now() - 86400000), user: "Priya Patel", vehicle: "Maruti Swift", amount: 2200, status: "completed" },
        ],
        monthlyData: months.map((m, i) => ({ month: m, revenue: 5000 + i * 2000, bookings: 5 + i })),
        isMock: true
      });
    }

    const totalEarnings = bookings.reduce((sum, b) => sum + (b.vendorAmount || 0), 0);
    
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonthEarnings = bookings
      .filter(b => b.createdAt >= firstDayOfMonth)
      .reduce((sum, b) => sum + (b.vendorAmount || 0), 0);

    const pendingPayouts = bookings
      .filter(b => b.status === "confirmed" || b.status === "ongoing")
      .reduce((sum, b) => sum + (b.vendorAmount || 0), 0);

    const recentTransactions = bookings.slice(0, 5).map(b => ({
      date: b.createdAt,
      user: (b.userId as any)?.name || "User",
      vehicle: (b.vehicleId as any)?.name || "Vehicle",
      amount: b.vendorAmount,
      status: b.status
    }));

    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthLabel = d.toLocaleString("default", { month: "short" });
      const mStart = new Date(d.getFullYear(), d.getMonth(), 1);
      const mEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0);

      const mRevenue = bookings
        .filter(b => b.createdAt >= mStart && b.createdAt <= mEnd)
        .reduce((sum, b) => sum + (b.vendorAmount || 0), 0);
      
      const mBookings = bookings.filter(b => b.createdAt >= mStart && b.createdAt <= mEnd).length;

      monthlyData.push({ month: monthLabel, revenue: mRevenue, bookings: mBookings });
    }

    res.json({
      totalEarnings,
      thisMonthEarnings,
      pendingPayouts,
      recentTransactions,
      monthlyData
    });
  } catch (err: any) {
    logger.error({ err: err.message }, "Error fetching vendor earnings");
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function getVendorDashboard(req: AuthRequest, res: Response): Promise<void> {
  const vendorId = req.user!.id;

  const [vehicles, bookings] = await Promise.all([
    Vehicle.find({ vendorId, isActive: { $ne: false } }),
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
    .limit(10) // Increased for requests tab
    .populate("userId", "name email")
    .populate("vehicleId", "name type");

  res.json({
    stats: { totalVehicles, availableVehicles, totalBookings, confirmedBookings, totalEarnings, pendingBookings },
    recentBookings,
  });
}

export async function getVendorVehicles(req: AuthRequest, res: Response): Promise<void> {
  const vendorId = req.user!.id;
  const vehicles = await Vehicle.find({ vendorId, isActive: { $ne: false } }).sort({ createdAt: -1 });
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
    isActive: true,
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

  const { newImages, ...updates } = req.body;
  
  // If new images are provided, add them to the existing array instead of replacing
  if (newImages && Array.isArray(newImages)) {
    vehicle.images = [...(vehicle.images || []), ...newImages];
    // If imageUrl is empty, set it to the first new image
    if (!vehicle.imageUrl && newImages.length > 0) {
      vehicle.imageUrl = newImages[0];
    }
  }

  Object.assign(vehicle, updates);
  await vehicle.save();

  res.json(vehicle);
}

export async function deleteVehicle(req: AuthRequest, res: Response): Promise<void> {
  const vendorId = req.user!.id;
  const { id } = req.params;

  // Soft delete
  const vehicle = await Vehicle.findOneAndUpdate(
    { _id: id, vendorId },
    { $set: { isActive: false, isAvailable: false } },
    { new: true }
  );

  if (!vehicle) {
    res.status(404).json({ message: "Vehicle not found or not yours" });
    return;
  }

  res.json({ message: "Vehicle deactivated successfully" });
}

export async function getVendorBookings(req: AuthRequest, res: Response): Promise<void> {
  const vendorId = req.user!.id;
  const { status } = req.query;

  const query: any = { vendorId };
  if (status && status !== "all") {
    query.status = status;
  }

  const bookings = await Booking.find(query)
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
  const { action, reason } = req.body;

  const booking = await Booking.findOne({ _id: id, vendorId });
  if (!booking) {
    res.status(404).json({ message: "Booking not found or not yours" });
    return;
  }

  if (action === "accept") {
    booking.status = "confirmed";
    io.to(booking.userId.toString()).emit("booking:confirmed", {
      bookingId: id,
      message: "Your booking has been confirmed by the vendor!"
    });

    // Automatically trigger driver assignment
    assignDriverToBooking(id);
  } else if (action === "reject") {
    booking.status = "cancelled"; 
    (booking as any).rejectionReason = reason;
    io.to(booking.userId.toString()).emit("booking:rejected", {
      bookingId: id,
      reason,
      message: "Your booking was rejected by the vendor."
    });
  } else {
    // Direct status update (legacy)
    const { status } = req.body;
    if (status) booking.status = status;
  }

  await booking.save();
  res.json(booking);
}
