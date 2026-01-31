"use client";

import { createContext, useContext, ReactNode } from "react";

import type { IBrandRepository } from "@/domain/product/repositories/brand.repository.interface";
import type { ICategoryRepository } from "@/domain/product/repositories/category.repository.interface";
import type { IProductRepository } from "@/domain/product/repositories/product.repository.interface";
import { BrandRepository } from "@/infrastructure/repositories/product/brand.repository";
import { CategoryRepository } from "@/infrastructure/repositories/product/category.repository";
import { ProductRepository } from "@/infrastructure/repositories/product/product.repository";

interface IRepositoryContext {
    productRepository: IProductRepository;
    brandRepository: IBrandRepository;
    categoryRepository: ICategoryRepository;
}

const RepositoryContext = createContext<IRepositoryContext | null>(null);

export interface RepositoryProviderProps {
    children: ReactNode;
    mockRepositories?: Partial<IRepositoryContext>;
}

export function RepositoryProvider({ children, mockRepositories }: RepositoryProviderProps) {
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

export function useRepositories() {
    const context = useContext(RepositoryContext);
    if (!context) {
        throw new Error("useRepositories must be used within a RepositoryProvider");
    }
    return context;
}
