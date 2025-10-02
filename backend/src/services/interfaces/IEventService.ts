import type { IEvent } from "../../utils/types/IEvents.js";
import type { CommonReturnType, EventReturnType, EventsReturnType } from "../../utils/types/ReturnTypes.js";

export interface IEventService {
    createEvent(userId: string, eventData: IEvent): Promise<EventReturnType>;
    getEvents(page: number, search: string, status: string, category: string, limit: number): Promise<EventsReturnType>;
    getOrganizerEvents(userId: string, page: number, search: string, status: string, category: string, limit: number): Promise<EventsReturnType>;
    deleteEvent(eventId: string): Promise<CommonReturnType>;
    updateEvent(eventId: string, eventData: Partial<IEvent>, image?: string): Promise<CommonReturnType>;
    getEventDetails(eventId: string): Promise<EventReturnType>;
    getAllEvents(page: number, search: string, status: string, category: string, limit: number): Promise<EventsReturnType>;
}