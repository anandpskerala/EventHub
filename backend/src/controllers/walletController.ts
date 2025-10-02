import type { Request, Response } from "express";
import type { IWalletService } from "../services/interfaces/IWalletService.js";

export class WalletController {
    constructor(private readonly _walletService: IWalletService) {}

    async getWallet(req: Request, res: Response): Promise<void> {
        const userId = req.params.userId;
        const result = await this._walletService.getWallet(userId as string);
        res.status(result.statusCode).json(result);
    }

    async createWallet(req: Request, res: Response): Promise<void> {
        const walletData = req.body;
        const result = await this._walletService.createWallet(walletData);
        res.status(result.statusCode).json(result);
    }

    async addFunds(req: Request, res: Response): Promise<void> {
        const userId = req.params.userId;
        const amount = Number(req.body.amount);

        const result = await this._walletService.addFunds(userId as string, amount);
        res.status(result.statusCode).json(result);
    }

    async deductFunds(req: Request, res: Response): Promise<void> {
        const userId = req.params.userId;
        const amount = Number(req.body.amount);

        const result = await this._walletService.deductFunds(userId as string, amount);
        res.status(result.statusCode).json(result);
    }
}
