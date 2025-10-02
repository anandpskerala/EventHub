import { Router } from "express";
import { EventRepository } from "../repositories/implementations/EventRepository.js";
import { EventService } from "../services/implementations/eventService.js";
import { EventController } from "../controllers/eventController.js";
import { organizerRoute } from "../middlewares/organizerRoute.js";
import { upload } from "../middlewares/multer.js";
import { protectedRoute } from "../middlewares/protectedRoute.js";

const eventRoutes: Router = Router();

const eventRepo = new EventRepository();
const service = new EventService(eventRepo);
const controller = new EventController(service);

eventRoutes.post("/create", organizerRoute, upload.single("image"), controller.createEvent.bind(controller));
eventRoutes.get("/organizer/events", organizerRoute, controller.getOrganizerEvents.bind(controller));
eventRoutes.delete("/organizer/:id", organizerRoute, controller.deleteEvent.bind(controller));
eventRoutes.patch("/organizer/:id", organizerRoute, upload.single("image"), controller.editEvent.bind(controller));
eventRoutes.get("/organizer/:id", protectedRoute, controller.getEvent.bind(controller));
eventRoutes.get("/all", protectedRoute, controller.getAllEvents.bind(controller));


export default eventRoutes;