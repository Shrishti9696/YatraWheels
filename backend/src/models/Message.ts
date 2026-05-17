import mongoose, { Schema, Document } from "mongoose";

export interface IMessage extends Document {
  sender: mongoose.Types.ObjectId;
  receiver: mongoose.Types.ObjectId;
  bookingId?: mongoose.Types.ObjectId;
  text: string;
  delivered: boolean;
  read: boolean;
  createdAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    receiver: { type: Schema.Types.ObjectId, ref: "User", required: true },
    bookingId: { type: Schema.Types.ObjectId, ref: "Booking" },
    text: { type: String, required: true },
    delivered: { type: Boolean, default: false },
    read: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// Indexes for fast retrieval
MessageSchema.index({ sender: 1, receiver: 1 });
MessageSchema.index({ receiver: 1, delivered: 1 });
MessageSchema.index({ bookingId: 1 });

export default mongoose.model<IMessage>("Message", MessageSchema);
