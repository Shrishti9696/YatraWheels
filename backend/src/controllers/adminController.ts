import { Response } from "express";
import { AuthRequest } from "../middlewares/auth";
import User from "../models/User";
import Vehicle from "../models/Vehicle";
import Booking from "../models/Booking";
import Driver from "../models/Driver";

export async function getAdminStats(req: AuthRequest, res: Response): Promise<void> {
  const [
    totalUsers,
    totalVendors,
    totalDrivers,
    totalBookings,
    totalVehicles,
    bookings,
  ] = await Promise.all([
    User.countDocuments({ role: "user" }),
    User.countDocuments({ role: "vendor" }),
    User.countDocuments({ role: "driver" }),
    Booking.countDocuments(),
    Vehicle.countDocuments(),
    Booking.find({ paymentStatus: "paid" }).select("totalPrice"),
  ]);

  const totalRevenue = bookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
  const platformRevenue = bookings.reduce((sum, b) => sum + (b.platformFee || 0), 0);

  const recentBookings = await Booking.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .populate("userId", "name email")
    .populate("vehicleId", "name type");

  const recentUsers = await User.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .select("-password");

  res.json({
    stats: { totalUsers, totalVendors, totalDrivers, totalBookings, totalVehicles, totalRevenue, platformRevenue },
    recentBookings,
    recentUsers,
  });
}

export async function getAllUsers(req: AuthRequest, res: Response): Promise<void> {
  const { role, page = 1, limit = 20 } = req.query;
  const filter: any = {};
  if (role) filter.role = role;

  const users = await User.find(filter)
    .select("-password")
    .sort({ createdAt: -1 })
    .skip((Number(page) - 1) * Number(limit))
    .limit(Number(limit));

  const total = await User.countDocuments(filter);
  res.json({ users, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
}

export async function updateUserRole(req: AuthRequest, res: Response): Promise<void> {
  const { id } = req.params;
  const { role } = req.body;

  const allowed = ["user", "vendor", "driver", "admin"];
  if (!allowed.includes(role)) {
    res.status(400).json({ message: "Invalid role" });
    return;
  }

  const user = await User.findByIdAndUpdate(id, { role }, { new: true }).select("-password");
  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  // Create driver profile if promoting to driver
  if (role === "driver") {
    const existing = await Driver.findOne({ userId: id });
    if (!existing) {
      await Driver.create({ userId: id, licenseNumber: "PENDING", status: "pending" });
    }
  }

  res.json(user);
}

export async function getAllVehicles(req: AuthRequest, res: Response): Promise<void> {
  const vehicles = await Vehicle.find()
    .populate("vendorId", "name email")
    .sort({ createdAt: -1 })
    .lean();
  res.json(vehicles);
}

export async function approveVehicle(req: AuthRequest, res: Response): Promise<void> {
  const { id } = req.params;
  const vehicle = await Vehicle.findByIdAndUpdate(id, { isApproved: true }, { new: true });
  if (!vehicle) {
    res.status(404).json({ message: "Vehicle not found" });
    return;
  }
  res.json(vehicle);
}

export async function getAllBookings(req: AuthRequest, res: Response): Promise<void> {
  const { status, page = 1, limit = 20 } = req.query;
  const filter: any = {};
  if (status) filter.status = status;

  const bookings = await Booking.find(filter)
    .populate("userId", "name email")
    .populate("vehicleId", "name type imageUrl")
    .sort({ createdAt: -1 })
    .skip((Number(page) - 1) * Number(limit))
    .limit(Number(limit))
    .lean();

  const total = await Booking.countDocuments(filter);
  res.json({ bookings, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
}

export async function updateBookingStatus(req: AuthRequest, res: Response): Promise<void> {
  const { id } = req.params;
  const { status } = req.body;

  const booking = await Booking.findByIdAndUpdate(id, { status }, { new: true });
  if (!booking) {
    res.status(404).json({ message: "Booking not found" });
    return;
  }
  res.json(booking);
}

export async function getAllDrivers(req: AuthRequest, res: Response): Promise<void> {
  const drivers = await Driver.find()
    .populate("userId", "name email createdAt")
    .sort({ createdAt: -1 })
    .lean();
  res.json(drivers);
}

export async function approveDriver(req: AuthRequest, res: Response): Promise<void> {
  const { id } = req.params;
  const { status } = req.body;

  const driver = await Driver.findByIdAndUpdate(id, { status }, { new: true })
    .populate("userId", "name email");
  if (!driver) {
    res.status(404).json({ message: "Driver not found" });
    return;
  }
  res.json(driver);
}
