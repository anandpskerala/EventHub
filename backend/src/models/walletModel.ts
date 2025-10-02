import mongoose, { Schema } from "mongoose";
import type { IWallet } from "../utils/types/IWallet.js";


const schema = new Schema<IWallet>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true
    },
    balance: {
        type: Number,
        default: 0
    },
}, {
    timestamps: true

})

const walletModel = mongoose.model<IWallet>("Wallet", schema);
export default walletModel;