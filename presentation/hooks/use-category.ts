/**
 * Category-related hooks
 */

"use client";

import { useQuery } from "@tanstack/react-query";

import { CategoryRepository } from "@/infrastructure/repositories/product/category.repository";

export function useCategories() {
    return useQuery({
        queryKey: ["categories"],
        queryFn: () => CategoryRepository.getAll(),
        staleTime: 24 * 60 * 60 * 1000, // Categories change rarely
    });
}
