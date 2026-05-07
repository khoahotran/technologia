import { z } from "zod";

import { env } from "@/config/env";

const ChatResponseSchema = z.object({
    reply: z.string(),
});

const AI_REQUEST_TIMEOUT_MS = 12000;
const AI_RETRY_COUNT = 1;

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
            const response = await fetch(`${env.aiAgentUrl}${path}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
                signal: controller.signal,
            });

            if (!response.ok) {
                throw new Error(`AI request failed with status ${response.status}`);
            }

            const json = await response.json();
            return parser(json);
        } catch (error) {
            lastError = error;
            if (attempt === retries) throw error;
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
