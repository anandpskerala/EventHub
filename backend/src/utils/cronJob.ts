import cron from "node-cron";
import { config } from "../config/config.js";
import { BookingStatus } from "../models/bookingModel.js";
import { BookingRepository } from "../repositories/implementations/BookingRepository.js";
import { EventRepository } from "../repositories/implementations/EventRepository.js";
import { BookingService } from "../services/implementations/bookingService.js";
import { RPayService } from "../services/implementations/RPayService.js";
import { logger } from "./logger.js";
import { WalletRepository } from "../repositories/implementations/WalletRepository.js";
import { WalletService } from "../services/implementations/walletService.js";


export async function releaseExpiredBookings() {
    const eventRepo = new EventRepository();
    const bookingRepo = new BookingRepository();
    const walletRepo = new WalletRepository();
    const rpayService = new RPayService(config.rpayKey, config.rpaySecret)
    const walletService = new WalletService(walletRepo);
    const service = new BookingService(bookingRepo, eventRepo, rpayService, walletService);

    const now = new Date();
    const expired = await bookingRepo.findAll({
        status: BookingStatus.PENDING,
        lockedUntil: { $lt: now },
    })

    const results = [];
    for (const b of expired) {
        try {
            await service.releaseBookings(b.id, "EXPIRED");
            results.push({ id: b.id, released: true });
        } catch (err) {
            results.push({ id: b.id, released: false, error: err });
        }
    }
    return results;
}


export function startReleaseJob() {
    cron.schedule("* * * * *", async () => {
        try {
            const results = await releaseExpiredBookings();
            if (results.length > 0) {
                logger.info("releaseExpiredBookings:", results);
            }
        } catch (err) {
            logger.error("Error releasing expired bookings:", err);
        }
    });
}
