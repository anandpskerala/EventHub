import type { ApplicationFormData } from "@/schemas/applicationSchema";
import axiosInstance from "@/utils/axiosInstance";

export const submitApplicationService = async (applicationData: ApplicationFormData) => {
    const res = await axiosInstance.post("/application/submit", applicationData, {
        headers: {
            "Content-Type": "multipart/form-data"

        }
    });
    return res.data.message;
}

export const getAllApplicationsService = async (search: string = "", page: number = 1, limit: number = 10, statusFilter: string = "") => {
    const res = await axiosInstance(
        `/application/admin/applications?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}&status=${statusFilter}`,
    );
    return res.data;
}

export const changeApplicationStatusService = async (applicationId: string, status: string) => {
    await axiosInstance.patch(`/application/admin/status/${applicationId}`, { status });
}