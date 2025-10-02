import { createSlice, type ActionReducerMapBuilder } from "@reduxjs/toolkit";
import type { User } from "@/interfaces/entities/User";
import { loginUser } from "@/store/actions/auth/loginUser";
import { toast } from "sonner";
import { verifyUser } from "@/store/actions/auth/verifyUser";
import { logout } from "@/store/actions/auth/logout";
import { signupUser } from "@/store/actions/auth/signupUser";

interface AuthState {
    user: undefined | null | User,
    isLoading: boolean
}

const initialState: AuthState = {
    user: undefined,
    isLoading: false
}

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {},
    extraReducers: (builder: ActionReducerMapBuilder<AuthState>) => {
        builder.addCase(loginUser.pending, (state) => {
            state.isLoading = true;
            state.user = undefined;
        })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.isLoading = false;
                state.user = action.payload.user;
                toast.success(action.payload.message);
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.isLoading = false;
                state.user = null;
                toast.error(action.payload as string);
            })
            .addCase(verifyUser.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(verifyUser.fulfilled, (state, action) => {
                state.isLoading = false;
                state.user = action.payload.user;
            })
            .addCase(verifyUser.rejected, (state) => {
                state.isLoading = false;
                state.user = null;
            })
            .addCase(logout.fulfilled, (state) => {
                state.isLoading = false;
                state.user = null;
            })
            .addCase(logout.rejected, (state) => {
                state.isLoading = false;
            })
            .addCase(signupUser.pending, (state) => {
                state.isLoading = true;
                state.user = undefined;
            })
            .addCase(signupUser.fulfilled, (state, action) => {
                state.isLoading = false;
                state.user = action.payload.user;
                toast.success(action.payload.message);
            })
            .addCase(signupUser.rejected, (state, action) => {
                state.isLoading = false;
                state.user = null;
                toast.error(action.payload as string);
            })
    }
});


export default authSlice.reducer;