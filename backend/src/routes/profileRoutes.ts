import { Router } from "express";
import { UserRepository } from "../repositories/implementations/UserRepository.js";
import { ProfileService } from "../services/implementations/profileService.js";
import { ProfileController } from "../controllers/profileController.js";
import { protectedRoute } from "../middlewares/protectedRoute.js";
import { organizerRoute } from "../middlewares/organizerRoute.js";

const userRepo = new UserRepository();
const service = new ProfileService(userRepo);
const controller = new ProfileController(service);

const profileRoutes: Router = Router();

profileRoutes.patch("/profile", protectedRoute, controller.changeUserInfo.bind(controller));
profileRoutes.get("/:id", organizerRoute, controller.getUserDetails.bind(controller));

export default profileRoutes;