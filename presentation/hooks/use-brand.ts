/**
 * Hooks quản lý giao diện liên quan đến Thương hiệu (Brand-related hooks)
 */

"use client";

import { useQuery } from "@tanstack/react-query";

import { useRepositories } from "@/shared/providers/repository.provider";

/**
 * Hook `useBrands` hỗ trợ việc truy vấn lấy danh sách rợp toàn bộ các thương hiệu.
 * Phù hợp dùng để lấy cho các Select box hoặc danh sách bộ lọc.
 */
export function useBrands() {
    const { brandRepository } = useRepositories();

    // Dùng TanStack Query để caching + call dữ liệu
    return useQuery({
        // Gắn QueryKey tường minh mục đích cache quản lý
        queryKey: ["brands"],

        // Cung cấp hàm Promise Call (Trả về T or throws Error)
        queryFn: () => brandRepository.getAll(),

        // Thời gian tồn tại của Cached data là 24 giờ. 
        // Sở dĩ cache lâu vì list Brands rất hiếm khi thay đổi nhiều.
        staleTime: 24 * 60 * 60 * 1000,
    });
}
