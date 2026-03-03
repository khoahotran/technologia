import { z } from "zod";

/** Bản phác thảo ánh xạ từ API `/profile/me` của User Service */
export const UserProfileSchema = z.object({
    /** Backend trả về kiểu Long, được xử lý linh hoạt là string hoặc number */
    userId: z.union([z.string(), z.number()]),
    /** Tên đăng nhập duy nhất */
    username: z.string(),
    firstName: z.string().nullable(),
    lastName: z.string().nullable(),
    /** Kiểm chuẩn định dạng email nghiêm ngặt */
    email: z.string().email(),
    phoneNumber: z.string().nullable(),
    imageUrl: z.string().nullable(),
    displayName: z.string().nullable(),
    /** Vai trò kế thừa từ User (VD: CUSTOMER, ADMIN) */
    role: z.string().optional()
});
export type UserProfileDto = z.infer<typeof UserProfileSchema>;

/** Bản phác thảo cấu trúc dữ liệu khi người dùng cập nhật hồ sơ cá nhân */
export const UpdateProfileSchema = z.object({
    firstname: z.string(),
    lastname: z.string(),
    email: z.string().email(),
    /** Số điện thoại được xử lý dạng chuỗi linh hoạt */
    phoneNumber: z.string(),
    displayName: z.string()
});
export type UpdateProfileDto = z.infer<typeof UpdateProfileSchema>;

/** Bản phác thảo xác thực cho yêu cầu đổi mật khẩu */
export const ChangePasswordSchema = z.object({
    /** Mật khẩu cũ để xác minh danh tính */
    oldPassword: z.string(),
    /** Mật khẩu mới cần thiết lập (thường cần thêm logic validate độ phức tạp) */
    newPassword: z.string()
});
export type ChangePasswordDto = z.infer<typeof ChangePasswordSchema>;
