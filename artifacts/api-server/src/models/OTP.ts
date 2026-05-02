import mongoose, { Schema, Document } from "mongoose";

export interface IOTP extends Document {
  userId: string;
  email: string;
  otp: string;
  expiresAt: Date;
}

const OTPSchema = new Schema<IOTP>({
  userId: { type: String, required: true },
  email: { type: String, required: true },
  otp: { type: String, required: true },
  expiresAt: { type: Date, required: true },
}, { timestamps: true });

OTPSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
OTPSchema.index({ userId: 1 });

export default mongoose.model<IOTP>("OTP", OTPSchema);
