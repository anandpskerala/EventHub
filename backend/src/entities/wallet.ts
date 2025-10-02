import type { IWallet, IWalletTransaction } from "../utils/types/IWallet.js";


export class Wallet {
    readonly id: string;
    userId: string;
    balance: number;
    transactions: IWalletTransaction[];
    createdAt: Date;
    updatedAt: Date;

    constructor(props: Partial<IWallet>) {
        this.id = props._id?.toString() ?? "";
        this.userId = props.userId?.toString() ?? "";
        this.balance = props.balance ?? 0;
        this.transactions = props.transactions ?? [];
        this.createdAt = props.createdAt ?? new Date();
        this.updatedAt = props.updatedAt ?? new Date();
    }
}
