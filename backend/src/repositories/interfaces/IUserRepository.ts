import type { User } from "../../entities/user.js";
import type { IUser } from "../../utils/types/IUser.js";

export interface IUserRepository {
    findByEmail(email: string): Promise<User | null>;
    save(entity: Partial<IUser>): Promise<User>;
    findById(id: string): Promise<User | null>;
    update(id: string, entity: Partial<IUser>): Promise<User | null>;
    updateRole(userId: string, roles: string[]): Promise<void>;
}