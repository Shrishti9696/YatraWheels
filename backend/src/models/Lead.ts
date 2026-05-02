import mongoose, { Document, Schema } from "mongoose";

export interface ILead extends Document {
  name: string;
  email: string;
  destination: string;
  budget: string;
  dates: string;
  aiPlan: string;
  zapierSent: boolean;
  createdAt: Date;
}

const LeadSchema = new Schema<ILead>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
    },
    destination: {
      type: String,
      required: [true, "Destination is required"],
      trim: true,
      minlength: [2, "Destination must be at least 2 characters"],
    },
    budget: {
      type: String,
      required: [true, "Budget is required"],
      trim: true,
    },
    dates: {
      type: String,
      required: [true, "Travel dates are required"],
      trim: true,
    },
    aiPlan: {
      type: String,
      default: "",
    },
    zapierSent: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

LeadSchema.index({ email: 1, destination: 1, dates: 1 }, { unique: true });

export default mongoose.model<ILead>("Lead", LeadSchema);
