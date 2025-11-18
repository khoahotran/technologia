import z from "zod";

export const UpdatePaymentAccountDtoSchema = z.object({
  name: z.string().optional(),
  bankName: z.string().optional(),
  type: z.enum(["bank", "ewallet", "card"]).optional(),
  number: z.string().optional(),
  status: z.enum(["active", "inactive"]).optional(),
  isDefault: z.boolean().optional(),
});

export type UpdatePaymentAccountDto = z.infer<typeof UpdatePaymentAccountDtoSchema>;
