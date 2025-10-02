import axiosInstance from "@/utils/axiosInstance";
import { toast } from "sonner";

export const createEventService = async (eventData: FormData) => {
    await axiosInstance.post("/event/create", eventData, {
        headers: {
            "Content-Type": "multipart/form-data"
        }
    })
}

export const getOrganizerEvents = async (params: URLSearchParams) => {
    const response = await axiosInstance.get(`/event/organizer/events?${params}`);
    return response.data;
}

export const deleteEventService = async (eventToDelete: string) => {
    const res = await axiosInstance.delete(`/event/organizer/${eventToDelete}`);
    if (res.data) {
        toast.success(res.data.message);
    }
}

export const getEventById = async (eventId: string) => {
    const res = await axiosInstance.get(`/event/organizer/${eventId}`);
    return res.data.event;
}

export const updateEventService = async (eventId: string, form: FormData) => {
    const res = await axiosInstance.patch(`/event/organizer/${eventId}`, form, {
        headers: {
            "Content-Type": "multipart/form-data"
        }
    });
    if (res.data) {
        toast.success(res.data.message);
    }
}

export const fetchFeaturedEvents = async () => {
    const response = await axiosInstance.get('/event/all', {
        params: {
            page: 1,
            limit: 6,
            status: 'published',
        },
    });

    return response.data.events
}

export const getAllEvents = async (page: number, search: string = "", limit: number = 10, status: string = "published", category: string = "") => {
    const response = await axiosInstance.get('/event/all', {
        params: {
            page,
            limit,
            status,
            search,
            category
        },
    });

    return response.data;
}