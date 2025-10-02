import crypto from "crypto";
import PDFDocument from "pdfkit";
import QRCode from "qrcode";
import mongoose, { Types, type FilterQuery } from "mongoose";
import type { IBookingRepository } from "../../repositories/interfaces/IBookingRepository.js";
import type { IBooking, TicketSelection } from "../../utils/types/IBooking.js";
import type { BookingReturnType, BookingsReturnType, CommonReturnType } from "../../utils/types/ReturnTypes.js";
import type { IBookingService } from "../interfaces/IBookingService.js";
import type { IEventRepository } from "../../repositories/interfaces/IEventRepository.js";
import { HttpResponse } from "../../utils/constants/httpResponse.js";
import { HttpStatusCode } from "../../utils/constants/httpStatusCode.js";
import { BookingStatus } from "../../models/bookingModel.js";
import { BookingMapper } from "../../dtos/bookingDto.js";
import type { ITicketTier } from "../../utils/types/IEvents.js";
import { logger } from "../../utils/logger.js";
import type { IRPayService } from "../interfaces/IRPayService.js";
import { config } from "../../config/config.js";
import { EventMapper, type EventDTO } from "../../dtos/eventDto.js";
import type { Event } from "../../entities/event.js";
import type { IWalletService } from "../interfaces/IWalletService.js";

export class BookingService implements IBookingService {
    constructor(
        private _bookingRepo: IBookingRepository,
        private _eventRepo: IEventRepository,
        private _rPay: IRPayService,
        private _walletService: IWalletService
    ) { }

