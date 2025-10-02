import type { Response } from "express";
import type { IBookingService } from "../services/interfaces/IBookingService.js";
import type { CustomRequest } from "../utils/types/CustomRequest.js";
import { HttpStatusCode } from "../utils/constants/httpStatusCode.js";

export class BookingController {
    constructor(private _service: IBookingService) { }

    async reserveTicket(req: CustomRequest, res: Response): Promise<void> {
        const userId = req.userId;
        const { eventId, tickets, paymentMethod } = req.body;
        const result = await this._service.reserveBooking(
            userId as string,
            eventId,
            tickets,
            paymentMethod
        )
        res.status(result.statusCode).json({ message: result.message, booking: result.booking });
    }

    async confirmBooking(req: CustomRequest, res: Response): Promise<void> {
        const bookingId = req.params.id;
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
        const result = await this._service.confirmBooking(bookingId as string, razorpay_order_id, razorpay_payment_id, razorpay_signature);
        res.status(result.statusCode).json({ message: result.message, booking: result.booking });
    }

    async failedBooking(req: CustomRequest, res: Response): Promise<void> {
        const bookingId = req.params.id;
        const result = await this._service.failedBooking(bookingId as string);
        res.status(result.statusCode).json({ message: result.message });
    }

    async findBookingDetailsWithOrderId(req: CustomRequest, res: Response): Promise<void> {
        const orderId = req.params.id;
        const result = await this._service.findBookingDetailsWithOrderId(orderId as string);
        res.status(result.statusCode).json({ message: result.message, booking: result.booking });
    }

    async getUserBookings(req: CustomRequest, res: Response): Promise<void> {
        const userId = req.userId as string;
        const { search = "", limit = "", page = "" } = req.query;
        const result = await this._service.findUserBookings(userId, Number(page), search as string, Number(limit));
        res.status(result.statusCode).json({ message: result.message, bookings: result.bookings, events: result.events, page: Number(result.page), pages: result.pages, total: result.total })

    }

    async cancelBooking(req: CustomRequest, res: Response): Promise<void> {
        const bookingId = req.params.id;
        const result = await this._service.cancelBooking(bookingId as string);
        res.status(result.statusCode).json({ message: result.message });
    }

    async walletPayment(req: CustomRequest, res: Response) {
        const bookingId = req.params.id;
        const result = await this._service.confirmBookingWithWallet(bookingId as string);
        res.status(result.statusCode).json(result);
    }

    async downloadTicket(req: CustomRequest, res: Response): Promise<void> {
        const bookingId = req.params.id;
        const userId = req.userId as string;

        const pdfBuffer = await this._service.generateTicketPdf(bookingId as string, userId);

        if (!pdfBuffer) {
            res.status(HttpStatusCode.NOT_FOUND).json({ message: "Ticket not found or not available" });
            return;
        }

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename="ticket-${bookingId}.pdf"`);
        res.send(pdfBuffer);
    }

     public async getOrganizerBookings(req: CustomRequest, res: Response): Promise<void> {
        const userId = req.userId;
        const page = parseInt(req.query.page as string) || 1;
        const search = (req.query.search as string) || "";
        const status = (req.query.status as string) || "";
        const limit = parseInt(req.query.limit as string) || 10;

        const result = await this._service.getOrganizerBookings(
            userId as string,
            page,
            search,
            status,
            limit
        );
        res.status(result.statusCode).json({message: result.message, bookings: result.bookings, page: Number(result.page), pages: result.pages, total: result.total});
    }
}