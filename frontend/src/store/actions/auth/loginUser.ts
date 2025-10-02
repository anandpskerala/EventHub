import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "@/utils/axiosInstance";
import { AxiosError } from "axios";
import type { LoginFormData } from "@/interfaces/formdata/loginFormdata";


export const loginUser = createAsyncThunk(
    "auth/loginUser",
    async (userData: LoginFormData, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post("/auth/login", userData);
            if (!response.data?.user) {
                return rejectWithValue("Invalid response from server");
            }
            return response.data;
        } catch (error) {
            if (error instanceof AxiosError && error.response) {
                return rejectWithValue(error.response.data.message);
              }
              return rejectWithValue("Something went wrong");
        }
    }
)