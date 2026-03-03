import { z } from "zod";

/** Schema payload for creating a new user address */
export const CreateAddressDtoSchema = z.object({
  customerId: z.string(),
  province: z.string(),
  city: z.string(),
  ward: z.string(),
  street: z.string(),
  no: z.string(),
});

export type CreateAddressDto = z.infer<typeof CreateAddressDtoSchema>;
