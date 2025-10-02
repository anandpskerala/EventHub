import mongoose from "mongoose";
import { logger } from "../utils/logger.js";
import { config } from "./config.js";



const connectDB = async () => {
    try {
        mongoose.connection.on("connected", () => {
            logger.info("Database connected");
        })

        await mongoose.connect(config.dbUri);
    } catch (error) {
        if (error instanceof Error) {
            logger.error("MongoDB connection error: ", error.message);
        } else {
            logger.error("MongoDB connection error: ", String(error));
        }
    }
}

export default connectDB;