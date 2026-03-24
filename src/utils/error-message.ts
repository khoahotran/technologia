import { AppError } from "@/api/client";

export function toErrorMessage(error: unknown, fallback = "Request failed") {
    if (error instanceof AppError) return error.message;
    if (error instanceof Error && error.message.trim()) return error.message;
    return fallback;
}

export function isSessionExpiredError(error: unknown) {
    return error instanceof AppError && error.statusCode === 401;
}