    async reserveBooking(userId: string, eventId: string, tickets: TicketSelection[], paymentMethod: string): Promise<BookingReturnType> {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const event = await this._eventRepo.findById(eventId);
            if (!event) {
                return {
                    message: HttpResponse.EVENT_DOESNT_EXISTS,
                    statusCode: HttpStatusCode.NOT_FOUND,
                };
            }

            const tierMap = new Map<string, ITicketTier>();
            event.ticketTiers.forEach((t) => tierMap.set(String(t._id), t));

            for (const t of tickets) {
                const tier = tierMap.get(String(t.tierId));
                if (!tier) {
                    return {
                        message: `Ticket tier ${t.tierId} not found`,
                        statusCode: HttpStatusCode.NOT_FOUND,
                    };
                }
                const available = tier.quantity - (tier.sold || 0);
                if (t.quantity > available) {
                    return {
                        message: `Not enough tickets in tier ${tier.name} — available ${available}`,
                        statusCode: HttpStatusCode.BAD_REQUEST,
                    };
                }
            }

            for (const t of tickets) {
                await this._eventRepo.updateWithSession(
                    { _id: eventId, "ticketTiers._id": t.tierId },
                    { $inc: { "ticketTiers.$.sold": t.quantity } },
                    session
                );
            }

            const ticketsSnapshot = tickets.map((t) => {
                const tier = tierMap.get(String(t.tierId));
                return {
                    tierId: new Types.ObjectId(t.tierId),
                    quantity: t.quantity,
                    price: tier?.price as number,
                };
            });

            const totalAmount = ticketsSnapshot.reduce(
                (s, it) => s + it.price * it.quantity,
                0
            );

            const lockedUntil = new Date(Date.now() + 15 * 60 * 1000);

            let booking;
            if (paymentMethod === "razorpay") {
                const order = await this._rPay.createOrder(totalAmount);
                booking = await this._bookingRepo.createWithSession(
                    {
                        userId: new Types.ObjectId(userId),
                        eventId: new Types.ObjectId(eventId),
                        tickets: ticketsSnapshot,
                        totalAmount,
                        status: BookingStatus.PENDING,
                        paymentMethod,
                        orderId: order.id,
                        lockedUntil,
                    },
                    session
                );
            } else {
                booking = await this._bookingRepo.createWithSession(
                    {
                        userId: new Types.ObjectId(userId),
                        eventId: new Types.ObjectId(eventId),
                        tickets: ticketsSnapshot,
                        totalAmount,
                        status: BookingStatus.PENDING,
                        paymentMethod,
                        lockedUntil,
                    },
                    session
                );
            }

            await session.commitTransaction();
            session.endSession();

            return {
                message: HttpResponse.BOOKING_INITIATED,
                statusCode: HttpStatusCode.CREATED,
                booking: BookingMapper.toDTO(booking),
            };
        } catch (error) {
            logger.error(error);
            await session.abortTransaction();
            session.endSession();
            return {
                message: HttpResponse.INTERNAL_SERVER_ERROR,
                statusCode: HttpStatusCode.INTERNAL_SERVER_ERROR,
            };
        }
    }

    async confirmBooking(bookingId: string, razorpay_order_id: string, razorpay_payment_id: string, razorpay_signature: string): Promise<BookingReturnType> {
        const body = `${razorpay_order_id}|${razorpay_payment_id}`;
        const expectedSignature = crypto
            .createHmac('sha256', config.rpaySecret as string)
            .update(body.toString())
            .digest('hex');

        if (expectedSignature === razorpay_signature) {
            await this._bookingRepo.update(bookingId, {
                status: BookingStatus.CONFIRMED
            });
            return {
                message: HttpResponse.PAYMENT_SUCCESS,
                statusCode: HttpStatusCode.OK
            };
        } else {
            return {
                message: HttpResponse.PAYMENT_FAILED,
                statusCode: HttpStatusCode.BAD_REQUEST
            };
        }
    }

    async confirmBookingWithWallet(bookingId: string): Promise<BookingReturnType> {
        const booking = await this._bookingRepo.findById(bookingId);
        if (!booking) {
            return {
                message: HttpResponse.BOOKING_NOT_FOUND,
                statusCode: HttpStatusCode.NOT_FOUND
            };
        }

        const walletResult = await this._walletService.deductFunds(booking.userId, booking.totalAmount);
        if (!walletResult.wallet) {
            return { message: walletResult.message, statusCode: walletResult.statusCode };
        }

        await this._bookingRepo.update(bookingId, {
            status: BookingStatus.CONFIRMED
        });
        return {
            message: HttpResponse.PAYMENT_SUCCESS,
            statusCode: HttpStatusCode.OK
        };
    }

    async failedBooking(bookingId: string): Promise<BookingReturnType> {
        const booking = await this._bookingRepo.findById(bookingId);
        if (!booking) {
            return {
                message: HttpResponse.BOOKING_NOT_FOUND,
                statusCode: HttpStatusCode.NOT_FOUND
            };
        }
        await this._bookingRepo.update(bookingId, {
            status: BookingStatus.FAILED
        });
        return {
            message: HttpResponse.BOOKING_FAILED,
            statusCode: HttpStatusCode.BAD_REQUEST
        };
    }

    async releaseBookings(bookingId: string, reason: string = "EXPIRED"): Promise<void> {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            const booking = await this._bookingRepo.findById(bookingId);
            if (!booking) throw new Error("Booking not found");

            if (![BookingStatus.PENDING].includes(booking.status)) {
                await session.commitTransaction();
                return;
            }

            for (const t of booking.tickets) {
                await this._eventRepo.updateWithSession(
                    { _id: booking.eventId, "ticketTiers._id": t.tierId },
                    { $inc: { "ticketTiers.$.sold": -t.quantity } },
                    session
                );
            }

            await this._bookingRepo.updateWithSession(
                { _id: booking.id },
                { $set: { status: reason === "CANCELLED" ? BookingStatus.CANCELLED : BookingStatus.EXPIRED } },
                session
            );
            await session.commitTransaction();
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    }

    async findBookingDetailsWithOrderId(orderId: string): Promise<BookingReturnType> {
        const booking = await this._bookingRepo.findByOrderId(orderId);
        if (!booking) {
            return {
                message: HttpResponse.BOOKING_NOT_FOUND,
                statusCode: HttpStatusCode.NOT_FOUND
            };
        }

        return {
            message: "",
            statusCode: HttpStatusCode.OK,
            booking: BookingMapper.toDTO(booking)
        };
    }

    async findUserBookings(userId: string, page: number, search: string = "", limit: number = 10): Promise<BookingsReturnType & { events?: EventDTO[] }> {
        const offset = (page - 1) * limit;

        const query = search.trim().length > 0 ? {
            $or: [
                { fullName: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
                { organization: { $regex: search, $options: "i" } }
            ],
            userId
        } : { userId };
        const [bookings, total] = await Promise.all([
            this._bookingRepo.findAllWithQuery(query, offset, limit),
            this._bookingRepo.count(query)
        ]);

        const eventIds = [...new Set(bookings.map(b => b.eventId?.toString()))];
        let events: Event[] = [];
        if (eventIds.length > 0) {
            const eventDocs = await this._eventRepo.findAllWithQuery({
                _id: { $in: eventIds }
            }, 0, limit);
            events = eventDocs;
        }

        const pages = Math.ceil(total / limit);

        return {
            message: HttpResponse.APPLICATIONS_FETCHED,
            statusCode: HttpStatusCode.OK,
            bookings: BookingMapper.toDTOList(bookings),
            events: EventMapper.toDTOList(events),
            page,
            pages,
            total
        };
    }

    async cancelBooking(bookingId: string): Promise<CommonReturnType> {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            const booking = await this._bookingRepo.findById(bookingId);
            if (!booking) {
                return {
                    message: HttpResponse.BOOKING_NOT_FOUND,
                    statusCode: HttpStatusCode.NOT_FOUND
                };
            }

            if (![BookingStatus.PENDING, BookingStatus.CONFIRMED].includes(booking.status)) {
                return {
                    message: "Booking cannot be cancelled",
                    statusCode: HttpStatusCode.BAD_REQUEST
                };
            }

            for (const t of booking.tickets) {
                await this._eventRepo.updateWithSession(
                    { _id: booking.eventId, "ticketTiers._id": t.tierId },
                    { $inc: { "ticketTiers.$.sold": -t.quantity } },
                    session
                );
            }

            await this._bookingRepo.updateWithSession(
                { _id: booking.id },
                { $set: { status: BookingStatus.CANCELLED } },
                session
            );

            await this._walletService.addFunds(booking.userId, booking.totalAmount);

            await session.commitTransaction();
            return {
                message: HttpResponse.BOOKING_CANCELLED,
                statusCode: HttpStatusCode.OK
            };
        } catch (error) {
            logger.error(error);
            await session.abortTransaction();
            return {
                message: HttpResponse.INTERNAL_SERVER_ERROR,
                statusCode: HttpStatusCode.INTERNAL_SERVER_ERROR
            };
        } finally {
            session.endSession();
        }
    }

    async generateTicketPdf(bookingId: string, userId: string): Promise<Buffer | null> {
        const booking = await this._bookingRepo.findById(bookingId);
        if (!booking || booking.userId.toString() !== userId) return null;

        if (booking.status !== BookingStatus.CONFIRMED) return null;

        const event = await this._eventRepo.findById(booking.eventId);
        if (!event) return null;

        const qrData = await QRCode.toDataURL(bookingId);

        const doc = new PDFDocument({ margin: 50 });
        const buffers: Buffer[] = [];

        doc.on("data", (chunk) => buffers.push(chunk));

        return new Promise<Buffer>((resolve) => {
            doc.on("end", () => {
                resolve(Buffer.concat(buffers));
            });

            doc.fontSize(20).text("🎟 Event Ticket", { align: "center" });
            doc.moveDown();

            doc.fontSize(14).text(`Event: ${event.name}`);
            doc.text(`Date: ${event.date.toDateString()}`);
            doc.text(`Venue: ${event.location}`);
            doc.moveDown();

            doc.text(`Booking ID: ${booking.id}`);
            doc.text(`Total Amount: ₹${booking.totalAmount}`);
            doc.text(`Payment Method: ${booking.paymentMethod}`);
            doc.moveDown();

            const qrImage = qrData.replace(/^data:image\/png;base64,/, "");
            doc.image(Buffer.from(qrImage, "base64"), {
                fit: [150, 150],
                align: "center",
                valign: "center",
            });
            doc.end();
        });
    }

    async getOrganizerBookings(userId: string, page: number, search: string = "", status: string = "", limit: number = 10): Promise<BookingsReturnType & { events?: EventDTO[] }> {
        const offset = (page - 1) * limit;

        const eventQuery: Record<string, any> = { userId };

        if (search.trim().length > 0) {
            eventQuery.name = { $regex: search.trim(), $options: "i" };
        }
        const [events, _eventCount] = await Promise.all([
            this._eventRepo.findAllWithQuery(eventQuery, offset, limit),
            this._eventRepo.count(eventQuery)
        ]);

        const eventIds = events.map(event => event.id);

        const bookingQuery: FilterQuery<IBooking> = {
            eventId: { $in: eventIds }
        };
        if (status && status !== "all") {
            bookingQuery.status = status;
        }
        if (search.trim().length > 0) {
            bookingQuery.orderId = { $regex: search, $options: "i" };
        }

        const [bookings, total] = await Promise.all([
            this._bookingRepo.findAllWithQuery(bookingQuery, offset, limit),
            this._bookingRepo.count(bookingQuery)
        ]);

        const pages = Math.ceil(total / limit);

        return {
            message: HttpResponse.APPLICATIONS_FETCHED,
            statusCode: HttpStatusCode.OK,
            bookings: BookingMapper.toAdminDTOList(bookings),
            events: EventMapper.toDTOList(events),
            page,
            pages,
            total
        };
    }
}