import mongoose, { Schema, Document, Types } from "mongoose";

export interface IPayment extends Document {
  userId: Types.ObjectId;
  bookingId: Types.ObjectId;
  amount: number;
  currency: string;
  paymentProvider: "razorpay";
  paymentStatus: "pending" | "success" | "failed";
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  createdAt: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "INR" },
    paymentProvider: {
      type: String,
      enum: ["razorpay"],
      default: "razorpay",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "success", "failed"],
      default: "pending",
    },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String },
  },
  { timestamps: true }
);

paymentSchema.index({ userId: 1 });
paymentSchema.index({ bookingId: 1 });
paymentSchema.index({ razorpayOrderId: 1 });

export default mongoose.model<IPayment>("Payment", paymentSchema);
