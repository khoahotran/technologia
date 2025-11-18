import { z } from "zod";

export const CreateAddressDtoSchema = z.object({
  customerId: z.string(),
  province: z.string(),
  city: z.string(),
  ward: z.string(),
  street: z.string(),
  no: z.string(),
});

export type CreateAddressDto = z.infer<typeof CreateAddressDtoSchema>;
