import jwt from "jsonwebtoken";
import { config } from "../config/config.js";

const ACCESS_TOKEN_SECRET = config.accessTokenSecret || "supersecret";
const REFRESH_TOKEN_SECRET = config.refreshTokenSecret || "refreshsupersecret";

export const createAccessToken = (userId: string, roles: string[]): string => {
    return jwt.sign(
        { userId, roles },
        ACCESS_TOKEN_SECRET,
        { expiresIn: "15m" }
    );
};

export const createRefreshToken = (userId: string): string => {
    return jwt.sign(
        { userId },
        REFRESH_TOKEN_SECRET,
        { expiresIn: "7d" }
    );
};

export const verifyAccessToken = (token: string) => {
    return jwt.verify(token, ACCESS_TOKEN_SECRET);
};

export const verifyRefreshToken = (token: string) => {
    return jwt.verify(token, REFRESH_TOKEN_SECRET);
};
