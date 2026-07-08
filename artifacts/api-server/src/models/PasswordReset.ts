import mongoose, { Schema, Document } from "mongoose";

export interface IPasswordReset extends Document {
  userId: string;
  tokenHash: string;
  expiresAt: Date;
}

const PasswordResetSchema = new Schema<IPasswordReset>({
  userId: { type: String, required: true },
  tokenHash: { type: String, required: true },
  expiresAt: { type: Date, required: true },
}, { timestamps: true });

PasswordResetSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
PasswordResetSchema.index({ userId: 1 });

export default mongoose.model<IPasswordReset>("PasswordReset", PasswordResetSchema);
