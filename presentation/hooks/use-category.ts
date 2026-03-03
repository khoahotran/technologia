/**
 * Category-related hooks
 */

"use client";

import { useQuery } from "@tanstack/react-query";

import { useRepositories } from "@/shared/providers/repository.provider";

export function useCategories() {
    const { categoryRepository } = useRepositories();

    return useQuery({
        queryKey: ["categories"],
        queryFn: () => categoryRepository.getAll(),
        staleTime: 24 * 60 * 60 * 1000, // Categories change rarely
    });
}
