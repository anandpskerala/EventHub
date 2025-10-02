import { z } from "zod";

export const applicationFormSchema = z.object({
    fullName: z.string().trim().min(1, "Full name is required"),
    email: z
        .string()
        .trim()
        .min(1, "Email is required")
        .email("Invalid email format"),
    phone: z.string().trim().min(1, "Phone number is required"),
    address: z.string().trim().min(1, "Address is required"),
    city: z.string().trim().min(1, "City is required"),
    state: z.string().trim().min(1, "State is required"),
    zipCode: z.string().trim().min(1, "ZIP code is required"),
    organization: z.string().optional(),
    organizationType: z.string().min(1, "Organization type is required"),
    experience: z.string().min(1, "Experience level is required"),
    previousEvents: z.string().optional(),
    motivation: z.string().trim().min(1, "Motivation is required"),
    identityProofType: z.string().min(1, "Identity proof type is required"),
    identityProofNumber: z.string().trim().min(1, "Identity proof number is required"),
    identityProof: z.any().refine((val) => val != null, {
        message: "Identity proof document is required",
    }),
});

export type ApplicationFormData = z.infer<typeof applicationFormSchema>;
