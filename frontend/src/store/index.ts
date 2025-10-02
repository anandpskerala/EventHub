import { configureStore } from "@reduxjs/toolkit";
import authSlice from "@/store/slices/authSlice";
import { useDispatch, useSelector, type TypedUseSelectorHook } from "react-redux";

const store = configureStore({
    reducer: {
        auth: authSlice
    }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
export const useAppDispatch = () => useDispatch<AppDispatch>();
export default store;