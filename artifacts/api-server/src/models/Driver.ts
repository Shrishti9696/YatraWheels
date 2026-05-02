import mongoose, { Schema, Document, Types } from "mongoose";

export type DriverStatus = "pending" | "approved" | "rejected";

export interface IDriver extends Document {
  userId: Types.ObjectId;
  licenseNumber: string;
  licenseUrl: string;
  city: string;
  isAvailable: boolean;
  status: DriverStatus;
  rating: number;
  reviewCount: number;
  totalTrips: number;
  totalEarnings: number;
  createdAt: Date;
}

const driverSchema = new Schema<IDriver>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    licenseNumber: { type: String, required: true, trim: true },
    licenseUrl: { type: String, default: "" },
    city: { type: String, default: "", trim: true },
    isAvailable: { type: Boolean, default: true },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    rating: { type: Number, default: 4.5, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    totalTrips: { type: Number, default: 0 },
    totalEarnings: { type: Number, default: 0 },
  },
  { timestamps: true }
);

driverSchema.index({ isAvailable: 1 });
driverSchema.index({ status: 1 });

export default mongoose.model<IDriver>("Driver", driverSchema);
