import type { Orders } from "razorpay/dist/types/orders.js";

export interface IRPayService {
    createOrder(amount: number): Promise<Orders.RazorpayOrder>;
}