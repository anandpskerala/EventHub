import type { FilterQuery } from "mongoose";
import type { Wallet } from "../../entities/wallet.js";
import type { IWallet } from "../../utils/types/IWallet.js";

export interface IWalletRepository {
    findByUserId(userId: string): Promise<Wallet | null>;
    findWithQuery(query: FilterQuery<IWallet>): Promise<Wallet | null>
    findAllWithQuery(query: FilterQuery<IWallet>, offset: number, limit: number): Promise<Wallet[]>;
    count(query: FilterQuery<IWallet>): Promise<number>;
    save(entity: Partial<IWallet>): Promise<Wallet>;
    findById(id: string): Promise<Wallet | null>;
    update(id: string, entity: Partial<IWallet>): Promise<Wallet | null>;
}