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

/**
 * Handle logic đăng xuất
 */
export async function logoutUseCase(): Promise<void> {
    // Thực hiện vô hiệu hóa session bên phía Server
    try {
        // Lấy refresh token hiện tại để gửi lên server hủy session
        const refreshToken = authStorage.getRefreshToken();

        // Import động để tránh lỗi tham chiếu chéo (Circular Dependency) trong các môi trường SSR/Node
        const { AuthRepository } = await import("@/infrastructure/repositories/auth/auth.repository");

        // Gọi repo để gửi request logout lên server kèm mã token để hủy
        if (refreshToken) {
            await AuthRepository.logout(refreshToken);
        }
    } catch {
        // Bỏ qua lỗi server nếu có - người dùng vẫn sẽ bị đăng xuất ở phía Client bằng mọi giá
    }

    // Xóa sạch thông tin đăng nhập ở Client
    // 1. Xóa Tokens
    authStorage.clearTokens();

    // 2. Xóa Profile trong Global State
    useAuthStore.getState().clearUser();
}
