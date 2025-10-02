import type mongoose from "mongoose";
import type { Booking } from "../../entities/booking.js";
import type { IBooking } from "../../utils/types/IBooking.js";
import type { FilterQuery } from "mongoose";

export interface IBookingRepository {
    save(entity: Partial<IBooking>): Promise<Booking>;
    findById(id: string): Promise<Booking | null>;
    update(id: string, entity: Partial<IBooking>): Promise<Booking | null>;
    updateWithSession(condition: FilterQuery<IBooking>, query: FilterQuery<IBooking>, session: mongoose.mongo.ClientSession): Promise<void>;
    createWithSession(bookingData: Partial<IBooking>, session: mongoose.mongo.ClientSession): Promise<Booking>;
    findByOrderId(orderId: string): Promise<Booking | null>;
    findAllWithQuery(query: FilterQuery<IBooking>, offset: number, limit: number): Promise<Booking[]>;
    count(query: FilterQuery<IBooking>): Promise<number>;
}