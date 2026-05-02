import mongoose, { Schema, Document, Types } from "mongoose";

interface ItineraryActivity {
  time: string;
  activity: string;
  duration: string;
}

interface ItineraryDay {
  day: number;
  title: string;
  activities: ItineraryActivity[];
  accommodation: string;
  meals: string;
}

export interface ITrip extends Document {
  userId: Types.ObjectId;
  destination: string;
  days: number;
  passengers: number;
  budget: string;
  suggestedVehicleId?: Types.ObjectId;
  estimatedCost: number;
  itinerary: ItineraryDay[];
  highlights: string[];
  createdAt: Date;
}

const tripSchema = new Schema<ITrip>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    destination: { type: String, required: true, trim: true },
    days: { type: Number, required: true, min: 1 },
    passengers: { type: Number, required: true, min: 1 },
    budget: { type: String, required: true },
    suggestedVehicleId: { type: Schema.Types.ObjectId, ref: "Vehicle" },
    estimatedCost: { type: Number, default: 0 },
    itinerary: [
      {
        day: Number,
        title: String,
        activities: [{ time: String, activity: String, duration: String }],
        accommodation: String,
        meals: String,
      },
    ],
    highlights: [{ type: String }],
  },
  { timestamps: true }
);

tripSchema.index({ userId: 1 });

export default mongoose.model<ITrip>("Trip", tripSchema);
