import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User";
import Driver from "../models/Driver";

function generateToken(id: string, email: string, role: string): string {
  const secret = process.env["JWT_SECRET"] ?? process.env["SESSION_SECRET"] ?? "fallback-secret";
  return jwt.sign({ id, email, role }, secret, { expiresIn: "7d" });
}

export async function register(req: Request, res: Response): Promise<void> {
  const { name, email, password, role, licenseNumber } = req.body;

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

  // If registering as driver, create driver profile
  if (userRole === "driver") {
    await Driver.create({
      userId: user._id,
      licenseNumber: licenseNumber || "PENDING",
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

  const token = generateToken(String(user._id), user.email, user.role);

  res.json({
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
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
