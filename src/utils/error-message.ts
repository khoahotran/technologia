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
        return error.message;
    }
    if (error instanceof Error && error.message.trim()) {
        const mappedKey = ERROR_MAP[error.message];
        if (mappedKey) return mappedKey;
        return error.message;
    }
    return fallbackKey;
}

export function isSessionExpiredError(error: unknown) {
    return error instanceof AppError && error.statusCode === 401;
}
