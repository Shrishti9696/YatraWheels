import mongoose, { Schema, Document, Types } from "mongoose";

export interface IVehicle extends Document {
  vendorId?: Types.ObjectId;
  name: string;
  type: "car" | "van" | "bus" | "luxury";
  capacity: number;
  pricePerDay: number;
  pricePerKm: number;
  location: string;
  features: string[];
  imageUrl: string;
  images: string[];
  rating: number;
  reviewCount: number;
  isAvailable: boolean;
  isApproved: boolean;
  approvalStatus: "pending" | "approved" | "rejected";
  rejectionReason?: string;
  createdAt: Date;
}

const vehicleSchema = new Schema<IVehicle>(
  {
    vendorId: { type: Schema.Types.ObjectId, ref: "User" },
    name: { type: String, required: true, trim: true },
    type: { type: String, enum: ["car", "van", "bus", "luxury"], required: true },
    capacity: { type: Number, required: true, min: 1 },
    pricePerDay: { type: Number, required: true, min: 0 },
    pricePerKm: { type: Number, required: true, min: 0 },
    location: { type: String, required: true, trim: true },
    features: [{ type: String }],
    imageUrl: { type: String, default: "" },
    images: [{ type: String }],
    rating: { type: Number, default: 4.5, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    isAvailable: { type: Boolean, default: true },
    isApproved: { type: Boolean, default: false },
    approvalStatus: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    rejectionReason: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

vehicleSchema.index({ vendorId: 1 });
vehicleSchema.index({ location: 1 });
vehicleSchema.index({ type: 1 });
vehicleSchema.index({ pricePerDay: 1 });
vehicleSchema.index({ capacity: 1 });

export default mongoose.model<IVehicle>("Vehicle", vehicleSchema);
