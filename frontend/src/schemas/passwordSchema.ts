import { z } from "zod";

export const passwordSchema = z.object({
    password: z.string().trim().min(8, "Password must be at least 8 characters"),
    newPassword: z.string().min(1, "Password is required").min(8, "Password must be at least 8 characters")
        .regex(
            /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
            "Password must contain uppercase, lowercase, and number"
        ),
    confirmPassword: z.string().min(1, "Please confirm your password"),
});

export type PasswordFormData = z.infer<typeof passwordSchema>;