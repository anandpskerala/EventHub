import dotenv from "dotenv";
import { z } from "zod";
dotenv.config();


const schema = z.object({
	PORT: z.string().default("3000"),
	NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
	MONGO_URI: z.string().trim(),
	ACCESS_TOKEN_SECRET: z.string().trim(),
	REFRESH_TOKEN_SECRET: z.string().trim(),
	FRONTEND_URL: z.string(),
	CLOUD_NAME: z.string(),
	CLOUD_API_KEY: z.string(),
	CLOUD_SECRET: z.string(),
	RPAY_KEY: z.string(),
	RPAY_SECRET: z.string()
});

const env = schema.parse(process.env);

export const config = {
	port: Number(env.PORT),
	nodeEnv: env.NODE_ENV,
	dbUri: env.MONGO_URI,
	accessTokenSecret: env.ACCESS_TOKEN_SECRET,
	refreshTokenSecret: env.REFRESH_TOKEN_SECRET,
	frontendUrl: env.FRONTEND_URL,
	cloudinary: {
		cloudName: env.CLOUD_NAME,
		apiKey: env.CLOUD_API_KEY,
		secret: env.CLOUD_SECRET
	},
	rpayKey: env.RPAY_KEY,
	rpaySecret: env.RPAY_SECRET
};
