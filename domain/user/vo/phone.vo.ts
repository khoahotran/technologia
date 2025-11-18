import { z } from "zod";

export const PhoneNumberSchema = z.string().min(8).max(15);

export type PhoneNumber = z.infer<typeof PhoneNumberSchema>;
