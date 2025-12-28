import { renderHook } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { useProduct } from "./use-product";
import { RepositoryProvider } from "../../../shared/providers/repository.provider";
import type { IProductRepository } from "../../../domain/product/repositories/product.repository.interface";
import type { ProductEntity } from "../../../domain/product/entities/product.entity";

describe("useProduct", () => {
    const mockProduct: ProductEntity = {
        productId: "1",
        name: "Test Product",
        price: { amount: 100, currency: "USD" },
        description: "Desc",
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: undefined,
    };

    const mockRepository: IProductRepository = {
        getAll: vi.fn().mockResolvedValue([mockProduct]),
        getById: vi.fn().mockResolvedValue(mockProduct),
        create: vi.fn().mockResolvedValue(mockProduct),
        update: vi.fn().mockResolvedValue(mockProduct),
        delete: vi.fn().mockResolvedValue(undefined),
    };

    it("should call getAll from repository", async () => {
        const wrapper = ({ children }: { children: React.ReactNode }) => (
            <RepositoryProvider mockRepositories={{ productRepository: mockRepository }}>
                {children}
            </RepositoryProvider>
        );

        const { result } = renderHook(() => useProduct(), { wrapper });

        const products = await result.current.getAll();
        expect(mockRepository.getAll).toHaveBeenCalled();
        expect(products).toEqual([mockProduct]);
    });

    it("should call create with correct dto", async () => {
        const wrapper = ({ children }: { children: React.ReactNode }) => (
            <RepositoryProvider mockRepositories={{ productRepository: mockRepository }}>
                {children}
            </RepositoryProvider>
        );

        const { result } = renderHook(() => useProduct(), { wrapper });

        const dto = { name: "New", price: { amount: 200, currency: "USD" }, description: "D" };
        await result.current.create(dto);
        expect(mockRepository.create).toHaveBeenCalledWith(dto);
    });
});
