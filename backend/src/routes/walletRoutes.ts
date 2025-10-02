import type { Router } from "express";
import express from "express";
import { WalletRepository } from "../repositories/implementations/WalletRepository.js";
import { WalletService } from "../services/implementations/walletService.js";
import { WalletController } from "../controllers/walletController.js";
import { protectedRoute } from "../middlewares/protectedRoute.js";

const walletRoutes: Router = express.Router();

const walletRepository = new WalletRepository();
const walletService = new WalletService(walletRepository);
const walletController = new WalletController(walletService);

walletRoutes.get("/:userId", protectedRoute, walletController.getWallet.bind(walletController));
walletRoutes.post("/", protectedRoute, walletController.createWallet.bind(walletController));
walletRoutes.patch("/:userId/add",  protectedRoute, walletController.addFunds.bind(walletController));
walletRoutes.patch("/:userId/deduct",  protectedRoute, walletController.deductFunds.bind(walletController));

export default walletRoutes;