import { Router } from "express";
import { BookingController } from "../controllers/bookingController.js";
import { BookingService } from "../services/implementations/bookingService.js";
import { EventRepository } from "../repositories/implementations/EventRepository.js";
import { BookingRepository } from "../repositories/implementations/BookingRepository.js";
import { RPayService } from "../services/implementations/RPayService.js";
import { config } from "../config/config.js";
import { protectedRoute } from "../middlewares/protectedRoute.js";
import { WalletService } from "../services/implementations/walletService.js";
import { WalletRepository } from "../repositories/implementations/WalletRepository.js";
import { organizerRoute } from "../middlewares/organizerRoute.js";

const bookingRoutes: Router = Router();

const eventRepo = new EventRepository();
const bookingRepo = new BookingRepository();
const walletRepo = new WalletRepository();
const rpayService = new RPayService(config.rpayKey, config.rpaySecret)
const walletService = new WalletService(walletRepo);
const service = new BookingService(bookingRepo, eventRepo, rpayService, walletService);
const controller = new BookingController(service);


bookingRoutes.post("/reserve", protectedRoute, controller.reserveTicket.bind(controller));
bookingRoutes.patch("/confirm/:id", protectedRoute, controller.confirmBooking.bind(controller));
bookingRoutes.patch("/wallet/:id", protectedRoute, controller.walletPayment.bind(controller));
bookingRoutes.patch("/failed/:id", protectedRoute, controller.failedBooking.bind(controller));
bookingRoutes.get("/confirm/:id", protectedRoute, controller.findBookingDetailsWithOrderId.bind(controller));
bookingRoutes.get("/user-bookings", protectedRoute, controller.getUserBookings.bind(controller));
bookingRoutes.patch("/cancel/:id", protectedRoute, controller.cancelBooking.bind(controller));
bookingRoutes.get("/download/:id", protectedRoute, controller.downloadTicket.bind(controller));
bookingRoutes.get("/organizer/bookings", organizerRoute, controller.getOrganizerBookings.bind(controller));

export default bookingRoutes;