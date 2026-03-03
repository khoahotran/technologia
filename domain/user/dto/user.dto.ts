import { z } from "zod";

import { EmailSchema } from "../vo/email.vo";
import { PhoneNumberSchema } from "../vo/phone.vo";

/** Schema defining payload for creating a general User (Admin functionality) */
export const CreateUserDtoSchema = z.object({
  /** Desired login username */
  username: z.string(),
  /** Raw password to be hashed strictly on the backend */
  password: z.string(),
  /** Strictly validated VO phone number */
  phoneNumber: PhoneNumberSchema,
  /** Strictly validated VO email */
  email: EmailSchema,
  firstName: z.string(),
  lastName: z.string(),
  /** Optional profile picture URL */
  imageUrl: z.url().nullable().optional(),
  /** Targeted Role to assign */
  role: z.enum(["ADMIN", "CUSTOMER"]),
});

export type CreateUserDto = z.infer<typeof CreateUserDtoSchema>;

/** Schema defining payload for updating user information globally */
export const UpdateUserDtoSchema = z.object({
  username: z.string().optional(),
  password: z.string().optional(),
  phoneNumber: PhoneNumberSchema.optional(),
  email: EmailSchema.optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  imageUrl: z.url().nullable().optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "BANNED"]).optional(),
});

export type UpdateUserDto = z.infer<typeof UpdateUserDtoSchema>;