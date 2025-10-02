import type { FilterQuery, Types } from "mongoose";
import { Booking } from "../../entities/booking.js";
import bookingModel from "../../models/bookingModel.js";
import type { IBooking } from "../../utils/types/IBooking.js";
import type { IBookingRepository } from "../interfaces/IBookingRepository.js";
import { BaseRepository } from "./BaseRepository.js";
import type mongoose from "mongoose";

export class BookingRepository extends BaseRepository<Booking, IBooking> implements IBookingRepository {
    constructor() {
        super(bookingModel, (doc: Partial<IBooking>) => new Booking({
            _id: doc._id?.toString() ?? "",
            userId: doc.userId as Types.ObjectId,
            eventId: doc.eventId as Types.ObjectId,
            tickets: doc.tickets ?? [],
            totalAmount: doc.totalAmount ?? 0,
            status: doc.status ?? "",
            lockedUntil: doc.lockedUntil ?? new Date(),
            paymentMethod: doc.paymentMethod as string,
            orderId: doc.orderId as string,
            createdAt: doc.createdAt ?? new Date(),
            updatedAt: doc.updatedAt ?? new Date(),
        }))
    }

    async updateWithSession(condition: FilterQuery<IBooking>, query: FilterQuery<IBooking>, session: mongoose.mongo.ClientSession): Promise<void> {
        await this.model.updateOne(condition, query, { session });
    }

    async createWithSession(bookingData: Partial<IBooking>, session: mongoose.mongo.ClientSession): Promise<Booking> {
        const doc = await this.model.create([bookingData], { session });
        return this.entityMapper(doc[0] as Partial<IBooking>);
    }

    async findByOrderId(orderId: string): Promise<Booking | null> {
        const doc = await this.model.findOne({ orderId }).lean();
        return doc ? this.entityMapper(doc as IBooking) : null;
    }

    async findAllWithQuery(query: FilterQuery<IBooking>, offset: number, limit: number = 10): Promise<Booking[]> {
        const docs = await this.model.find(query).skip(offset).limit(limit).sort({createdAt: -1}).lean();
        return docs.map(doc => this.entityMapper(doc as IBooking));
    }

    async count(query: FilterQuery<IBooking>): Promise<number> {
        const count = await this.model.countDocuments(query);
        return count;
    }
}