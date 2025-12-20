"use client";

import { Loader2 } from "lucide-react";

import { useProductHook } from "@/presentation/hooks/use-product.hook";

export default function ProductListView() {
    const { productsQuery } = useProductHook();
    const { data: products, isLoading, isError } = productsQuery;

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex h-screen items-center justify-center text-red-500">
                Failed to load products. Ensure the Mock API is enabled or Backend is running.
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8 dark:bg-zinc-900">
            <div className="mx-auto max-w-7xl">
                <header className="mb-12 text-center">
                    <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
                        Our Premium Products
                    </h1>
                    <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
                        Clean Architecture • React Query • Efficient Caching
                    </p>
                </header>

                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                    {products?.map((product) => (
                        <div
                            key={product.productId}
                            className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md dark:bg-zinc-800"
                        >
                            <div className="mb-4 flex items-center justify-between">
                                <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                                    New Arrival
                                </span>
                                <span className="text-lg font-bold text-gray-900 dark:text-white">
                                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: product.price.currency }).format(product.price.amount)}
                                </span>
                            </div>

                            <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">
                                {product.name}
                            </h3>

                            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
                                {product.description || "Experience the quality of our premium product line."}
                            </p>

                            <button className="w-full rounded-xl bg-gray-900 py-3 font-semibold text-white transition-colors hover:bg-gray-700 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200">
                                Add to Cart
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
