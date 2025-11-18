import { PaymentAccountEntitySchema } from "./payment-account.entity";
import { z } from "zod";

export const PaymentAccountPublicSchema = PaymentAccountEntitySchema.omit({
  userId: true,
});

export type PaymentAccountPublic = z.infer<typeof PaymentAccountPublicSchema>;
