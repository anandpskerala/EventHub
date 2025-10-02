export interface BookingTicketDTO {
    id: string;
    tierId: string;
    quantity: number;
    price: number;
}

export interface BookingDTO {
    totalTickets: number;
    id: string;
    userId: string;
    eventId: string;
    tickets: BookingTicketDTO[];
    orderId: string;
    totalAmount: number;
    status: 'confirmed' | 'pending' | 'failed' | 'cancelled' | 'expired' | 'refunded';
    lockedUntil: string;
    paymentMethod: string;
    createdAt: string;
    updatedAt: string;
    failureReason?: string;
}

export interface EventDetails {
    name: string;
    date: string;
    venue: string;
    image?: string;
}

export interface TicketTierDetails {
    [key: string]: {
        name: string;
        description: string;
    };
}