"use client";

import { createContext, useContext, ReactNode } from "react";
import { ProductRepository } from "@/infrastructure/repositories/product/product.repository";
import type { IProductRepository } from "@/domain/product/repositories/product.repository.interface";

interface IRepositoryContext {
    productRepository: IProductRepository;
}

const RepositoryContext = createContext<IRepositoryContext | null>(null);

export interface RepositoryProviderProps {
    children: ReactNode;
    mockRepositories?: Partial<IRepositoryContext>;
}

export function RepositoryProvider({ children, mockRepositories }: RepositoryProviderProps) {
    const repositories: IRepositoryContext = {
        productRepository: mockRepositories?.productRepository ?? ProductRepository,
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
