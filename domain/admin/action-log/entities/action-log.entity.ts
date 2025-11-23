import z from "zod";
import { BaseEntitySchema } from "@/shared/entities/base.entity";
import { EntityType } from "../vo/entity-type.vo";

export const AdminActionLogEntitySchema = BaseEntitySchema.extend({
  logId: z.string(),
  entityType: EntityType, 
  action: z.string(), 
  note: z.string().nullable().optional(),
  adminId: z.string(),
});

export type AdminActionLogEntity = z.infer<
  typeof AdminActionLogEntitySchema
>;
