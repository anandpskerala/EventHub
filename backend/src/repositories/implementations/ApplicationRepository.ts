import type { FilterQuery } from "mongoose";
import { OrganizerApplication } from "../../entities/organizerApplication.js";
import organizerApplicationModel from "../../models/organizerApplicationModel.js";
import type { ApplicationStatus, IOrganizerApplication } from "../../utils/types/IOrganizerApplication.js";
import type { IApplicationRepository } from "../interfaces/IApplicationRepository.js";
import { BaseRepository } from "./BaseRepository.js";
import type { Types } from "mongoose";

export class ApplicationRepository extends BaseRepository<OrganizerApplication, IOrganizerApplication> implements IApplicationRepository {
    constructor() {
        super(organizerApplicationModel, (doc: Partial<IOrganizerApplication>) => new OrganizerApplication({
            id: doc._id?.toString() ?? "",
            fullName: doc.fullName as string,
            email: doc.email as string,
            userId: doc.userId as Types.ObjectId,
            phone: doc.phone as string,
            address: doc.address as string,
            city: doc.city as string,
            state: doc.state as string,
            zipCode: doc.zipCode as string,
            organization: doc.organization as string,
            organizationType: doc.organizationType as string,
            experience: doc.experience as string,
            previousEvents: doc.previousEvents as string,
            motivation: doc.motivation as string,
            identityProofPath: doc.identityProofPath as string,
            identityProofType: doc.identityProofType as string,
            identityProofNumber: doc.identityProofNumber as string,
            status: doc.status as ApplicationStatus,
            createdAt: doc.createdAt as Date,
            updatedAt: doc.updatedAt as Date,
        }))
    }

    async findByEmail(email: string): Promise<OrganizerApplication | null> {
        const doc = await this.model.findOne({ email }).lean();
        return doc ? this.entityMapper(doc) : null;
    }

    async findWithQuery(query: FilterQuery<IOrganizerApplication>): Promise<OrganizerApplication | null> {
        const doc = await this.model.findOne(query).sort({createdAt: -1}).lean();
        return doc ? this.entityMapper(doc) : null;
    }

    async findAllWithQuery(query: FilterQuery<IOrganizerApplication>, offset: number, limit: number = 10): Promise<OrganizerApplication[]> {
        const docs = await this.model.find(query).skip(offset).limit(limit).sort({createdAt: -1}).lean();
        return docs.map(doc => this.entityMapper(doc));
    }

    async count(query: FilterQuery<IOrganizerApplication>): Promise<number> {
        const count = await this.model.countDocuments(query);
        return count;
    }
}