import type { RouterProps } from '@/interfaces/props/routerProps';
import React from 'react'
import { Navigate, Outlet } from 'react-router-dom';

export const OrganizerRoutes: React.FC<RouterProps> = ({user}) => {
    if (user === undefined) {
        return null;
    }
    if (user?.isBlocked || !user?.roles.includes("organizer")) {
        return <Navigate to="/login" replace />
    }

    return <Outlet />
}