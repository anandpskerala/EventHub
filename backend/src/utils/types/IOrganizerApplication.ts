import type { Document, Types } from "mongoose";

export enum ApplicationStatus {
    PENDING = "pending",
    APPROVED = "approved",
    REJECTED = "rejected"
}

export interface IOrganizerApplication extends Document {
    fullName: string;
    email: string;
    userId: Types.ObjectId;
    phone: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    organization?: string;
    organizationType: string;
    experience: string;
    previousEvents?: string;
    motivation: string;
    identityProofPath: string;
    identityProofId: string;
    identityProofType: string;
    identityProofNumber: string;
    status: ApplicationStatus;
    createdAt: Date;
    updatedAt: Date;
}