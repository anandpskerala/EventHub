import type { FilterQuery } from "mongoose";
import type { OrganizerApplication } from "../../entities/organizerApplication.js";
import type { IOrganizerApplication } from "../../utils/types/IOrganizerApplication.js";

export interface IApplicationRepository{
    findByEmail(email: string): Promise<OrganizerApplication | null>;
    save(entity: Partial<IOrganizerApplication>): Promise<OrganizerApplication>;
    findById(id: string): Promise<OrganizerApplication | null>;
    update(id: string, entity: Partial<IOrganizerApplication>): Promise<OrganizerApplication | null>;
    findWithQuery(query: FilterQuery<IOrganizerApplication>): Promise<OrganizerApplication | null>;
    findAllWithQuery(query: FilterQuery<IOrganizerApplication>, offset: number, limit: number): Promise<OrganizerApplication[]>;
    count(query: FilterQuery<IOrganizerApplication>): Promise<number>;
}