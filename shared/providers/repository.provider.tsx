"use client";

/**
 * Provider Quản lý Context Repository (Dependency Injection)
 * 
 * Hướng tiếp cận Dependency Injection Pattern dành cho React Frontend.
 * Giúp cô lập các Components và Use-Cases khỏi các triển khai Repository tĩnh (Hard-coded Repos).
 * Lợi ích: Dễ dàng hoán đổi sang MockRepositories khi chạy Unit Test / Storybook
 * mà không cần viết mã giả (jest.mock) quá nhiều.
 */

import { createContext, useContext, ReactNode } from "react";

import type { IBrandRepository } from "@/domain/product/repositories/brand.repository.interface";
import type { ICategoryRepository } from "@/domain/product/repositories/category.repository.interface";
import type { IProductRepository } from "@/domain/product/repositories/product.repository.interface";
import { BrandRepository } from "@/infrastructure/repositories/product/brand.repository";
import { CategoryRepository } from "@/infrastructure/repositories/product/category.repository";
import { ProductRepository } from "@/infrastructure/repositories/product/product.repository";

/** Các loại Repository chung nằm trong Provider */
interface IRepositoryContext {
    productRepository: IProductRepository;
    brandRepository: IBrandRepository;
    categoryRepository: ICategoryRepository;
}

const RepositoryContext = createContext<IRepositoryContext | null>(null);

export interface RepositoryProviderProps {
    children: ReactNode;
    /** Cung cấp danh sách các Repository giả lập (dùng trong việc Test) */
    mockRepositories?: Partial<IRepositoryContext>;
}

export function RepositoryProvider({ children, mockRepositories }: RepositoryProviderProps) {
    // Nếu mockRepositories được truyền vào, ta sẽ dùng nó (ưu tiên ghi đè).
    // Ngược lại, ta import và dùng implement thực tế từ Infrastructure Layer.
    const repositories: IRepositoryContext = {
        productRepository: mockRepositories?.productRepository ?? ProductRepository,
        brandRepository: mockRepositories?.brandRepository ?? BrandRepository,
        categoryRepository: mockRepositories?.categoryRepository ?? CategoryRepository,
    };

    return (
        <RepositoryContext.Provider value={repositories}>
            {children}
        </RepositoryContext.Provider>
    );
}

/**
 * Hook tiêu chuẩn giúp các use-cases lấy Repository ra để sử dụng
 */
export function useRepositories() {
    const context = useContext(RepositoryContext);
    if (!context) {
        throw new Error("useRepositories phải được đặt bên trong <RepositoryProvider />");
    }
    return context;
}
