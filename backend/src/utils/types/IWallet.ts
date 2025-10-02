import type { Types } from "mongoose";

export interface IWallet {
    _id?: string
    userId: Types.ObjectId;
    balance: number;
    transactions: IWalletTransaction[];
    createdAt: Date;
    updatedAt: Date;
}

export enum TransactionType {
    CREDIT = "CREDIT",
    DEBIT = "DEBIT",
    REFUND = "REFUND",
}

export interface IWalletTransaction {
    id: string;
    walletId: Types.ObjectId;
    type: TransactionType;
    amount: number;
    description?: string;
    date: Date;
}