import mongoose, { Schema } from "mongoose";
import type { IBooking } from "../utils/types/IBooking.js";

const BookingTicketSchema = new Schema({
    tierId: { type: Schema.Types.ObjectId, required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
});

export const BookingStatus = {
    PENDING: "PENDING",
    CONFIRMED: "CONFIRMED",
    EXPIRED: "EXPIRED",
    CANCELLED: "CANCELLED",
    FAILED: "FAILED"
};

const BookingSchema = new Schema<IBooking>(
    {
        userId: { type: Schema.Types.ObjectId, required: true, ref: "User" },
        eventId: { type: Schema.Types.ObjectId, required: true, ref: "Events" },
        tickets: { type: [BookingTicketSchema], required: true },
        totalAmount: { type: Number, required: true },
        status: { type: String, enum: Object.values(BookingStatus), default: BookingStatus.PENDING },
        lockedUntil: { type: Date, required: true },
        paymentMethod: { type: String, required: true },
        orderId: {type: String, required: false},
    },
    { timestamps: true }
);

const bookingModel = mongoose.model<IBooking>("Bookings", BookingSchema);

export default bookingModel;