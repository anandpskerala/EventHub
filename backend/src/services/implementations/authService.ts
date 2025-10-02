import bcrypt, { genSalt } from "bcryptjs";
import type { IUserRepository } from "../../repositories/interfaces/IUserRepository.js";
import { HttpResponse } from "../../utils/constants/httpResponse.js";
import { HttpStatusCode } from "../../utils/constants/httpStatusCode.js";
import type { IUser } from "../../utils/types/IUser.js";
import type { UserReturnType } from "../../utils/types/ReturnTypes.js";
import type { IAuthService } from "../interfaces/IAuthService.js";
import { createAccessToken, createRefreshToken, verifyRefreshToken } from "../../utils/tokenUtils.js";
import { UserMapper } from "../../dtos/userDto.js";

export class AuthService implements IAuthService {
    constructor(private _userRepo: IUserRepository) {
    }

    async signup(userData: Partial<IUser>): Promise<UserReturnType> {
        const existing = await this._userRepo.findByEmail(userData.email as string);
        if (existing) {
            return {
                message: HttpResponse.USER_ALREADY_EXISTS,
                statusCode: HttpStatusCode.BAD_REQUEST
            }
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(userData.password as string, salt);
        userData.password = hashedPassword;
        const user = await this._userRepo.save(userData);
        const accessToken = createAccessToken(user.id, user.roles);
        const refreshToken = createRefreshToken(user.id);
        return {
            message: HttpResponse.SIGNUP_SUCCESS,
            statusCode: HttpStatusCode.CREATED,
            user: UserMapper.toDTO(user),
            accessToken,
            refreshToken
        }
    }

    async login(email: string, password: string): Promise<UserReturnType> {
        const existing = await this._userRepo.findByEmail(email);
        if (!existing) {
            return {
                message: HttpResponse.USER_DOESNT_EXISTS,
                statusCode: HttpStatusCode.NOT_FOUND
            }
        }

        const compared = await bcrypt.compare(password, existing.password);

        if (!compared) {
            return {
                message: HttpResponse.USER_DOESNT_EXISTS,
                statusCode: HttpStatusCode.BAD_REQUEST
            }
        }

        const accessToken = createAccessToken(existing.id, existing.roles);
        const refreshToken = createRefreshToken(existing.id);
        return {
            message: HttpResponse.LOGIN_SUCCESS,
            statusCode: HttpStatusCode.OK,
            user: UserMapper.toDTO(existing),
            accessToken,
            refreshToken
        }
    }

    async verifyUser(userId: string): Promise<UserReturnType> {
        if (!userId) {
            return {
                message: HttpResponse.USER_ID_NOT_FOUND,
                statusCode: HttpStatusCode.BAD_REQUEST
            }
        }

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
    
    async refreshToken(token: string): Promise<UserReturnType> {
        if (!token) {
            return {
                message: HttpResponse.INVALID_TOKEN,
                statusCode: HttpStatusCode.BAD_REQUEST
            }
        }

        const decoded = verifyRefreshToken(token) as {userId: string};
        const user = await this._userRepo.findById(decoded.userId);

        if (!user) {
            return {
                message: HttpResponse.USER_DOESNT_EXISTS,
                statusCode: HttpStatusCode.NOT_FOUND
            }
        }

        const accessToken = createAccessToken(user.id, user.roles);
        return {
            message: HttpResponse.TOKEN_REFRESHED,
            statusCode: HttpStatusCode.OK,
            user: UserMapper.toDTO(user),
            accessToken
        }
    }

    async changePassword(userId: string, password: string, newPassword: string): Promise<UserReturnType> {
        const user = await this._userRepo.findById(userId);
        if (!user) {
            return {
                message: HttpResponse.USER_DOESNT_EXISTS,
                statusCode: HttpStatusCode.NOT_FOUND
            }
        }

        if (password === newPassword) {
            return {
                message: HttpResponse.PASSWORD_SAME,
                statusCode: HttpStatusCode.BAD_REQUEST
            }
        }

        const compared = await bcrypt.compare(password, user.password);
        if (!compared) {
            return {
                message: HttpResponse.OLD_PASSWORD_MISMATCH,
                statusCode: HttpStatusCode.BAD_REQUEST
            }
        }

        const salt = await genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        await this._userRepo.update(userId, {password: hashedPassword});
        return {
            message: HttpResponse.PASSWORD_CHANGED,
            statusCode: HttpStatusCode.OK
        }
    }

}