/**
 * Logout Use-Case
 *
 * Điều phối toàn bộ luồng đăng xuất của người dùng:
 *  1. Gọi API logout thông qua AuthRepository (Cố gắng hết sức - không throw error nếu server lỗi)
 *  2. Xóa sạch tokens khỏi Storage (LocalStorage/Cookie)
 *  3. Reset Global Auth Store (Zustand) về trạng thái mặc định
 */

import { authStorage } from "@/infrastructure/persistence/storage";
import { useAuthStore } from "@/infrastructure/state/auth.store";
import { safe } from "@/shared/utils/result";

/**
 * Handle logic đăng xuất
 */
export async function logoutUseCase(): Promise<void> {
    // 1. Thực hiện vô hiệu hóa session bên phía Server (Cố gắng tốt nhất)
    const refreshToken = authStorage.getRefreshToken();

    if (refreshToken) {
        const { AuthRepository } = await import("@/infrastructure/repositories/auth/auth.repository");
        // Gọi logout và bỏ qua kết quả lỗi nếu có
        await safe(AuthRepository.logout(refreshToken));
    }

    // Xóa sạch thông tin đăng nhập ở Client
    // 1. Xóa Tokens
    authStorage.clearTokens();

    // 2. Xóa Profile trong Global State
    useAuthStore.getState().clearUser();
}
