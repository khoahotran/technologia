import type { z } from "zod";

import { UserEntitySchema } from "./user.entity";

/**
 * Bản phác thảo Người dùng Công khai (User Public Schema)
 * 
 * Phiên bản an toàn của User Entity, lược bỏ các trường nhạy cảm (như passwordHash)
 * để đảm bảo an toàn khi truyền tải dữ liệu hoặc hiển thị ra giao diện.
 */
export const UserPublicSchema = UserEntitySchema.omit({
  passwordHash: true,
});

/** Kiểu dữ liệu TypeScript cho dữ liệu người dùng đã được lược bỏ thông tin nhạy cảm */
export type UserPublic = z.infer<typeof UserPublicSchema>;
