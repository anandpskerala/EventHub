import type { Types } from "mongoose";
import { ApplicationStatus, type IOrganizerApplication } from "../utils/types/IOrganizerApplication.js";

export class OrganizerApplication {
    readonly id: string;
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

    constructor(params: Partial<IOrganizerApplication>) {
        this.id = params.id;
        this.fullName = params.fullName ?? "";
        this.email = params.email ?? "";
        this.userId = params.userId as Types.ObjectId;
        this.phone = params.phone ?? "";
        this.address = params.address ?? "";
        this.city = params.city ?? "";
        this.state = params.state ?? "";
        this.zipCode = params.zipCode ?? "";
        this.organization = params.organization ?? "";
        this.organizationType = params.organizationType ?? "";
        this.experience = params.experience ?? "";
        this.previousEvents = params.previousEvents ?? "";
        this.motivation = params.motivation ?? "";
        this.identityProofPath = params.identityProofPath ?? "";
        this.identityProofId = params.identityProofId ?? "";
        this.identityProofType = params.identityProofType ?? "";
        this.identityProofNumber = params.identityProofNumber ?? "";
        this.status = params.status ?? ApplicationStatus.PENDING;
        this.createdAt = params.createdAt ?? new Date();
        this.updatedAt = params.updatedAt ?? new Date();
    }
}
