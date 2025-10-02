import type { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import type { CustomRequest } from "../utils/types/CustomRequest.js";
import { HttpStatusCode } from "../utils/constants/httpStatusCode.js";
import { config } from "../config/config.js";
import { HttpResponse } from "../utils/constants/httpResponse.js";


export const protectedRoute = (req: CustomRequest, res: Response, next: NextFunction): void => {
    const token = req.cookies?.accessToken
    if (!token) {
        res.status(HttpStatusCode.UNAUTHORIZED).json({ message: HttpResponse.NOT_AUTHENTICATED });
        return;
    }

    try {
        const decoded = jwt.verify(token, config.accessTokenSecret) as { userId: string };
        req.userId = decoded.userId;
        next();
    } catch (err) {
        console.error(err)
        res.status(403).json({ message: HttpResponse.INVALID_TOKEN });
        return;
    }
};