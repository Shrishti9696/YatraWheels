import mongoose, { Schema, Document, Types } from "mongoose";

export type BookingStatus = "pending" | "confirmed" | "ongoing" | "completed" | "cancelled";
export type PaymentStatus = "unpaid" | "paid" | "refunded";
export type PayoutStatus = "pending" | "paid" | "failed";

export interface IBooking extends Document {
  userId: Types.ObjectId;
  vehicleId: Types.ObjectId;
  vendorId?: Types.ObjectId;
  driverId?: Types.ObjectId;
  pickupLocation: string;
  dropLocation: string;
  date: Date;
  returnDate?: Date;
  passengers: number;
  withDriver: boolean;
  distanceKm: number;
  vehicleCost: number;
  driverFee: number;
  distanceCost: number;
  platformFee: number;
  totalPrice: number;
  vendorAmount: number;
  driverAmount: number;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  payoutStatus: PayoutStatus;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  createdAt: Date;
}

const bookingSchema = new Schema<IBooking>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    vehicleId: { type: Schema.Types.ObjectId, ref: "Vehicle", required: true },
    vendorId: { type: Schema.Types.ObjectId, ref: "User" },
    driverId: { type: Schema.Types.ObjectId, ref: "Driver" },
    pickupLocation: { type: String, required: true, trim: true },
    dropLocation: { type: String, required: true, trim: true },
    date: { type: Date, required: true },
    returnDate: { type: Date },
    passengers: { type: Number, required: true, min: 1 },
    withDriver: { type: Boolean, default: false },
    distanceKm: { type: Number, default: 0 },
    vehicleCost: { type: Number, default: 0 },
    driverFee: { type: Number, default: 0 },
    distanceCost: { type: Number, default: 0 },
    platformFee: { type: Number, default: 0 },
    totalPrice: { type: Number, required: true, min: 0 },
    vendorAmount: { type: Number, default: 0 },
    driverAmount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["pending", "confirmed", "ongoing", "completed", "cancelled"],
      default: "pending",
    },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "paid", "refunded"],
      default: "unpaid",
    },
    payoutStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
  },
  { timestamps: true }
);

bookingSchema.index({ userId: 1 });
bookingSchema.index({ vehicleId: 1 });
bookingSchema.index({ vendorId: 1 });
bookingSchema.index({ driverId: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ date: 1 });

export default mongoose.model<IBooking>("Booking", bookingSchema);
