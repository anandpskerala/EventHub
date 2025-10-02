import type { User } from "@/interfaces/entities/User";
import type { PasswordFormData } from "@/schemas/passwordSchema";
import axiosInstance from "@/utils/axiosInstance";

export const changeUserDataService = async (userData: Partial<User>) => {
    const res = await axiosInstance.patch("/user/profile", userData);
    return res.data.message;
}


export const changePasswordService = async (passwordData: PasswordFormData) => {
    const res = await axiosInstance.patch("/auth/password", passwordData);
    return res.data.message;
}

export const getUserDetails = async (userId: string) => {
    const res = await axiosInstance.get(`/user/${userId}`);
    return res.data.user;
}