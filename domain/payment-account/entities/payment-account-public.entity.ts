import type { z } from "zod";

import { PaymentAccountEntitySchema } from "./payment-account.entity";

export const PaymentAccountPublicSchema = PaymentAccountEntitySchema.omit({
  userId: true,
});

export type PaymentAccountPublic = z.infer<typeof PaymentAccountPublicSchema>;
