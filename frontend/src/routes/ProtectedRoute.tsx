import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import type { RouterProps } from "@/interfaces/props/routerProps";

export const ProtectedRoute: React.FC<RouterProps> = ({ user }) => {
    if (user === undefined) {
        return null;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (user.isBlocked) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};
