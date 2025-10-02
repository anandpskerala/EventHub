import type { Event } from "../entities/event.js";
import type { ITicketTier } from "../utils/types/IEvents.js";

export interface EventDTO {
    id: string;
    name: string;
    description: string;
    userId: string;
    date: string;
    time: string;
    location: string;
    category: string;
    image: string;
    ticketTiers: (ITicketTier & { id: string })[];
    status: "draft" | "published" | "ended";
    createdAt: string;
    updatedAt: string;
}

export interface EventAdminDTO extends EventDTO {
    totalTickets: number;
    soldTickets: number;
    remainingTickets: number;
}

export class EventMapper {
    static toDTO(event: Event): EventDTO {
        return {
            id: event.id.toString(),
            name: event.name,
            description: event.description,
            userId: event.userId.toString(),
            date: event.date instanceof Date ? event.date.toISOString() : event.date,
            time: event.time,
            location: event.location,
            category: event.category,
            image: event.image,
            ticketTiers: event.ticketTiers.map((ticket) => ({
                ...ticket,
                id: ticket._id?.toString?.(),
            })),
            status: event.status,
            createdAt: event.createdAt.toISOString(),
            updatedAt: event.updatedAt.toISOString(),
        };
    }

    static toAdminDTO(event: Event): EventAdminDTO {
        const totalTickets = event.ticketTiers.reduce((sum, t: ITicketTier) => sum + t.quantity, 0);
        const soldTickets = event.ticketTiers.reduce((sum, t: ITicketTier) => sum + t.sold, 0);
        const remainingTickets = totalTickets - soldTickets;

        return {
            ...this.toDTO(event),
            totalTickets,
            soldTickets,
            remainingTickets,
        };
    }

    static toDTOList(events: Event[]): EventDTO[] {
        return events.map((e) => this.toDTO(e));
    }

    static toAdminDTOList(events: Event[]): EventAdminDTO[] {
        return events.map((e) => this.toAdminDTO(e));
    }
}
