import type { Response } from "express";
import type { CustomRequest } from "../utils/types/CustomRequest.js";
import type { IApplicationService } from "../services/interfaces/IApplicationService.js";
import type { IOrganizerApplication } from "../utils/types/IOrganizerApplication.js";
import { HttpStatusCode } from "../utils/constants/httpStatusCode.js";
import { HttpResponse } from "../utils/constants/httpResponse.js";
import { Types } from "mongoose";

export class ApplicationController {
    constructor(private _service: IApplicationService) { }

    public async submitApplication(req: CustomRequest, res: Response): Promise<void> {
        const userId = req.userId;
        const file = req.file;
        if (!file) {
            res.status(HttpStatusCode.BAD_REQUEST).json({ message: HttpResponse.ID_PROOF_MISSING });
            return;
        }
        const data: IOrganizerApplication = req.body;
        data.identityProofPath = file?.path as string;
        data.userId = new Types.ObjectId(userId);
        const result = await this._service.createApplication(data);
        res.status(result.statusCode).json({ message: result.message });
    }

    public async getAllApplications(req: CustomRequest, res: Response): Promise<void> {
        const {search = "", limit = "", page = ""} = req.query;
        const result = await this._service.getApplications(Number(page), search as string, Number(limit));
        res.status(result.statusCode).json({message: result.message, applications: result.applications, page: Number(result.page), pages: result.pages, total: result.total})
    }

    public async changeApplicationStatus(req: CustomRequest, res: Response): Promise<void> {
        const applicationId = req.params.id;
        const userId = req.userId;
        const { status } = req.body;
        const result = await this._service.changeApplicationStatus(userId as string, applicationId as string, status);
        res.status(result.statusCode).json({message: result.message});
    }
}