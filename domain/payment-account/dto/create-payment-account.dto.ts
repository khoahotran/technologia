import z from "zod";

export const CreatePaymentAccountDtoSchema = z.object({
  name: z.string(),
  bankName: z.string(),
  type: z.enum(["bank", "ewallet", "card"]),
  number: z.string(),
  isDefault: z.boolean().optional().default(false),
});

export type CreatePaymentAccountDto = z.infer<typeof CreatePaymentAccountDtoSchema>;
