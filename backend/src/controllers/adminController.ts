import { Response } from "express";
import { AuthRequest } from "../middlewares/auth";
import User from "../models/User";
import Vehicle from "../models/Vehicle";
import Booking from "../models/Booking";
import Driver from "../models/Driver";
import { logger } from "../lib/logger";
import { io } from "../index";

/**
 * Returns comprehensive analytics for the admin dashboard.
 */
export async function getAdminAnalytics(req: AuthRequest, res: Response): Promise<void> {
  try {
    const [
      totalUsers,
      totalVendors,
      totalDrivers,
      totalVehicles,
      totalBookings,
      completedBookings,
      totalRevenueData,
      activeBookings
    ] = await Promise.all([
      User.countDocuments({ role: "user" }),
      User.countDocuments({ role: "vendor" }),
      User.countDocuments({ role: "driver" }),
      Vehicle.countDocuments(),
      Booking.countDocuments(),
      Booking.countDocuments({ status: "completed" }),
      Booking.aggregate([
        { $match: { paymentStatus: "paid" } },
        { $group: { _id: null, total: { $sum: "$totalPrice" } } }
      ]),
      Booking.countDocuments({ status: { $in: ["confirmed", "ongoing"] } })
    ]);

    const totalRevenue = totalRevenueData[0]?.total || 0;

    // Monthly revenue aggregation (last 6 months)
    const revenueByMonth = await Booking.aggregate([
      { $match: { paymentStatus: "paid" } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          revenue: { $sum: "$totalPrice" },
          bookings: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } },
      { $limit: 6 }
    ]).then(results => results.map(r => ({ month: r._id, revenue: r.revenue, bookings: r.bookings })));

    // Bookings by status
    const bookingsByStatus = await Booking.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]).then(results => results.map(r => ({ status: r._id, count: r.count })));

    // Top vehicles
    const topVehicles = await Booking.aggregate([
      { $group: { _id: "$vehicleId", bookings: { $sum: 1 }, revenue: { $sum: "$totalPrice" } } },
      { $sort: { bookings: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "vehicles",
          localField: "_id",
          foreignField: "_id",
          as: "vehicle"
        }
      },
      { $unwind: "$vehicle" },
      { $project: { vehicleName: "$vehicle.name", bookings: 1, revenue: 1 } }
    ]);

    // Recent activity
    const recentActivity = [
      { type: "booking", message: "New booking for Toyota Innova", time: "2 mins ago" },
      { type: "user", message: "New vendor registered: Rajesh Motors", time: "15 mins ago" },
      { type: "vehicle", message: "New vehicle added: Mahindra Thar", time: "1 hour ago" },
    ];

    res.json({
      stats: { totalUsers, totalVendors, totalDrivers, totalVehicles, totalBookings, completedBookings, totalRevenue, activeBookings },
      revenueByMonth,
      bookingsByStatus,
      topVehicles,
      recentActivity
    });
  } catch (err: any) {
    logger.error({ err: err.message }, "Error fetching admin analytics");
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function getAllUsers(req: AuthRequest, res: Response): Promise<void> {
  const { role, search, page = 1, limit = 20 } = req.query;
  const filter: any = {};
  
  if (role && role !== "all") filter.role = role;
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } }
    ];
  }

  const users = await User.find(filter)
    .select("-password")
    .sort({ createdAt: -1 })
    .skip((Number(page) - 1) * Number(limit))
    .limit(Number(limit));

  const total = await User.countDocuments(filter);
  res.json({ users, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
}

export async function updateUserStatus(req: AuthRequest, res: Response): Promise<void> {
  const { id } = req.params;
  const { action } = req.body;

  let status: string;
  if (action === "ban") status = "banned";
  else if (action === "unban") status = "active";
  else {
    res.status(400).json({ message: "Invalid action" });
    return;
  }

  const user = await User.findByIdAndUpdate(id, { status }, { new: true }).select("-password");
  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  res.json(user);
}

export async function getUserDetails(req: AuthRequest, res: Response): Promise<void> {
  const { id } = req.params;
  const user = await User.findById(id).select("-password");
  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  const bookings = await Booking.find({ userId: id }).populate("vehicleId", "name type");
  res.json({ user, bookings });
}

export async function getPendingVehicles(req: AuthRequest, res: Response): Promise<void> {
  const vehicles = await Vehicle.find({ approvalStatus: "pending" })
    .populate("vendorId", "name email")
    .sort({ createdAt: -1 });
  res.json(vehicles);
}

export async function approveVehicleAction(req: AuthRequest, res: Response): Promise<void> {
  const { id } = req.params;
  const { action, reason } = req.body;

  const approvalStatus = action === "approve" ? "approved" : "rejected";
  const isApproved = action === "approve";

  const vehicle = await Vehicle.findByIdAndUpdate(
    id,
    { approvalStatus, isApproved, rejectionReason: reason },
    { new: true }
  ).populate("vendorId", "name email");

  if (!vehicle) {
    res.status(404).json({ message: "Vehicle not found" });
    return;
  }

  if (vehicle.vendorId) {
    io.to((vehicle.vendorId as any)._id.toString()).emit("vehicle:approval_update", {
      vehicleId: id,
      status: approvalStatus,
      message: action === "approve" 
        ? `Your vehicle ${vehicle.name} has been approved!` 
        : `Your vehicle ${vehicle.name} was rejected. Reason: ${reason}`
    });
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
  const { status, rejectionReason } = req.body;

  const driver = await Driver.findByIdAndUpdate(
    id, 
    { status, rejectionReason }, 
    { new: true }
  ).populate("userId", "name email");

  if (!driver) {
    res.status(404).json({ message: "Driver not found" });
    return;
  }
  res.json(driver);
}

export async function verifyDriverLicense(req: AuthRequest, res: Response): Promise<void> {
  const { id } = req.params;
  const { action, reason } = req.body;

  const status = action === "approve" ? "approved" : "rejected";
  const update: any = { status };
  if (reason) update.rejectionReason = reason;

  const driver = await Driver.findByIdAndUpdate(id, update, { new: true })
    .populate("userId", "name email");

  if (!driver) {
    res.status(404).json({ message: "Driver not found" });
    return;
  }

  res.json({ message: `Driver ${status} successfully`, driver });
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
