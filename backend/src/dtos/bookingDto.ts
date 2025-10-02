import type { Booking } from "../entities/booking.js";
import type { IBookingTicket } from "../utils/types/IBooking.js";

export interface BookingTicketDTO {
    id: string;
    tierId: string;
    quantity: number;
    price: number;
}

export interface BookingDTO {
    id: string;
    userId: string;
    eventId: string;
    tickets: BookingTicketDTO[];
    orderId: string;
    totalAmount: number;
    status: string;
    lockedUntil: string;
    paymentMethod: string;
    createdAt: string;
    updatedAt: string;
}

export interface BookingAdminDTO extends BookingDTO {
    totalTickets: number;
}


export class BookingMapper {
    static toTicketDTO(ticket: IBookingTicket): BookingTicketDTO {
        return {
            id: ticket._id?.toString() ?? "",
            tierId: ticket.tierId?.toString() ?? "",
            quantity: ticket.quantity ?? 0,
            price: ticket.price ?? 0,
        };
    }

    static toDTO(booking: Booking): BookingDTO {
        return {
            id: booking.id,
            userId: booking.userId,
            eventId: booking.eventId,
            tickets: booking.tickets.map(t => this.toTicketDTO(t)),
            totalAmount: booking.totalAmount,
            status: booking.status,
            orderId: booking.orderId,
            lockedUntil: booking.lockedUntil.toISOString(),
            paymentMethod: booking.paymentMethod as string,
            createdAt: booking.createdAt.toISOString(),
            updatedAt: booking.updatedAt.toISOString(),
        };
    }

    static toAdminDTO(booking: Booking): BookingAdminDTO {
        const totalTickets = booking.tickets.reduce((sum, t) => sum + t.quantity, 0);

        return {
            ...this.toDTO(booking),
            totalTickets,
        };
    }

    static toDTOList(bookings: Booking[]): BookingDTO[] {
        return bookings.map(b => this.toDTO(b));
    }

    static toAdminDTOList(bookings: Booking[]): BookingAdminDTO[] {
        return bookings.map(b => this.toAdminDTO(b));
    }
}