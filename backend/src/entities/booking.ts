import { BookingStatus } from "../models/bookingModel.js";
import type { IBooking, IBookingTicket } from "../utils/types/IBooking.js";

export class Booking {
    readonly id: string;
    userId: string;
    eventId: string;
    tickets: IBookingTicket[];
    orderId: string;
    totalAmount: number;
    status: string;
    lockedUntil: Date;
    paymentMethod: string;
    createdAt: Date;
    updatedAt: Date;

    constructor(props: Partial<IBooking>) {
        this.id = props._id?.toString() ?? '';
        this.userId = props.userId?.toString() ?? '';
        this.eventId = props.eventId?.toString() ?? '';
        this.tickets = props.tickets ?? [];
        this.orderId = props.orderId as string;
        this.totalAmount = props.totalAmount ?? 0;
        this.status = props.status ?? BookingStatus.PENDING;
        this.lockedUntil = props.lockedUntil ?? new Date();
        this.paymentMethod = props.paymentMethod as string;
        this.createdAt = props.createdAt ?? new Date();
        this.updatedAt = props.updatedAt ?? new Date();
    }
}