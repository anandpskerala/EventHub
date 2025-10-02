import type { TicketTier } from "../formdata/ticketTier";

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
    ticketTiers: TicketTier[];
    status: "draft" | "published" | "ended";
    createdAt: string;
    updatedAt: string;
    totalTickets: number;
    soldTickets: number;
    remainingTickets: number;
}