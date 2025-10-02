import type { OrganizerApplication } from "../entities/organizerApplication.js";
import type { ApplicationStatus } from "../utils/types/IOrganizerApplication.js";

export interface OrganizerApplicationDTO {
    id: string;
    fullName: string;
    email: string;
    userId: string;
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
    status: ApplicationStatus;
    createdAt: Date;
    updatedAt: Date;
}

export interface OrganizerApplicationAdminDTO extends OrganizerApplicationDTO {
    identityProofId: string;
    identityProofType: string;
    identityProofNumber: string;
    identityProofPath: string;
}

export class OrganizerApplicationMapper {
    static toDTO(entity: OrganizerApplication): OrganizerApplicationDTO {
        return {
            id: entity.id,
            fullName: entity.fullName,
            email: entity.email,
            userId: entity.userId.toHexString(),
            phone: entity.phone,
            address: entity.address,
            city: entity.city,
            state: entity.state,
            zipCode: entity.zipCode,
            organization: entity.organization as string,
            organizationType: entity.organizationType,
            experience: entity.experience,
            previousEvents: entity.previousEvents as string,
            motivation: entity.motivation,
            status: entity.status,
            createdAt: entity.createdAt,
            updatedAt: entity.updatedAt,
        };
    }

    static toAdminDTO(entity: OrganizerApplication): OrganizerApplicationAdminDTO {
        return {
            id: entity.id,
            fullName: entity.fullName,
            email: entity.email,
            userId: entity.userId.toString(),
            phone: entity.phone,
            address: entity.address,
            city: entity.city,
            state: entity.state,
            zipCode: entity.zipCode,
            organization: entity.organization as string,
            organizationType: entity.organizationType,
            experience: entity.experience,
            previousEvents: entity.previousEvents as string,
            motivation: entity.motivation,
            identityProofId: entity.identityProofId,
            identityProofPath: entity.identityProofPath,
            identityProofType: entity.identityProofType,
            identityProofNumber: entity.identityProofNumber,
            status: entity.status,
            createdAt: entity.createdAt,
            updatedAt: entity.updatedAt,
        };
    }

    static toDTOList(entities: OrganizerApplication[]): OrganizerApplicationDTO[] {
        return entities.map(e => this.toDTO(e));
    }

    static toAdminDTOList(entities: OrganizerApplication[]): OrganizerApplicationAdminDTO[] {
        return entities.map(e => this.toAdminDTO(e));
    }
}