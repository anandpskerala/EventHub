import { model, Schema, type InferSchemaType } from "mongoose";
import { TransactionType, type IWalletTransaction } from "../utils/types/IWallet.js";


const transactionSchema = new Schema<IWalletTransaction>(
    {
        walletId: {
            type: Schema.Types.ObjectId,
            ref: "Wallet",
            required: true,
            index: true,
        },
        type: {
            type: String,
            enum: Object.values(TransactionType),
            required: true,
        },
        amount: {
            type: Number,
            required: true,
            min: 0,
        },
        description: {
            type: String,
            trim: true,
        },
        date: {
            type: Date,
            default: Date.now,
        },
    },
);

export type TransactionSchemaType = InferSchemaType<typeof transactionSchema>;

export const TransactionModel = model<TransactionSchemaType>(
    "Transaction",
    transactionSchema
);
