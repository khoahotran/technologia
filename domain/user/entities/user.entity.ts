import { z } from "zod";
import { BaseEntitySchema } from "@/shared/entities/base.entity";
import { EmailSchema } from "../value-objects/email.vo";
import { PhoneNumberSchema } from "../value-objects/phone.vo";
import { UserStatusSchema } from "../value-objects/status.vo";
import { UserRoleSchema } from "../value-objects/role.vo";

export const UserEntitySchema = BaseEntitySchema.extend({
  userId: z.string(),
  username: z.string(),
  passwordHash: z.string(),

  phoneNumber: PhoneNumberSchema,
  email: EmailSchema,

  firstName: z.string(),
  lastName: z.string(),

  imageUrl: z.url().nullable().optional(),

  status: UserStatusSchema,
  role: UserRoleSchema,
});

export type UserEntity = z.infer<typeof UserEntitySchema>;
