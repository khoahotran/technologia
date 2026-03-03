/**
 * Login Use-Case
 *
 * Điều phối toàn bộ luồng đăng nhập của người dùng:
 *  1. Gọi API login thông qua AuthRepository
 *  2. Lưu trữ token (access/refresh) vào LocalStorage/Cookie thông qua authStorage
 *  3. Cập nhật trạng thái người dùng vào useAuthStore (Zustand)
 *
 * Trả về một discriminated union (ok: true/false) để phía UI xử lý mà không cần dùng try/catch.
 */

import { AuthRepository } from "@/infrastructure/repositories/auth/auth.repository";
import { authStorage } from "@/infrastructure/persistence/storage";
import { useAuthStore } from "@/infrastructure/state/auth.store";
import { getErrorMessage } from "@/domain/errors";
import type { LoginDto } from "@/domain/user/dto/auth.dto";
import type { UserProfile } from "@/infrastructure/state/store.types";

/** Kiểu dữ liệu trả về cho UI */
export type LoginResult =
    | { ok: true; userId: string | number }
    | { ok: false; error: string };

/**
 * Handle logic đăng nhập
 * @param credentials Chứa email và password từ form
 */
export async function loginUseCase(credentials: LoginDto): Promise<LoginResult> {
    try {
        // Gọi repo để thực hiện request HTTP POST /login
        // AuthResponse shape: { token, refreshToken, userId }
        const response = await AuthRepository.login(credentials);

        // Lưu tokens vào bộ nhớ bền vững (Storage) để Axios interceptor có thể sử dụng cho các request sau
        authStorage.setTokens(response.token, response.refreshToken);

        // Khởi tạo profile cơ bản để đưa vào Global State (Zustand)
        // Thông tin chi tiết profile sẽ được fetch ở một hook/usecase khác (getProfile)
        const profile: UserProfile = {
            userId: String(response.userId),
            username: credentials.username, // Sử dụng username từ DTO thay vì email
            email: "", // Reset email, sẽ được fetch sau
        };

        // Cập nhật State Management để các component UI (Navbar, Profile) có thể phản ứng ngay lập tức
        useAuthStore.getState().setUser(profile);

        // Trả về kết quả thành công kèm ID người dùng
        return { ok: true, userId: response.userId };
    } catch (error) {
        // Nếu lỗi, parse message lỗi thân thiện từ Domain Errors và trả về cho UI
        return { ok: false, error: getErrorMessage(error) };
    }
}
