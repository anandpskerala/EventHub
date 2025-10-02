import { Router } from "express";
import { UserRepository } from "../repositories/implementations/UserRepository.js";
import { AuthService } from "../services/implementations/authService.js";
import { AuthController } from "../controllers/authController.js";
import { protectedRoute } from "../middlewares/protectedRoute.js";

const authRoutes: Router = Router();
const userRepo = new UserRepository();
const authService = new AuthService(userRepo);
const authController = new AuthController(authService);


authRoutes.post("/signup", authController.signup.bind(authController));
authRoutes.post("/login", authController.login.bind(authController));
authRoutes.post("/verify", protectedRoute, authController.verifyUser.bind(authController));
authRoutes.post("/token/refresh", authController.refreshToken.bind(authController));
authRoutes.delete("/logout", authController.logOut.bind(authController));
authRoutes.patch("/password", protectedRoute, authController.changePassword.bind(authController));

export default authRoutes;