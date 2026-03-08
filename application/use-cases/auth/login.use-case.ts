/**
 * UseCase Đăng nhập (Login Use-Case)
 *
 * Điều phối toàn bộ luồng đăng nhập của người dùng:
 *  1. Gọi API login thông qua AuthRepository
 *  2. Lưu trữ token (access/refresh) vào LocalStorage/Cookie thông qua authStorage
 *  3. Cập nhật trạng thái người dùng vào useAuthStore (Zustand)
 *
 * Trả về một discriminated union (ok: true/false) để phía UI xử lý lưu loát mà không cần dùng try/catch.
 */

import { getErrorMessage } from "@/domain/errors";
import type { LoginDto } from "@/domain/user/dto/auth.dto";
import { authStorage } from "@/infrastructure/persistence/storage";
import { AuthRepository } from "@/infrastructure/repositories/auth/auth.repository";
import { useAuthStore } from "@/infrastructure/state/auth.store";
import type { UserProfile } from "@/infrastructure/state/store.types";
import { safe } from "@/shared/utils/result";

/** Kiểu dữ liệu trả về cho UI */
export type LoginResult =
    | { ok: true; userId: string | number }
    | { ok: false; error: string };

/**
 * Xử lý logic đăng nhập
 * Sử dụng pattern Go-style để xử lý lỗi gọn gàng.
 * @param credentials Dữ liệu từ form đăng nhập (tên người dùng và mật khẩu)
 */
export async function loginUseCase(credentials: LoginDto): Promise<LoginResult> {
    // 1. Gọi API login qua repo (Go-style handling)
    const [response, error] = await safe(AuthRepository.login(credentials));

    if (error) {
        return { ok: false, error: getErrorMessage(error) };
    }

    // 2. Lưu tokens vào bộ nhớ bền vững (Storage)
    authStorage.setTokens(response!.token, response!.refreshToken);

    // 3. Khởi tạo profile cơ bản để đưa vào Global State (Zustand)
    const profile: UserProfile = {
        userId: String(response!.userId),
        username: credentials.username,
        email: "",
    };

    // 4. Cập nhật State Management
    useAuthStore.getState().setUser(profile);

    return { ok: true, userId: response!.userId };
}
