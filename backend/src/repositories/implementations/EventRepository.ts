import type { FilterQuery, Types } from "mongoose";
import { Event } from "../../entities/event.js";
import { eventModel } from "../../models/eventModel.js";
import type { IEvent } from "../../utils/types/IEvents.js";
import type { IEventRepository } from "../interfaces/IEventRepository.js";
import { BaseRepository } from "./BaseRepository.js";
import type mongoose from "mongoose";

export class EventRepository extends BaseRepository<Event, IEvent> implements IEventRepository {
    constructor() {
        super(eventModel, (doc: Partial<IEvent>) =>
            new Event({
                id: doc._id?.toString(),
                name: doc.name as string,
                description: doc.description as string,
                userId: doc.userId as Types.ObjectId,
                date: doc.date as Date,
                time: doc.time as string,
                location: doc.location as string,
                category: doc.category as string,
                image: doc.image as string,
                ticketTiers: doc.ticketTiers ?? [],
                status: doc.status as "draft" | "published" | "ended",
                createdAt: doc.createdAt as Date,
                updatedAt: doc.updatedAt as Date,
            })
        );
    }

    async findByUserID(userId: string): Promise<Event | null> {
        const doc = await this.model.findOne({ userId }).lean();
        return doc ? this.entityMapper(doc) : null;
    }

    async findByName(name: string): Promise<Event | null> {
        const doc = await this.model.findOne({ name }).lean();
        return doc ? this.entityMapper(doc) : null;
    }

    async findAllWithQuery(query: FilterQuery<IEvent>, offset: number, limit: number = 10): Promise<Event[]> {
        const docs = await this.model.find(query).skip(offset).limit(limit).lean();
        return docs.map(doc => this.entityMapper(doc));
    }

    async count(query: FilterQuery<IEvent>): Promise<number> {
        const count = await this.model.countDocuments(query);
        return count;
    }

    async updateWithSession(condition: FilterQuery<IEvent>, query: FilterQuery<IEvent>, session: mongoose.mongo.ClientSession): Promise<void> {
        await this.model.updateOne(condition, query, { session });
    }
}