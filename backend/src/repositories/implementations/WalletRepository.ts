import type { FilterQuery } from "mongoose";
import { Wallet } from "../../entities/wallet.js";
import walletModel from "../../models/walletModel.js";
import type { IWallet } from "../../utils/types/IWallet.js";
import { BaseRepository } from "./BaseRepository.js";
import type { IWalletRepository } from "../interfaces/IWalletRepository.js";

export class WalletRepository extends BaseRepository<Wallet, IWallet> implements IWalletRepository{
    constructor() {
        super(walletModel, (doc: Partial<IWallet>) => new Wallet(doc));
    }

    async findByUserId(userId: string): Promise<Wallet | null> {
        const doc = await this.model.findOne({ userId }).lean();
        return doc ? this.entityMapper(doc) : null;
    }

    async findWithQuery(query: FilterQuery<IWallet>): Promise<Wallet | null> {
        const doc = await this.model.findOne(query).sort({ createdAt: -1 }).lean();
        return doc ? this.entityMapper(doc) : null;
    }

    async findAllWithQuery(query: FilterQuery<IWallet>, offset: number, limit: number = 10): Promise<Wallet[]> {
        const docs = await this.model
            .find(query)
            .skip(offset)
            .limit(limit)
            .sort({ createdAt: -1 })
            .lean();
        return docs.map(doc => this.entityMapper(doc));
    }

    async count(query: FilterQuery<IWallet>): Promise<number> {
        return this.model.countDocuments(query);
    }
}
