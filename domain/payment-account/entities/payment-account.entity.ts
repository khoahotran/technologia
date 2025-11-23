import { BaseEntitySchema } from "@/shared/entities/base.entity";
import z from "zod";
import { AccountNumberVO } from "../vo/account-number.vo";

export const PaymentAccountEntitySchema = BaseEntitySchema.extend({
  pAccountId: z.string(),
  name: z.string(),
  bankName: z.string(),
  type: z.enum(["bank", "ewallet", "card"]),
  status: z.enum(["active", "inactive"]),
  number: AccountNumberVO,
  isDefault: z.boolean(),
  userId: z.string(),
});

export type PaymentAccountEntity = z.infer<typeof PaymentAccountEntitySchema>;
