import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User";
import Driver from "../models/Driver";
import OTP from "../models/OTP";
import { sendOTPEmail } from "../services/emailService";

function generateToken(id: string, email: string, role: string): string {
  const secret = process.env["JWT_SECRET"] ?? process.env["SESSION_SECRET"] ?? "fallback-secret";
  return jwt.sign({ id, email, role }, secret, { expiresIn: "7d" });
}

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function register(req: Request, res: Response): Promise<void> {
  const { name, email, password, role, licenseNumber, city } = req.body;

  if (!name || !email || !password) {
    res.status(400).json({ message: "Name, email, and password are required" });
    return;
  }

  const allowedRoles = ["user", "vendor", "driver"];
  const userRole = allowedRoles.includes(role) ? role : "user";

  const existing = await User.findOne({ email });
  if (existing) {
    res.status(400).json({ message: "Email already registered" });
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const user = await User.create({ name, email, password: hashedPassword, role: userRole });

  if (userRole === "driver") {
    await Driver.create({
      userId: user._id,
      licenseNumber: licenseNumber || "PENDING",
      city: city || "",
      status: "pending",
    });
  }

  const token = generateToken(String(user._id), user.email, user.role);

  res.status(201).json({
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
}

export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ message: "Email and password are required" });
    return;
  }

  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    res.status(401).json({ message: "Invalid email or password" });
    return;
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    res.status(401).json({ message: "Invalid email or password" });
    return;
  }

  if (user.role === "vendor" || user.role === "driver") {
    const otp = generateOTP();
    await OTP.deleteMany({ userId: String(user._id) });
    await OTP.create({
      userId: String(user._id),
      email: user.email,
      otp,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    await sendOTPEmail(user.email, user.name, otp, user.role);

    res.json({
      requiresOTP: true,
      userId: String(user._id),
      email: user.email,
      role: user.role,
    });
    return;
  }

  const token = generateToken(String(user._id), user.email, user.role);
  res.json({
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
}

export async function verifyOTP(req: Request, res: Response): Promise<void> {
  const { userId, otp } = req.body;

  if (!userId || !otp) {
    res.status(400).json({ message: "User ID and OTP are required" });
    return;
  }

  const record = await OTP.findOne({
    userId,
    otp,
    expiresAt: { $gt: new Date() },
  });

  if (!record) {
    res.status(400).json({ message: "Invalid or expired verification code" });
    return;
  }

  await OTP.deleteMany({ userId });

  const user = await User.findById(userId);
  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  const token = generateToken(String(user._id), user.email, user.role);
  res.json({
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
}

export async function resendOTP(req: Request, res: Response): Promise<void> {
  const { userId } = req.body;

  if (!userId) {
    res.status(400).json({ message: "User ID is required" });
    return;
  }

  const user = await User.findById(userId);
  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  if (user.role !== "vendor" && user.role !== "driver") {
    res.status(400).json({ message: "2FA is only required for vendors and drivers" });
    return;
  }

  const recent = await OTP.findOne({ userId, expiresAt: { $gt: new Date(Date.now() - 60 * 1000) } });
  if (recent) {
    res.status(429).json({ message: "Please wait 60 seconds before requesting a new code" });
    return;
  }

  const otp = generateOTP();
  await OTP.deleteMany({ userId });
  await OTP.create({
    userId,
    email: user.email,
    otp,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000),
  });

  await sendOTPEmail(user.email, user.name, otp, user.role);
  res.json({ message: "Verification code sent" });
}

export async function getMe(req: Request, res: Response): Promise<void> {
  const userId = (req as any).user?.id;
  const user = await User.findById(userId).select("-password");
  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }
  res.json(user);
}

export async function updateProfile(req: Request, res: Response): Promise<void> {
  const userId = (req as any).user?.id;
  const { name, email, phone, bio } = req.body;

  if (!name || !email) {
    res.status(400).json({ message: "Name and email are required" });
    return;
  }

  const emailExists = await User.findOne({ email, _id: { $ne: userId } });
  if (emailExists) {
    res.status(400).json({ message: "Email already in use by another account" });
    return;
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { name: name.trim(), email: email.trim().toLowerCase(), phone: phone?.trim() || "", bio: bio?.trim() || "" },
    { new: true, runValidators: true }
  ).select("-password");

  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  res.json({ message: "Profile updated successfully", user: { id: user._id, name: user.name, email: user.email, phone: user.phone, bio: user.bio, role: user.role } });
}

export async function changePassword(req: Request, res: Response): Promise<void> {
  const userId = (req as any).user?.id;
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    res.status(400).json({ message: "Current and new password are required" });
    return;
  }

  if (newPassword.length < 6) {
    res.status(400).json({ message: "New password must be at least 6 characters" });
    return;
  }

  const user = await User.findById(userId).select("+password");
  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    res.status(400).json({ message: "Current password is incorrect" });
    return;
  }

  user.password = await bcrypt.hash(newPassword, 12);
  await user.save();

  res.json({ message: "Password changed successfully" });
}
