import type { Document } from "mongoose";

export interface IUser extends Document {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string | null;
    googleId: string | null;
    phoneNumber?: number | null;
    image?: string | null;
    authProvider: "google" | "email";
    roles: ("user" | "organizer" | "admin")[];
    isBlocked: boolean;
    isVerified: boolean;
    organizerId?: string | null;
    createdAt?: Date;
    updatedAt?: Date;
}