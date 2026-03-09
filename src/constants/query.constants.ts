/**
 * Hằng số Cấu hình TanStack Query (Query Configuration Constants)
 * Định nghĩa các chiến lược bộ nhớ đệm (caching) cho nhiều loại dữ liệu khác nhau.
 */

export const QUERY_CONFIG = {
    /** Dữ liệu động thay đổi thường xuyên (Cart, User Status) */
    DYNAMIC: {
        staleTime: 0,
        gcTime: 5 * 60 * 1000, // 5 phút
    },

    /** Dữ liệu tiêu chuẩn (Products, Orders) */
    STANDARD: {
        staleTime: 5 * 60 * 1000, // 5 phút
        gcTime: 15 * 60 * 1000, // 15 phút
    },

    /** Dữ liệu tĩnh hiếm khi thay đổi (Brands, Categories, Config) */
    STATIC: {
        staleTime: 24 * 60 * 60 * 1000, // 24 giờ
        gcTime: 48 * 60 * 60 * 1000, // 48 giờ
    },

    /** Bộ nhớ đệm ngắn hạn cho các trạng thái giao diện (UI) */
    UI: {
        staleTime: 10 * 1000, // 10 giây
        gcTime: 60 * 1000, // 1 phút
    }
} as const;
