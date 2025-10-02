import { z } from "zod";

export const signupSchema = z.object({
        firstName: z.string().trim().min(1, "First name is required"),
        lastName: z.string().trim().min(1, "Last name is required"),
        email: z.email("Please enter a valid email address"),
        password: z.string().min(1, "Password is required").min(8, "Password must be at least 8 characters")
            .regex(
                /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                "Password must contain uppercase, lowercase, and number"
            ),
        confirmPassword: z.string().min(1, "Please confirm your password"),
    })
    .refine((data) => data.password === data.confirmPassword, {
        path: ["confirmPassword"],
        message: "Passwords do not match",
    });


export type SignupFormData = z.infer<typeof signupSchema>;

export interface SignupValidationError {
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
}
