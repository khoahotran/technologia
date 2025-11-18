import { z } from "zod";

export const CreateCustomerDtoSchema = z.object({
  displayName: z.string(),
  loginType: z.enum(["PASSWORD", "GOOGLE", "FACEBOOK"]).optional(),
});

export type CreateCustomerDto = z.infer<typeof CreateCustomerDtoSchema>;

export const UpdateCustomerDtoSchema = z.object({
  displayName: z.string().optional(),
  loginType: z.enum(["PASSWORD", "GOOGLE", "FACEBOOK"]).optional(),
});

export type UpdateCustomerDto = z.infer<typeof UpdateCustomerDtoSchema>;
