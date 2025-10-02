import zod from 'zod'

export const loginSchema = zod.object({
    email: zod.email({ message: "Invalid email address" }),
    password: zod.string().min(6, { message: "Password must be at least 6 characters" }),
});

export interface LoginValidationError {
    email?: string;
    password?: string;
}