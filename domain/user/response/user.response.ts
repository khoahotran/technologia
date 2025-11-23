import { createSuccessResponseSchema } from "@/shared/response/response.dto";
import { z } from "zod";
import { AddressEntitySchema } from "../entities/address.entity";
import { AdminEntitySchema } from "../entities/admin.entity";
import { CustomerEntitySchema } from "../entities/customer.entity";
import { UserPublicSchema } from "../entities/user-public.entity";
import { UserEntitySchema } from "../entities/user.entity";


// --------------------------------------------------
// 1. Single User response (base user)
// --------------------------------------------------
export const UserResponseSchema = createSuccessResponseSchema(UserEntitySchema);
export type UserResponse = z.infer<typeof UserResponseSchema>;

// --------------------------------------------------
// 2. Single Customer response (User + Customer info + Address list)
// --------------------------------------------------
export const CustomerFullResponseSchema = createSuccessResponseSchema(
  z.object({
    user: UserEntitySchema,
    customer: CustomerEntitySchema,
    addresses: z.array(AddressEntitySchema),
  })
);
export type CustomerFullResponse = z.infer<typeof CustomerFullResponseSchema>;

// --------------------------------------------------
// 3. Single Admin response (User + Admin info)
// --------------------------------------------------
export const AdminFullResponseSchema = createSuccessResponseSchema(
  z.object({
    user: UserEntitySchema,
    admin: AdminEntitySchema,
  })
);
export type AdminFullResponse = z.infer<typeof AdminFullResponseSchema>;

// --------------------------------------------------
// 4. Paginated Users (mixed list)
// --------------------------------------------------
export const PaginatedUsersResponseSchema = createSuccessResponseSchema(
  z.object({
    data: z.array(UserEntitySchema),
    pagination: z.object({
      currentPage: z.number(),
      totalItems: z.number(),
      hasNextPage: z.boolean(),
      hasPreviousPage: z.boolean(),
      limit: z.number(),
    }),
  })
);

export type PaginatedUsersResponse = z.infer<typeof PaginatedUsersResponseSchema>;

export const UserPublicResponseSchema = createSuccessResponseSchema(
  UserPublicSchema
);

export type UserPublicResponse = z.infer<typeof UserPublicResponseSchema>;