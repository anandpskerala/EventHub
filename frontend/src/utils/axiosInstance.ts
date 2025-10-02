import axios, { AxiosError, type AxiosInstance, type AxiosResponse, type InternalAxiosRequestConfig } from "axios";
import config from "@/config";
import type { AppDispatch } from "@/store";
import { fetchAccessToken } from "@/services/tokenService";
import { logout } from "@/store/actions/auth/logout";
import { toast } from "sonner";

let isRefreshing = false;

const axiosInstance: AxiosInstance = axios.create({
    baseURL: config.API_URL,
    withCredentials: true,
});


type FailedRequest = {
    resolve: (value?: unknown) => void;
    reject: (reason?: unknown) => void;
};

let failedQueue: FailedRequest[] = [];

const processQueue = (error: unknown, response?: unknown) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(response);
        }
    });
    failedQueue = [];
};

export const setupAxiosInterceptors = (dispatch: AppDispatch) => {
    axiosInstance.interceptors.response.use(
        (response: AxiosResponse) => response,
        async (error: AxiosError) => {
            const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

            if (error.response?.status === 401 && !originalRequest._retry) {
                if (isRefreshing) {
                    return new Promise((resolve, reject) => {
                        failedQueue.push({
                            resolve: () => resolve(axiosInstance(originalRequest)),
                            reject,
                        });
                    });
                }

                originalRequest._retry = true;
                isRefreshing = true;

                try {
                    await fetchAccessToken();
                    processQueue(null, true);
                    return axiosInstance(originalRequest);
                } catch (refreshError) {
                    processQueue(refreshError, null);
                    dispatch(logout());
                    return Promise.reject(refreshError);
                } finally {
                    isRefreshing = false;
                }
            }

            return Promise.reject(error);
        }
    );


    axiosInstance.interceptors.response.use(
        (res) => res,
        (error) => {
            let errorMessage = "Something went wrong";

            if (error.response) {
                errorMessage =
                    error.response.data?.message ||
                    error.response.data?.status ||
                    errorMessage;

                toast.error(errorMessage);
            } else if (error.request) {
                errorMessage = "Network error: no response from server";
                toast.error(errorMessage);
            } else {
                errorMessage = error.message || errorMessage;
                toast.error(errorMessage);
            }
            console.error("Axios error:", errorMessage, error);

            return Promise.reject(error);
        }
    );

};

export default axiosInstance;