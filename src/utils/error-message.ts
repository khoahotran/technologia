import { AppError } from "@/api/client";

const ERROR_MAP: Record<string, string> = {
    "Product is temporary out of stock!": "err_product_out_of_stock",
    "Category is exists!": "admin_category_exists",
    "Brand is exists!": "admin_brand_exists",
};

export function toErrorMessage(error: unknown, fallbackKey = "err_request_failed") {
    if (error instanceof AppError) {
        const mappedKey = ERROR_MAP[error.message];
        if (mappedKey) return mappedKey;
        // If it's a technical error (like SQL or constraint), return fallback
        if (error.message.includes("could not execute batch") || error.message.includes("violates foreign key constraint")) {
            return fallbackKey;
        }
        return error.message;
    }
    if (error instanceof Error && error.message.trim()) {
        const mappedKey = ERROR_MAP[error.message];
        if (mappedKey) return mappedKey;
        if (error.message.includes("could not execute batch") || error.message.includes("violates foreign key constraint")) {
            return fallbackKey;
        }
        return error.message;
    }
    return fallbackKey;
}

export function isSessionExpiredError(error: unknown) {
    return error instanceof AppError && error.statusCode === 401;
}

export function isLinkedProductError(error: unknown): boolean {
    if (error instanceof AppError) {
        if (error.statusCode === 409) return true;
        const msg = error.message.toLowerCase();
        return msg.includes("product") || msg.includes("sản phẩm") || msg.includes("linked") || msg.includes("associated");
    }
    if (error instanceof Error) {
        const msg = error.message.toLowerCase();
        return msg.includes("product") || msg.includes("sản phẩm") || msg.includes("linked") || msg.includes("associated");
    }
    return false;
}
