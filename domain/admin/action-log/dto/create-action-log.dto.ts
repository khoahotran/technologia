import z from "zod";

export const CreateAdminActionLogDtoSchema = z.object({
  entityType: z.string(),
  action: z.string(),
  note: z.string().nullable().optional(),
  adminId: z.string(),
});

export type CreateAdminActionLogDto = z.infer<
  typeof CreateAdminActionLogDtoSchema
>;
