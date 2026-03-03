/**
 * Kho lưu trữ Trạng thái Xác thực (Auth Store)
 *
 * Quản lý trạng thái đăng nhập toàn cục của ứng dụng bằng Zustand:
 * - Thông tin hồ sơ người dùng hiện tại (UserProfile)
 * - Trạng thái đã đăng nhập hay chưa (isAuthenticated)
 * - Trạng thái đang tải dữ liệu (isLoading)
 * 
 * Sử dụng Middleware 'persist' để duy trì trạng thái khi người dùng Refresh trình duyệt.
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { AuthStore, UserProfile } from "./store.types";

import { logger } from "@/lib/logger";

// ===========================================
// Store Implementation
// ===========================================

export const useAuthStore = create<AuthStore>()(
    persist(
        (set) => ({
            // Khởi tạo State mặc định
            currentUser: null,
            isAuthenticated: false,
            isLoading: false,

            // Actions - Các hàm thay đổi trạng thái

            /** Cập nhật thông tin User khi đăng nhập thành công */
            setUser: (user: UserProfile) => {
                set({ currentUser: user, isAuthenticated: true, isLoading: false });
                // Ghi log hành động đăng nhập để theo dõi (audit log)
                logger.action("LOGIN", { userId: user.userId });
            },

            /** Xóa sạch thông tin User khi đăng xuất hoặc token hết hạn */
            clearUser: () => {
                set({ currentUser: null, isAuthenticated: false, isLoading: false });
                logger.action("LOGOUT", {});
            },

            /** Cập nhật trạng thái chờ xử lý (Loading) */
            setLoading: (loading: boolean) => {
                set({ isLoading: loading });
            },
        }),
        {
            // Cấu hình Persistence (lưu vào localStorage)
            name: "auth-storage",
            // Chỉ lưu một phần state cần thiết (currentUser, isAuthenticated)
            // Tránh lưu các state tạm thời như isLoading
            partialize: (state) => ({
                currentUser: state.currentUser,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
);

// ===========================================
// Selectors - Các hàm lọc dữ liệu từ Store
// Giúp tối ưu hóa việc Render lại linh kiện (Re-render)
// ===========================================

export const selectCurrentUser = (state: AuthStore) => state.currentUser;
export const selectIsAuthenticated = (state: AuthStore) => state.isAuthenticated;
export const selectIsLoading = (state: AuthStore) => state.isLoading;

// ===========================================
// Hooks - Giao diện thân thiện để linh kiện UI sử dụng
// ===========================================

/**
 * Hook tiện ích để truy cập nhanh các thông tin Auth trong React Components
 * 
 * @example
 * const { currentUser, logout } = useAuth();
 */
export function useAuth() {
    const currentUser = useAuthStore(selectCurrentUser);
    const isAuthenticated = useAuthStore(selectIsAuthenticated);
    const isLoading = useAuthStore(selectIsLoading);
    const setUser = useAuthStore((state) => state.setUser);
    const clearUser = useAuthStore((state) => state.clearUser);
    const setLoading = useAuthStore((state) => state.setLoading);

    return {
        currentUser,
        isAuthenticated,
        isLoading,
        setUser,
        clearUser,
        setLoading,
    };
}
