import type { BookingDTO } from "../entities/BookingDTO";
import type { EventDTO } from "../entities/EventDTO";
import type { User } from "../entities/User";

export interface BookingDetailsModalProps {
    booking: BookingDTO | null;
    event: EventDTO | null;
    user: User | null;
    onClose: () => void;
}