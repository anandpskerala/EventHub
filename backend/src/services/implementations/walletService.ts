import type { IWalletRepository } from "../../repositories/interfaces/IWalletRepository.js";
import { HttpResponse } from "../../utils/constants/httpResponse.js";
import { HttpStatusCode } from "../../utils/constants/httpStatusCode.js";
import type { IWalletService } from "../interfaces/IWalletService.js";
import type { IWallet } from "../../utils/types/IWallet.js";
import type { WalletReturnType } from "../../utils/types/ReturnTypes.js";
import { WalletMapper } from "../../dtos/walletDto.js";

export class WalletService implements IWalletService {
    constructor(private _repo: IWalletRepository) {}

    async getWallet(userId: string): Promise<WalletReturnType> {
        const wallet = await this._repo.findByUserId(userId);
        if (!wallet) {
            return {
                message: HttpResponse.WALLET_NOT_FOUND,
                statusCode: HttpStatusCode.NOT_FOUND
            };
        }
        return {
            message: HttpResponse.WALLET_FETCHED,
            statusCode: HttpStatusCode.OK,
            wallet: WalletMapper.toDTO(wallet)
        };
    }

    async createWallet(walletData: Partial<IWallet>): Promise<WalletReturnType> {
        if (!walletData.userId) {
            return {
                message: HttpResponse.USER_ID_MISSING,
                statusCode: HttpStatusCode.BAD_REQUEST
            };
        }

        const existingWallet = await this._repo.findByUserId(walletData.userId.toString());
        if (existingWallet) {
            return {
                message: HttpResponse.WALLET_ALREADY_EXISTS,
                statusCode: HttpStatusCode.CONFLICT
            };
        }

        const wallet = await this._repo.save(walletData);
        return {
            message: HttpResponse.WALLET_CREATED,
            statusCode: HttpStatusCode.CREATED,
            wallet: WalletMapper.toDTO(wallet)
        };
    }

    async addFunds(userId: string, amount: number): Promise<WalletReturnType> {
        if (amount <= 0) {
            return {
                message: HttpResponse.INVALID_AMOUNT,
                statusCode: HttpStatusCode.BAD_REQUEST
            };
        }

        const wallet = await this._repo.findByUserId(userId);
        if (!wallet) {
            return {
                message: HttpResponse.WALLET_NOT_FOUND,
                statusCode: HttpStatusCode.NOT_FOUND
            };
        }

        const updatedWallet = await this._repo.update(wallet.id, {
            balance: wallet.balance + amount,
            updatedAt: new Date()
        });

        return {
            message: HttpResponse.FUNDS_ADDED,
            statusCode: HttpStatusCode.OK,
            wallet: updatedWallet ? WalletMapper.toDTO(updatedWallet) : undefined
        };
    }

    async deductFunds(userId: string, amount: number): Promise<WalletReturnType> {
        if (amount <= 0) {
            return {
                message: HttpResponse.INVALID_AMOUNT,
                statusCode: HttpStatusCode.BAD_REQUEST
            };
        }

        const wallet = await this._repo.findByUserId(userId);
        if (!wallet) {
            return {
                message: HttpResponse.WALLET_NOT_FOUND,
                statusCode: HttpStatusCode.NOT_FOUND
            };
        }

        if (wallet.balance < amount) {
            return {
                message: HttpResponse.INSUFFICIENT_FUNDS,
                statusCode: HttpStatusCode.BAD_REQUEST
            };
        }

        const updatedWallet = await this._repo.update(wallet.id, {
            balance: wallet.balance - amount,
            updatedAt: new Date()
        });

        return {
            message: HttpResponse.FUNDS_DEDUCTED,
            statusCode: HttpStatusCode.OK,
            wallet: updatedWallet ? WalletMapper.toDTO(updatedWallet) : undefined
        };
    }
}
