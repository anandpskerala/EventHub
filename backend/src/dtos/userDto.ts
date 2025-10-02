import type { User } from "../entities/user.js";

export interface UserDTO {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    image: string | null;
    roles: ("user" | "organizer" | "admin")[];
    isBlocked: boolean;
    isVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export class UserMapper {
    static toDTO(user: User): UserDTO {
        return {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            roles: user.roles,
            image: user.image,
            isBlocked: user.isBlocked,
            isVerified: user.isVerified,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };
    }

    static toDTOs(users: User[]): UserDTO[] {
        return users.map(user => this.toDTO(user));
    }
}
