import jwt from "jsonwebtoken";
import type { NextFunction, Response } from "express";
import { HttpResponse } from "../utils/constants/httpResponse.js";
import { HttpStatusCode } from "../utils/constants/httpStatusCode.js";
import { config } from "../config/config.js";
import type { CustomRequest } from "../utils/types/CustomRequest.js";

export const organizerRoute = async (req: CustomRequest, res: Response, next: NextFunction) => {
    const token = req.cookies?.accessToken
    if (!token) {
        res.status(HttpStatusCode.UNAUTHORIZED).json({ message: HttpResponse.NOT_AUTHENTICATED });
        return;
    }

    try {
        const decoded = jwt.verify(token, config.accessTokenSecret) as { userId: string, roles: string[] };
        req.userId = decoded.userId;
        if (!decoded.roles?.includes("organizer")) {
            res.status(HttpStatusCode.UNAUTHORIZED).json({ message: HttpResponse.NEED_ORGANIZER_ACCESS });
            return;
        }
        next();
    } catch (err) {
        console.error(err)
        res.status(HttpStatusCode.FORBIDDEN).json({ message: HttpResponse.INVALID_TOKEN });
        return;
    }
} 