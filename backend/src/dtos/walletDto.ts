import type { Wallet } from "../entities/wallet.js";
import type { IWalletTransaction } from "../utils/types/IWallet.js";

export interface WalletDTO {
    id: string;
    userId: string;
    balance: number;
    transactions: WalletTransactionDTO[];
    createdAt: Date;
    updatedAt: Date;
}

export interface WalletTransactionDTO {
    id: string;
    type: string;
    amount: number;
    description?: string;
    date: Date;
}


export class WalletMapper {
    static toDTO(wallet: Wallet): WalletDTO {
        return {
            id: wallet.id,
            userId: wallet.userId,
            balance: wallet.balance,
            transactions: wallet.transactions.map(tx => WalletMapper.transactionToDTO(tx)),
            createdAt: wallet.createdAt,
            updatedAt: wallet.updatedAt
        };
    }

    static toDTOList(wallets: Wallet[]): WalletDTO[] {
        return wallets.map(wallet => WalletMapper.toDTO(wallet));
    }

    private static transactionToDTO(tx: IWalletTransaction): WalletTransactionDTO {
        return {
            id: tx.id ?? "",
            type: tx.type ?? "",
            amount: tx.amount ?? 0,
            description: tx.description ?? "",
            date: tx.date ?? new Date()
        };
    }
}