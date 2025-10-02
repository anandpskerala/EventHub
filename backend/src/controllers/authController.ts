import type { Request, Response } from "express";
import type { IAuthService } from "../services/interfaces/IAuthService.js";
import type { IUser } from "../utils/types/IUser.js";
import { config } from "../config/config.js";
import type { CustomRequest } from "../utils/types/CustomRequest.js";
import { HttpStatusCode } from "../utils/constants/httpStatusCode.js";
import { HttpResponse } from "../utils/constants/httpResponse.js";

export class AuthController {
    constructor(private _service: IAuthService) { }

    public async signup(req: Request, res: Response): Promise<void> {
        const { email, password, firstName, lastName } = req.body;
        const user: Partial<IUser> = {
            firstName,
            lastName,
            email,
            password,
            authProvider: "email"
        }

        const result = await this._service.signup(user);
        if (result.accessToken) {
            res.cookie("accessToken", result.accessToken, {
                httpOnly: true,
                secure: config.nodeEnv === "production",
                sameSite: "none",
                maxAge: 15 * 60 * 1000
            });
        }

        if (result.refreshToken) {
            res.cookie("refreshToken", result.refreshToken, {
                httpOnly: true,
                secure: config.nodeEnv === "production",
                sameSite: "none",
                maxAge: 7 * 24 * 60 * 60 * 1000
            });
        }
        res.status(result.statusCode).json({ message: result.message, user: result.user });
    }

    public async login(req: Request, res: Response): Promise<void> {
        const { email, password } = req.body;
        const result = await this._service.login(email, password);
        if (result.accessToken) {
            res.cookie("accessToken", result.accessToken, {
                httpOnly: true,
                secure: config.nodeEnv === "production",
                sameSite: "none",
                path: "/",
                maxAge: 15 * 60 * 1000
            });
        }

        if (result.refreshToken) {
            res.cookie("refreshToken", result.refreshToken, {
                httpOnly: true,
                secure: config.nodeEnv === "production",
                sameSite: "none",
                maxAge: 7 * 24 * 60 * 60 * 1000
            });
        }
        res.status(result.statusCode).json({ message: result.message, user: result.user });
    }

    public async verifyUser(req: CustomRequest, res: Response): Promise<void> {
        const userId = req.userId as string;
        const result = await this._service.verifyUser(userId);
        res.status(result.statusCode).json({ message: result.message, user: result.user });
    }

    public async refreshToken(req: Request, res: Response): Promise<void> {
        const { refreshToken } = req.cookies;
        const result = await this._service.refreshToken(refreshToken);
        if (result.accessToken) {
            res.cookie("accessToken", result.accessToken, {
                httpOnly: true,
                secure: config.nodeEnv === "production",
                sameSite: "lax",
                maxAge: 15 * 60 * 1000,
            });
        }

        res.status(result.statusCode).json({ message: result.message, user: result.user });
    }

    public logOut(req: Request, res: Response): void {
        res.clearCookie("accessToken",
            {
                httpOnly: true,
                secure: config.nodeEnv === "production",
                sameSite: "none",
            }
        );
        res.clearCookie("refreshToken",
            {
                httpOnly: true,
                secure: config.nodeEnv === "production",
                sameSite: "none",
            }
        );
        res.status(HttpStatusCode.OK).json({ message: HttpResponse.LOGOUT_SUCCESS });
    }

    public async changePassword(req: CustomRequest, res: Response): Promise<void> {
        const userId = req.userId;
        const { password, newPassword } = req.body;
        const result = await this._service.changePassword(userId as string, password, newPassword);
        res.status(result.statusCode).json({ message: result.message })
    }
}