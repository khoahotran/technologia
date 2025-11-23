import { z } from "zod";

export const AddressEntitySchema = z.object({
  addressId: z.string(),
  customerId: z.string(),
  province: z.string(),
  city: z.string(),
  ward: z.string(),
  street: z.string(),
  no: z.string(),
});

export type AddressEntity = z.infer<typeof AddressEntitySchema>;
