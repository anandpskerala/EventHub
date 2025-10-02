export interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    image?: string;
    roles: ("user" | "organizer" | "admin")[];
    isBlocked: boolean;
    isVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
}