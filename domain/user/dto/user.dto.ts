import { z } from "zod";

import { EmailSchema } from "../vo/email.vo";
import { PhoneNumberSchema } from "../vo/phone.vo";

export const CreateUserDtoSchema = z.object({
  username: z.string(),
  password: z.string(),
  phoneNumber: PhoneNumberSchema,
  email: EmailSchema,
  firstName: z.string(),
  lastName: z.string(),
  imageUrl: z.url().nullable().optional(),
  role: z.enum(["ADMIN", "CUSTOMER"]),
});

export type CreateUserDto = z.infer<typeof CreateUserDtoSchema>;

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
  