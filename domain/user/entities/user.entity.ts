import { z } from "zod";

import { EmailSchema } from "../vo/email.vo";
import { PhoneNumberSchema } from "../vo/phone.vo";
import { UserRoleSchema } from "../vo/role.vo";
import { UserStatusSchema } from "../vo/status.vo";

import { BaseEntitySchema } from "@/shared/entities/base.entity";

export const UserEntitySchema = BaseEntitySchema.extend({
  userId: z.number(),
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
