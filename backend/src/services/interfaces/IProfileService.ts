import type { IUser } from "../../utils/types/IUser.js";
import type { UserReturnType } from "../../utils/types/ReturnTypes.js";

export interface IProfileService {
    changeUserInfo(userId: string, userData: Partial<IUser>): Promise<UserReturnType>;
    getUserDetails(userId: string): Promise<UserReturnType>;
}