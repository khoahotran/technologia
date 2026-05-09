import { z } from "zod";

import { env } from "@/config/env";
import { logger } from "@/utils/logger";

const ChatResponseSchema = z.object({
    reply: z.string(),
});

const AI_REQUEST_TIMEOUT_MS = 30000; // Tăng lên 30s vì AI/LLM có thể phản hồi chậm
const AI_RETRY_COUNT = 2; // Tăng số lần thử lại

async function requestJson<T>({
    path,
    payload,
    parser,
    retries = AI_RETRY_COUNT,
}: {
    path: string;
    payload: unknown;
    parser: (data: unknown) => T;
    retries?: number;
}): Promise<T> {
    let lastError: unknown = null;

    for (let attempt = 0; attempt <= retries; attempt++) {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), AI_REQUEST_TIMEOUT_MS);

        try {
            const isServer = typeof window === "undefined";
            const baseURL = isServer ? env.aiAgentUrl : "";
            const finalUrl = `${baseURL}${path}`;

            // Log for debugging (only visible in server logs if isServer is true, 
            // or browser console if isServer is false)
            logger.debug(`[AI Request] ${isServer ? 'Server-side' : 'Client-side'} fetching: ${finalUrl}`);

            const response = await fetch(finalUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                },
                body: JSON.stringify(payload),
                signal: controller.signal,
            });

            if (!response.ok) {
                // Nếu lỗi 500 (như DB timeout), ném lỗi để vòng lặp retry xử lý
                throw new Error(`AI request failed with status ${response.status}`);
            }

            const json = await response.json();
            return parser(json);
        } catch (error) {
            lastError = error;
            console.warn(`AI request attempt ${attempt + 1} failed:`, error);

            if (attempt === retries) throw error;

            // Chờ một chút trước khi thử lại (exponential backoff nhẹ)
            await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
        } finally {
            clearTimeout(timeout);
        }
    }

    throw lastError instanceof Error ? lastError : new Error("Unknown AI request failure");
}

export async function chatWithAgent(payload: {
    sessionId: string;
    message: string;
    customerId?: string | null;
}): Promise<string> {
    const result = await requestJson({
        path: "/api/agent/chat",
        payload: {
            session_id: payload.sessionId,
            message: payload.message,
            customer_id: payload.customerId ?? null,
        },
        parser: (data) => ChatResponseSchema.parse(data).reply,
    });

    return result;
}

export async function notifyPurchase(payload: {
    customerId: string;
    variantId: string;
    amount: number;
}): Promise<void> {
    await requestJson({
        path: "/api/agent/purchase",
        payload: {
            customer_id: payload.customerId,
            variant_id: payload.variantId,
            amount: payload.amount,
        },
        parser: () => undefined,
    });
}
