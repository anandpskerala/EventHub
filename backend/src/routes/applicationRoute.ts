import { Router } from "express";
import { protectedRoute } from "../middlewares/protectedRoute.js";
import { ApplicationRepository } from "../repositories/implementations/ApplicationRepository.js";
import { ApplicationService } from "../services/implementations/applicationService.js";
import { ApplicationController } from "../controllers/applicationController.js";
import { upload } from "../middlewares/multer.js";
import { adminRoute } from "../middlewares/adminRoute.js";
import { UserRepository } from "../repositories/implementations/UserRepository.js";

const applicationRepo = new ApplicationRepository();
const userRepo = new UserRepository();
const service = new ApplicationService(applicationRepo, userRepo);
const controller = new ApplicationController(service);

const applicationRoutes: Router = Router();

applicationRoutes.post("/submit", protectedRoute, upload.single("identityProof"), controller.submitApplication.bind(controller));
applicationRoutes.get("/admin/applications", adminRoute, controller.getAllApplications.bind(controller));
applicationRoutes.patch("/admin/status/:id", adminRoute, controller.changeApplicationStatus.bind(controller));

export default applicationRoutes;