import type { NextFunction, Request, Response } from "express";
import { HttpStatusCode } from "../utils/constants/httpStatusCode.js";
import { logger } from "../utils/logger.js";
import type { AppError } from "../utils/types/AppError.js";
import { HttpResponse } from "../utils/constants/httpResponse.js";


export const errorHandler = (err: AppError, req: Request, res: Response, _next: NextFunction) => {
    err.statusCode = err.statusCode || HttpStatusCode.INTERNAL_SERVER_ERROR;
    err.status = err.status || HttpResponse.INTERNAL_SERVER_ERROR;

    logger.error(err.stack);
    res.status(err.statusCode).json({
        status: err.status,
        message: err.message
    });
}