import { beforeEach, describe, expect, it, vi } from "vitest";

import { chatWithAgent, notifyPurchase } from "@/features/ai/api";

const fetchMock = vi.fn();

describe("ai api contract", () => {
    beforeEach(() => {
        fetchMock.mockReset();
        vi.stubGlobal("fetch", fetchMock);
    });

    it("calls chat endpoint with REST json payload and returns reply", async () => {
        fetchMock.mockResolvedValue({
            ok: true,
            status: 200,
            json: async () => ({ reply: "hello" }),
        });

        const reply = await chatWithAgent({
            sessionId: "session-1",
            message: "Hi",
            customerId: "customer-1",
        });

        expect(reply).toBe("hello");
        expect(fetchMock).toHaveBeenCalledWith(
            expect.stringContaining("/api/agent/chat"),
            expect.objectContaining({
                method: "POST",
                headers: expect.objectContaining({ "Content-Type": "application/json" }),
            })
        );
    });

    it("calls purchase endpoint with REST json payload", async () => {
        fetchMock.mockResolvedValue({
            ok: true,
            status: 200,
            json: async () => ({}),
        });

        await notifyPurchase({
            customerId: "customer-1",
            variantId: "variant-1",
            amount: 2,
        });

        expect(fetchMock).toHaveBeenCalledWith(
            expect.stringContaining("/api/agent/purchase"),
            expect.objectContaining({
                method: "POST",
                headers: expect.objectContaining({ "Content-Type": "application/json" }),
            })
        );
    });
});
