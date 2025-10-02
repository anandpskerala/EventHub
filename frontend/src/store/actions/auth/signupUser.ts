import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "@/utils/axiosInstance";
import { AxiosError } from "axios";
import type { SignupFormData } from "@/schemas/signupSchema";


export const signupUser = createAsyncThunk(
    "auth/signupUser",
    async (userData: SignupFormData, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post("/auth/signup", userData);
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