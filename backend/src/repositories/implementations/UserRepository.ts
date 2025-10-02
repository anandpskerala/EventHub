import { User } from "../../entities/user.js";
import userModel from "../../models/userModel.js";
import type { IUser } from "../../utils/types/IUser.js";
import type { IUserRepository } from "../interfaces/IUserRepository.js";
import { BaseRepository } from "./BaseRepository.js";


export class UserRepository extends BaseRepository<User, IUser> implements IUserRepository {
    constructor() {
        super(userModel, (doc: Partial<IUser>) => new User({
            id: doc._id as string,
            firstName: doc.firstName as string,
            lastName: doc.lastName as string,
            email: doc.email as string,
            password: doc.password as string,
            googleId: doc.googleId as string,
            phoneNumber: doc.phoneNumber as number,
            image: doc.image as string,
            authProvider: doc.authProvider as "email" | "google",
            roles: doc.roles as ("user" | "organizer" | "admin")[],
            isBlocked: doc.isBlocked as boolean,
            isVerified: doc.isVerified as boolean,
            createdAt: doc.createdAt as Date,
            updatedAt: doc.updatedAt as Date,
        }));
    }

    async findByEmail(email: string): Promise<User | null> {
        const doc = await this.model.findOne({ email }).lean();
        return doc ? this.entityMapper(doc) : null;
    }

    async updateRole(userId: string, roles: string[]): Promise<void> {
        await this.model.findByIdAndUpdate(userId, {
            $set: {
                roles
            }
        })
    }
}
