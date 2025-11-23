import { z } from "zod";
import { UserEntitySchema } from "./user.entity";

export const CustomerEntitySchema = UserEntitySchema.extend({
  displayName: z.string(),
  loginType: z.enum(["PASSWORD", "GOOGLE", "FACEBOOK"]).optional(),
  isDefault: z.boolean().optional(),
});

export type CustomerEntity = z.infer<typeof CustomerEntitySchema>;
