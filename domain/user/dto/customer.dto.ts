import { z } from "zod";

/** Schema payload for explicitly creating a generic Customer profile */
export const CreateCustomerDtoSchema = z.object({
  /** Customer's public display name */
  displayName: z.string(),
  /** Platform logged in from */
  loginType: z.enum(["PASSWORD", "GOOGLE", "FACEBOOK"]).optional(),
});

export type CreateCustomerDto = z.infer<typeof CreateCustomerDtoSchema>;

/** Schema payload for patching a Customer profile */
export const UpdateCustomerDtoSchema = z.object({
  displayName: z.string().optional(),
  loginType: z.enum(["PASSWORD", "GOOGLE", "FACEBOOK"]).optional(),
});

export type UpdateCustomerDto = z.infer<typeof UpdateCustomerDtoSchema>;
