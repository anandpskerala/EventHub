import winston from "winston";
import morgan, { type StreamOptions } from "morgan";
import type { RequestHandler } from "express";


export const logger = winston.createLogger({
    level: "info",
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.splat(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            )
        })
    ],
});



const stream: StreamOptions = {
    write: (message) => logger.info(message.trim()),
};


export const morganMiddleware: RequestHandler = morgan(
    ":method :url :status :res[content-length] - :response-time ms [:date[iso]]",
    { stream }
);
