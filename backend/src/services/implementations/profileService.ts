import { UserMapper } from "../../dtos/userDto.js";
import type { IUserRepository } from "../../repositories/interfaces/IUserRepository.js";
import { HttpResponse } from "../../utils/constants/httpResponse.js";
import { HttpStatusCode } from "../../utils/constants/httpStatusCode.js";
import type { IUser } from "../../utils/types/IUser.js";
import type { UserReturnType } from "../../utils/types/ReturnTypes.js";
import type { IProfileService } from "../interfaces/IProfileService.js";

export class ProfileService implements IProfileService {
    constructor(private _userRepo: IUserRepository) {}

    async changeUserInfo(userId: string, userData: Partial<IUser>): Promise<UserReturnType> {
        let user = await this._userRepo.findById(userId);
        if (!user) {
            return {
                message: HttpResponse.USER_DOESNT_EXISTS,
                statusCode: HttpStatusCode.NOT_FOUND
            }
        }

        user = await this._userRepo.update(userId, userData);
        return {
            message: HttpResponse.USER_UPDATED,
            statusCode: HttpStatusCode.OK
        }
    }

    async getUserDetails(userId: string): Promise<UserReturnType> {
        const user = await this._userRepo.findById(userId);
        if (!user) {
            return {
                message: HttpResponse.USER_DOESNT_EXISTS,
                statusCode: HttpStatusCode.NOT_FOUND
            }
        }

        return {
            message: "",
            statusCode: HttpStatusCode.OK,
            user: UserMapper.toDTO(user)
        }
    }
}