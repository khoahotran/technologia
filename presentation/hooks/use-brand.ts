/**
 * Brand-related hooks
 */

"use client";

import { useQuery } from "@tanstack/react-query";

import { BrandRepository } from "@/infrastructure/repositories/product/brand.repository";

export function useBrands() {
    return useQuery({
        queryKey: ["brands"],
        queryFn: () => BrandRepository.getAll(),
        staleTime: 24 * 60 * 60 * 1000, // Brands change rarely
    });
}
