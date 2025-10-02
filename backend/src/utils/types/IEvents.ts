import type { Document, Types } from "mongoose";

export interface ITicketTier {
    _id: string;
    name: string;
    price: number;
    quantity: number;
    sold: number;
    description?: string;
}

export interface IEvent extends Document {
    name: string;
    description: string;
    userId: Types.ObjectId;
    date: Date;
    time: string;
    location: string;
    category: string;
    image: string;
    ticketTiers: ITicketTier[];
    status: "draft" | "published" | "ended";
    createdAt: Date;
    updatedAt: Date;
}