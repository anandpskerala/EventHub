import type { IWallet } from "../../utils/types/IWallet.js";
import type { WalletReturnType } from "../../utils/types/ReturnTypes.js";

export interface IWalletService {
    getWallet(userId: string): Promise<WalletReturnType>;
    createWallet(walletData: Partial<IWallet>): Promise<WalletReturnType>;
    addFunds(userId: string, amount: number): Promise<WalletReturnType>;
    deductFunds(userId: string, amount: number): Promise<WalletReturnType>;
}
