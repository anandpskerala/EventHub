import type { Response } from "express";
import type { IProfileService } from "../services/interfaces/IProfileService.js";
import type { CustomRequest } from "../utils/types/CustomRequest.js";

export class ProfileController {
    constructor(private _service: IProfileService) {}

    public async changeUserInfo(req: CustomRequest, res: Response): Promise<void> {
        const userId = req.userId;
        const { firstName, lastName } = req.body;
        const result = await this._service.changeUserInfo(userId as string, {firstName, lastName});
        res.status(result.statusCode).json({message: result.message, user: result.user});
    }

    public async getUserDetails(req: CustomRequest, res: Response): Promise<void> {
        const userId = req.params.id;
        const result = await this._service.getUserDetails(userId as string);
        res.status(result.statusCode).json({message: result.message, user: result.user});
    }
}