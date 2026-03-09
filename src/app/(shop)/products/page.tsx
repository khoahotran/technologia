import type { Metadata } from "next";
import { Suspense } from "react";

import { ProductListView } from "./ProductListView";

export const metadata: Metadata = {
    title: "Premium Products | My Store",
    description: "Browse our exclusive collection of high-quality products. Best prices and fast shipping.",
    openGraph: {
        title: "Premium Products | My Store",
        description: "Browse our exclusive collection of high-quality products.",
        images: ["/og-products.jpg"],
    },
};

export default function ProductsPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ProductListView />
        </Suspense>
    );
}
