import mongoose, { Schema, Document } from "mongoose";

export type UserPlan = "free" | "pro" | "premium";
export type UserRole = "user" | "vendor" | "driver" | "admin";

export const PLAN_LIMITS: Record<UserPlan, number> = {
  free: 5,
  pro: 100,
  premium: -1,
};

export const PLAN_PRICES: Record<"pro" | "premium", number> = {
  pro: 499,
  premium: 999,
};

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  phone: string;
  bio: string;
  role: UserRole;
  plan: UserPlan;
  usageCount: number;
  usageLimit: number;
  lastReset: Date;
  isApproved: boolean;
  createdAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },
    role: {
      type: String,
      enum: ["user", "vendor", "driver", "admin"],
      default: "user",
    },
    plan: {
      type: String,
      enum: ["free", "pro", "premium"],
      default: "free",
    },
    usageCount: { type: Number, default: 0, min: 0 },
    usageLimit: { type: Number, default: PLAN_LIMITS.free },
    lastReset: { type: Date, default: () => new Date() },
    phone: { type: String, default: "", trim: true },
    bio: { type: String, default: "", trim: true, maxlength: 300 },
    isApproved: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model<IUser>("User", userSchema);
