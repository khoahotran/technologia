/**
 * Hooks quản lý giao diện cho mảng Danh Mục Sản Phẩm (Category-related hooks)
 */

"use client";

import { useQuery } from "@tanstack/react-query";

import { useRepositories } from "@/shared/providers/repository.provider";

/**
 * Hook `useCategories` giúp phía Lớp Trình Bày dễ dàng truy cập full danh sách 
 * của toàn bộ các ngành hàng/chuyên mục. Phù hợp cho Component Menu Mega / Header list.
 */
export function useCategories() {
    const { categoryRepository } = useRepositories();

    return useQuery({
        queryKey: ["categories"], // Cache id
        queryFn: () => categoryRepository.getAll(),

        // Tương tự Brands, Categories ít thay đổi hệ thống cấu trúc. 
        // Lưu trữ lại kết quả cache trong vòng 24h để tăng tốc tải màn hình chung.
        staleTime: 24 * 60 * 60 * 1000,
    });
}
