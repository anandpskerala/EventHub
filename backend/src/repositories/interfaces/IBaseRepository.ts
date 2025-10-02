import type { FilterQuery } from "mongoose";

export interface IBaseRepository<T, D> {
    findById(id: string): Promise<T | null>;
    findAll(filter?: FilterQuery<D>, skip?: number, limit?: number): Promise<T[]>;
    save(entity: T): Promise<T>;
    update(id: string, entity: Partial<T>): Promise<T | null>;
    delete(id: string): Promise<boolean>;
}
