import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import type { RouterProps } from "@/interfaces/props/routerProps";


export const AuthRedirect: React.FC<RouterProps> = ({user}) => {
    if (user && !user.isBlocked) {
        return <Navigate to="/" replace />;
    } 
    return <Outlet />;
}