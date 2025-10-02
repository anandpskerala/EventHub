export type ApplicationStatus = "pending" | "approved" | "rejected";


export interface IOrganizerApplication {
    id: string;
    fullName: string;
    email: string;
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
    identityProofId: string;
    identityProofPath: string;
    identityProofType: string;
    identityProofNumber: string;
    status: ApplicationStatus;
    createdAt: string;
    updatedAt: string;
}