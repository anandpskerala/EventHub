import type { Response } from "express";
import type { IEventService } from "../services/interfaces/IEventService.js";
import type { CustomRequest } from "../utils/types/CustomRequest.js";

export class EventController {
    constructor(private _service: IEventService) { }

    public async createEvent(req: CustomRequest, res: Response): Promise<void> {
        const userId = req.userId;
        const data = req.body;
        const file = req.file;
        data.image = file?.path as string;
        data.ticketTiers = JSON.parse(req.body.ticketTiers);
        const result = await this._service.createEvent(userId as string, data);
        res.status(result.statusCode).json({ message: result.message });
    }

    public async getOrganizerEvents(req: CustomRequest, res: Response): Promise<void> {
        const userId = req.userId;
        const page = parseInt(req.query.page as string) || 1;
        const search = (req.query.search as string) || "";
        const status = (req.query.status as string) || "";
        const category = (req.query.category as string) || "";
        const limit = parseInt(req.query.limit as string) || 10;

        const result = await this._service.getOrganizerEvents(
            userId as string,
            page,
            search,
            status,
            category,
            limit
        );
        res.status(result.statusCode).json({message: result.message, events: result.events, page: Number(result.page), pages: result.pages, total: result.total});
    }

    public async deleteEvent(req: CustomRequest, res: Response): Promise<void> {
        const eventId = req.params.id;
        const result = await this._service.deleteEvent(eventId as string);
        res.status(result.statusCode).json({message: result.message});
    }

    public async editEvent(req: CustomRequest, res: Response): Promise<void> {
        const eventId = req.params.id;
        const data = req.body;
        const file = req.file;
        data.ticketTiers = JSON.parse(req.body.ticketTiers);
        const result = await this._service.updateEvent(eventId as string, data, file?.path);
        res.status(result.statusCode).json({ message: result.message });
    }

    public async getEvent(req: CustomRequest, res: Response): Promise<void> {
        const eventId = req.params.id;
        const result = await this._service.getEventDetails(eventId as string);
        res.status(result.statusCode).json({message: result.message, event: result.event});
    }

    public async getAllEvents(req: CustomRequest, res: Response): Promise<void> {
        const page = parseInt(req.query.page as string) || 1;
        const search = (req.query.search as string) || "";
        const status = (req.query.status as string) || "";
        const category = (req.query.category as string) || "";
        const limit = parseInt(req.query.limit as string) || 10;
        
        const result = await this._service.getAllEvents(page, search, status, category, limit);
        res.status(result.statusCode).json({message: result.message, events: result.events, page: Number(result.page), pages: result.pages, total: result.total});   
    }
}