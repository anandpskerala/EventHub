import type { IUser } from "../utils/types/IUser.js";

export class User {
    readonly id: string;
    firstName: string;
    lastName: string;
    email: string;
    image: string | null;
    roles: ("user" | "organizer" | "admin")[];
    password: string;
    isBlocked: boolean;
    isVerified: boolean;
    createdAt: Date;
    updatedAt: Date;

    constructor(props: Partial<IUser>) {
        this.id = props.id as string;
        this.firstName = props.firstName ?? "";
        this.lastName = props.lastName ?? "";
        this.email = props.email ?? "";
        this.password = props.password ?? "";
        this.roles = props.roles ?? ["user"];
        this.image = props.image ?? null;
        this.isBlocked = props.isBlocked ?? false;
        this.isVerified = props.isVerified ?? false;
        this.createdAt = props.createdAt ?? new Date();
        this.updatedAt = props.updatedAt ?? new Date();
    }
}
