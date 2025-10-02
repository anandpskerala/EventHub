import { Types, type FilterQuery } from "mongoose";
import type { IEventRepository } from "../../repositories/interfaces/IEventRepository.js";
import { HttpResponse } from "../../utils/constants/httpResponse.js";
import { HttpStatusCode } from "../../utils/constants/httpStatusCode.js";
import type { IEvent } from "../../utils/types/IEvents.js";
import type { CommonReturnType, EventReturnType, EventsReturnType } from "../../utils/types/ReturnTypes.js";
import type { IEventService } from "../interfaces/IEventService.js";
import { EventMapper } from "../../dtos/eventDto.js";
import { destroyFile, uploadFile } from "../../utils/cloudinary.js";

export class EventService implements IEventService {
    constructor(private _eventRepo: IEventRepository) { }

    async createEvent(userId: string, eventData: IEvent): Promise<EventReturnType> {
        const exists = await this._eventRepo.findByName(eventData.name);
        if (exists) {
            return {
                message: HttpResponse.EVENT_NAME_EXISTS,
                statusCode: HttpStatusCode.BAD_REQUEST
            }
        }
        eventData.userId = new Types.ObjectId(userId);
        const upload = await uploadFile(eventData.image);
        eventData.image = upload.secure_url;

        const event = await this._eventRepo.save(eventData);
        return {
            message: HttpResponse.EVENT_CREATED,
            statusCode: HttpStatusCode.CREATED,
            event: EventMapper.toDTO(event)
        }
    }

    async getEvents(page: number, search: string = "", status: string = "", category: string = "", limit: number = 10): Promise<EventsReturnType> {
        const offset = (page - 1) * limit;

        const query: FilterQuery<IEvent> = {};

        if (search.trim().length > 0) {
            query.name = { $regex: search, $options: "i" };
        }
        if (status.trim().length > 0 && status !== "all") {
            query.status = status;
        }

        if (category.trim().length > 0 && category !== "all") {
            query.category = category;
        }

        const [events, total] = await Promise.all([
            this._eventRepo.findAllWithQuery(query, offset, limit),
            this._eventRepo.count(query)
        ]);

        const pages = Math.ceil(total / limit);

        return {
            message: HttpResponse.APPLICATIONS_FETCHED,
            statusCode: HttpStatusCode.OK,
            events: EventMapper.toAdminDTOList(events),
            page,
            pages,
            total
        }
    }

    async getOrganizerEvents(userId: string, page: number, search: string = "", status: string = "", category: string = "", limit: number = 10): Promise<EventsReturnType> {
        const offset = (page - 1) * limit;

        const query: FilterQuery<IEvent> = {};

        if (search.trim().length > 0) {
            query.name = { $regex: search, $options: "i" };
        }
        if (status.trim().length > 0 && status !== "all") {
            query.status = status;
        }

        if (category.trim().length > 0 && category !== "all") {
            query.category = category;
        }
        const [events, total] = await Promise.all([
            this._eventRepo.findAllWithQuery(query, offset, limit),
            this._eventRepo.count(query)
        ]);

        const pages = Math.ceil(total / limit);

        return {
            message: HttpResponse.APPLICATIONS_FETCHED,
            statusCode: HttpStatusCode.OK,
            events: EventMapper.toAdminDTOList(events),
            page,
            pages,
            total
        }
    }

    async deleteEvent(eventId: string): Promise<CommonReturnType> {
        const event = await this._eventRepo.findById(eventId);
        if (!event) {
            return {
                message: HttpResponse.EVENT_DOESNT_EXISTS,
                statusCode: HttpStatusCode.NOT_FOUND
            }
        }

        await this._eventRepo.delete(eventId);
        return {
            message: HttpResponse.EVENT_DELETED,
            statusCode: HttpStatusCode.OK
        }
    }

    async updateEvent(eventId: string, eventData: Partial<IEvent>, image?: string): Promise<CommonReturnType> {
        const event = await this._eventRepo.findById(eventId);
        if (!event) {
            return {
                message: HttpResponse.EVENT_DOESNT_EXISTS,
                statusCode: HttpStatusCode.NOT_FOUND
            }
        }

        if (image) {
            destroyFile(event.image);
            const upload = await uploadFile(image);
            eventData.image = upload.secure_url;
        }

        await this._eventRepo.update(eventId, eventData);
        return {
            message: HttpResponse.EVENT_UPDATED,
            statusCode: HttpStatusCode.OK
        }
    }

    async getEventDetails(eventId: string): Promise<EventReturnType> {
        const event = await this._eventRepo.findById(eventId);
        if (!event) {
            return {
                message: HttpResponse.EVENT_DOESNT_EXISTS,
                statusCode: HttpStatusCode.NOT_FOUND
            }
        }

        return {
            message: "",
            statusCode: HttpStatusCode.OK,
            event: EventMapper.toAdminDTO(event)
        }
    }

    async getAllEvents(page: number, search: string = "", status: string = "", category: string = "", limit: number = 10): Promise<EventsReturnType> {
        const offset = (page - 1) * limit;

        const query: FilterQuery<IEvent> = {};

        if (search.trim().length > 0) {
            query.name = { $regex: search, $options: "i" };
        }
        if (status.trim().length > 0 && status !== "all") {
            query.status = status;
        }

        if (category.trim().length > 0 && category !== "all") {
            query.category = category;
        }

        const [events, total] = await Promise.all([
            this._eventRepo.findAllWithQuery(query, offset, limit),
            this._eventRepo.count(query)
        ]);

        const pages = Math.ceil(total / limit);

        return {
            message: HttpResponse.APPLICATIONS_FETCHED,
            statusCode: HttpStatusCode.OK,
            events: EventMapper.toDTOList(events),
            page,
            pages,
            total
        }
    }
}