import RPay from "razorpay";
import type { IRPayService } from "../interfaces/IRPayService.js";
import type { Orders } from "razorpay/dist/types/orders.js";

export class RPayService implements IRPayService {
    private _razorpay: RPay;
    constructor(keyId: string, secret: string) {
        this._razorpay = new RPay({
            key_id: keyId,
            key_secret: secret
        });
    }

    async createOrder(amount: number): Promise<Orders.RazorpayOrder> {
        const options = {
            amount: amount * 100,
            currency: 'INR',
            receipt: `receipt_${crypto.randomUUID().slice(0, 5) + Date.now()}`,
            payment_capture: 1
        };

        const order = await this._razorpay.orders.create(options);
        return order;
    }
}