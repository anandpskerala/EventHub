import type { IEvent, ITicketTier } from "../utils/types/IEvents.js";


export class Event {
    readonly id: string;
    name: string;
    description: string;
    userId: string;
    date: Date;
    time: string;
    location: string;
    category: string;
    image: string;
    ticketTiers: ITicketTier[];
    status: "draft" | "published" | "ended";
    createdAt: Date;
    updatedAt: Date;

    constructor(props: Partial<IEvent>) {
        this.id = props.id?.toString() as string;
        this.name = props.name ?? "";
        this.description = props.description ?? "";
        this.userId = props.userId?.toString() ?? "";
        this.date = props.date ?? new Date();
        this.time = props.time ?? "";
        this.location = props.location ?? "";
        this.category = props.category ?? "";
        this.image = props.image ?? "";
        this.ticketTiers = props.ticketTiers ?? [];
        this.status = props.status ?? "draft";
        this.createdAt = props.createdAt ?? new Date();
        this.updatedAt = props.updatedAt ?? new Date();
    }
}
