import type { IUser } from "../../utils/types/IUser.js";
import type { UserReturnType } from "../../utils/types/ReturnTypes.js";

export interface IAuthService {
    signup(userData: Partial<IUser>): Promise<UserReturnType>;
    login(email: string, password: string): Promise<UserReturnType>;
    verifyUser(userId: string): Promise<UserReturnType>;
    refreshToken(token: string): Promise<UserReturnType>;
    changePassword(userId: string, password: string, newPassword: string): Promise<UserReturnType>;
}
