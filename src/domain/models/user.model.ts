import { z } from "zod";

export const userProfileSchema = z.object({
  userId: z.union([z.string(), z.number()]).transform(String),
  username: z.string(),
  email: z.string().email().or(z.string().length(0)).optional(),
  firstName: z.string().nullable().optional(),
  lastName: z.string().nullable().optional(),
  phoneNumber: z.string().nullable().optional(),
  imageUrl: z.string().nullable().optional(),
  displayName: z.string().nullable().optional(),
  role: z.string().optional(),
});

export type UserProfile = z.infer<typeof userProfileSchema>;
