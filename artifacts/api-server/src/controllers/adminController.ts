import { Response } from "express";
import { AuthRequest } from "../middlewares/auth";
import User from "../models/User";
import Vehicle from "../models/Vehicle";
import Booking from "../models/Booking";
import Driver from "../models/Driver";

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export async function getAdminStats(req: AuthRequest, res: Response): Promise<void> {
  const [
    totalUsers,
    totalVendors,
    totalDrivers,
    totalBookings,
    totalVehicles,
    paidBookings,
  ] = await Promise.all([
    User.countDocuments({ role: "user" }),
    User.countDocuments({ role: "vendor" }),
    User.countDocuments({ role: "driver" }),
    Booking.countDocuments(),
    Vehicle.countDocuments(),
    Booking.find({ paymentStatus: "paid" }).select("totalPrice platformFee"),
  ]);

  const totalRevenue = paidBookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
  const platformRevenue = paidBookings.reduce((sum, b) => sum + (b.platformFee || 0), 0);

  const now = new Date();
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const monthlyAgg = await Booking.aggregate([
    { $match: { createdAt: { $gte: sixMonthsAgo } } },
    {
      $group: {
        _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
        revenue: { $sum: { $cond: [{ $eq: ["$paymentStatus", "paid"] }, "$totalPrice", 0] } },
        bookings: { $sum: 1 },
        platformFee: { $sum: { $cond: [{ $eq: ["$paymentStatus", "paid"] }, "$platformFee", 0] } },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);

  const monthlyRevenue = [];
  const monthlyBookings = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const entry = monthlyAgg.find(e => e._id.year === year && e._id.month === month);
    const label = MONTH_LABELS[d.getMonth()];
    monthlyRevenue.push({ month: label, revenue: entry?.revenue ?? 0, platformFee: entry?.platformFee ?? 0 });
    monthlyBookings.push({ month: label, bookings: entry?.bookings ?? 0 });
  }

  const recentBookings = await Booking.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .populate("userId", "name email")
    .populate("vehicleId", "name type");

  const recentUsers = await User.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .select("-password");

  const recentPayments = await Booking.find({ paymentStatus: "paid" })
    .sort({ createdAt: -1 })
    .limit(8)
    .populate("userId", "name email")
    .populate("vehicleId", "name type")
    .lean();

  res.json({
    stats: { totalUsers, totalVendors, totalDrivers, totalBookings, totalVehicles, totalRevenue, platformRevenue },
    recentBookings,
    recentUsers,
    monthlyRevenue,
    monthlyBookings,
    recentPayments,
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

  const updates: any = { status };
  if (status === "completed") {
    updates.payoutStatus = "paid";
  }

  const booking = await Booking.findByIdAndUpdate(id, updates, { new: true });
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
