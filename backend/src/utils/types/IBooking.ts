import type { Types } from "mongoose";
import type { BookingStatus } from "../../models/bookingModel.js";

export type BookingStatusType = keyof typeof BookingStatus;

export interface IBookingTicket {
    _id?: string;
    tierId: Types.ObjectId;
    quantity: number;
    price: number;
}

export interface IBooking extends Document {
    _id?: string;
    userId: Types.ObjectId;
    eventId: Types.ObjectId;
    tickets: IBookingTicket[];
    totalAmount: number;
    status: string;
    lockedUntil: Date;
    paymentMethod: string;
    orderId?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface TicketSelection {
    tierId: string;
    quantity: number;
}