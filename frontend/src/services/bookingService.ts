import type { RazorpayResponse } from "@/interfaces/entities/RazorPay";
import type { TicketSelection } from "@/pages/user/BookingPage";
import axiosInstance from "@/utils/axiosInstance";
import { toast } from "sonner";

export const handleBookingService = async (bookingData: {
    eventId: string | undefined;
    tickets: TicketSelection[];
    paymentMethod: PaymentMethodData;
}) => {
    const res = await axiosInstance.post("/booking/reserve", bookingData);
    return res.data.booking;
}

export const handleRPayPayment = async (response: RazorpayResponse, bookingId: string) => {
    const res = await axiosInstance.patch(`/booking/confirm/${bookingId}`, {
        razorpay_order_id: response.razorpay_order_id,
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_signature: response.razorpay_signature,
    });
    if (res.data) {
        toast.success(res.data.message);
    }
}

export const failedBookings = async (bookingId: string) => {
    const res = await axiosInstance.patch(`/booking/failed/${bookingId}`);
    if (res.data) {
        toast.error(res.data.message);
    }
}

export const checkConfirmation = async (orderId: string) => {
    const res = await axiosInstance.get(`/booking/confirm/${orderId}`);
    return res.data;
}

export const getUserBookings = async (page: number = 1, search: string = "", status: string = "") => {
    const res = await axiosInstance.get("/booking/user-bookings", {
        params: {
            page,
            search, status
        }
    });
    return res.data;
}

export const downloadTicketService = async (bookingId: string) => {
    const response = await axiosInstance.get(`/booking/download/${bookingId}`, {
        responseType: "blob", 
    });
    const blob = new Blob([response.data], { type: "application/pdf" });
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `ticket-${bookingId}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();

    window.URL.revokeObjectURL(url);
};

export const walletPayment = async (bookingId: string) => {
    const response = await axiosInstance.post(`/booking/wallet/${bookingId}`);
    return response;
}

export const getOrganizerBookings = async (params: URLSearchParams) => {
    const response = await axiosInstance.get(`/booking/organizer/bookings?${params}`);
    return response.data;
}

export const cancelBookingService = async (bookingId: string) => {
    const response = await axiosInstance.patch(`/booking/cancel/${bookingId}`);
    if (response.data) {
        toast.success(response.data.message);
    }
}