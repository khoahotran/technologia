import z from "zod";

import { EntityType } from "../vo/entity-type.vo";

import { BaseEntitySchema } from "@/shared/entities/base.entity";

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
