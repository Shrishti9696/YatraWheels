import mongoose, { Schema, Document, Types } from "mongoose";

export type DriverStatus = "pending" | "approved" | "rejected";

export interface IDriver extends Document {
  userId: Types.ObjectId;
  licenseNumber: string;
  licenseImageUrl: string;
  isAvailable: boolean;
  status: DriverStatus;
  currentLocation: {
    lat: number;
    lng: number;
  };
  rating: number;
  totalTrips: number;
  totalEarnings: number;
  createdAt: Date;
}

const driverSchema = new Schema<IDriver>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    licenseNumber: { type: String, required: true, trim: true },
    licenseImageUrl: { type: String, default: "" },
    isAvailable: { type: Boolean, default: false },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    currentLocation: {
      lat: { type: Number, default: 0 },
      lng: { type: Number, default: 0 }
    },
    rating: { type: Number, default: 4.5, min: 0, max: 5 },
    totalTrips: { type: Number, default: 0 },
    totalEarnings: { type: Number, default: 0 },
  },
  { timestamps: true }
);

driverSchema.index({ isAvailable: 1 });
driverSchema.index({ status: 1 });

export default mongoose.model<IDriver>("Driver", driverSchema);
