import type { EventDTO } from "../../dtos/eventDto.js";
import type { TicketSelection } from "../../utils/types/IBooking.js";
import type { BookingReturnType, BookingsReturnType, CommonReturnType } from "../../utils/types/ReturnTypes.js";

export interface IBookingService {
    reserveBooking(userId: string, eventId: string, tickets: TicketSelection[], paymentMethod: string): Promise<BookingReturnType>;
    failedBooking(bookingId: string): Promise<BookingReturnType>;
    confirmBooking(bookingId: string, razorpay_order_id: string, razorpay_payment_id: string, razorpay_signature: string): Promise<BookingReturnType>;
    confirmBookingWithWallet(bookingId: string): Promise<BookingReturnType>;
    releaseBookings(bookingId: string, reason: string): Promise<void>;
    findBookingDetailsWithOrderId(orderId: string): Promise<BookingReturnType>;
    findUserBookings(userId: string, page: number, search: string, limit: number):  Promise<BookingsReturnType &{events?: EventDTO[]}>;
    cancelBooking(bookingId: string): Promise<CommonReturnType>;
    generateTicketPdf(bookingId: string, userId: string): Promise<Buffer | null>;
    getOrganizerBookings(userId: string, page: number, search: string, status: string, limit: number): Promise<BookingsReturnType>
}