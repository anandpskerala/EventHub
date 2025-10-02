import { z } from "zod";

const TicketTierSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(1, "Tier name is required"),
    price: z.number().min(1, "Price must be greater than 0"),
    quantity: z.number().min(1, "Quantity must be greater than 0"),
    sold: z.number().optional().default(0),
    description: z.string().optional(),
});

export const EventCreationSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(3, "Event name must be at least 3 characters"),
    description: z.string().optional(),
    date: z.string().min(1, "Date is required"),
    time: z.string().min(1, "Time is required"),
    location: z.string().min(1, "Location is required"),
    category: z.string().min(1, "Category is required"),
    image: z.any().refine((val) => val != null, {
        message: "Image is required",
    }),
    ticketTiers: z.array(TicketTierSchema),
    status: z.enum(["draft", "published", "ended"]).default("draft"),
}).refine(
    (data) => {
        const eventDate = new Date(data.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return eventDate > today;
    },
    {
        path: ["date"],
        message: "Event date must be in the future",
    }
);

export type EventFormData = z.infer<typeof EventCreationSchema>;
