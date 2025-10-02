import type { FilterQuery } from "mongoose";
import type { Event } from "../../entities/event.js";
import type { IEvent } from "../../utils/types/IEvents.js";
import type mongoose from "mongoose";

export interface IEventRepository {
    findByUserID(userID: string): Promise<Event | null>;
    save(entity: Partial<IEvent>): Promise<Event>;
    findById(id: string): Promise<Event | null>;
    update(id: string, entity: Partial<IEvent>): Promise<Event | null>;
    findByName(name: string): Promise<Event | null>;
    findAllWithQuery(query: FilterQuery<IEvent>, offset: number, limit: number): Promise<Event[]>;
    count(query: FilterQuery<IEvent>): Promise<number>;
    delete(id: string): Promise<boolean>;
    updateWithSession(condition: FilterQuery<IEvent>, query: FilterQuery<IEvent>, session: mongoose.mongo.ClientSession): Promise<void>;
}