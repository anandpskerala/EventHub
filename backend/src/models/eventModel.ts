import mongoose, { Schema } from "mongoose";
import type { IEvent, ITicketTier } from "../utils/types/IEvents.js";

const TicketTierSchema = new Schema<ITicketTier>({
  name: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  quantity: { type: Number, required: true, min: 0 },
  sold: { type: Number, default: 0 },
  description: { type: String }
});

const EventSchema = new Schema<IEvent>(
  {
    name: { type: String, required: true },
    description: { type: String },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    location: { type: String, required: true },
    category: { type: String, required: true },
    image: { type: String, required: true },
    userId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "User",
    },
    ticketTiers: { type: [TicketTierSchema], default: [] },
    status: { type: String, enum: ["draft", "published", "ended"], default: "draft" }
  },
  { timestamps: true }
);

export const eventModel = mongoose.model<IEvent>("Events", EventSchema);