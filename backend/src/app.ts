import express, { type Application } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { logger, morganMiddleware } from "./utils/logger.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import { config } from "./config/config.js";
import profileRoutes from "./routes/profileRoutes.js";
import applicationRoutes from "./routes/applicationRoute.js";
import eventRoutes from "./routes/eventRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import walletRoutes from "./routes/walletRoutes.js";


export class App {
    private _app: Application;

    constructor() {
        this._app = express();
        this._setupMiddlewares();
        this._setupRotes();
        this._app.use(errorHandler);
    }

    private _setupMiddlewares() {
        this._app.use(express.json());
        this._app.use(express.urlencoded({ extended: true }));
        this._app.use(morganMiddleware);
        this._app.use(cors({
            origin: config.frontendUrl,
            credentials: true
        }));
        this._app.use(cookieParser());
    }

    private _setupRotes() {
        this._app.use("/api/auth", authRoutes);
        this._app.use("/api/user", profileRoutes);
        this._app.use("/api/application", applicationRoutes);
        this._app.use("/api/event", eventRoutes);
        this._app.use("/api/booking", bookingRoutes);
        this._app.use("/api/wallet", walletRoutes);
    }

    public async listen(port: number) {
        connectDB();
        this._app.listen(port, () => {
            logger.info(`Admin service started on port ${port}`);
        })
    }
}