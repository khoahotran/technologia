/**
 * Brand-related hooks
 */

"use client";

import { useQuery } from "@tanstack/react-query";

import { useRepositories } from "@/shared/providers/repository.provider";

export function useBrands() {
    const { brandRepository } = useRepositories();

    return useQuery({
        queryKey: ["brands"],
        queryFn: () => brandRepository.getAll(),
        staleTime: 24 * 60 * 60 * 1000, // Brands change rarely
    });
}
