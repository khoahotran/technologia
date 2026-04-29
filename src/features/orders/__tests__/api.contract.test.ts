import { beforeEach, describe, expect, it, vi } from "vitest";

import { getAdminOrders, getDeliveryLogs, getOrderFeedbacks, getProductFeedbacks } from "@/features/orders/api";

const getMock = vi.fn();

vi.mock("@/api/client", () => ({
    get: (...args: unknown[]) => getMock(...args),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    del: vi.fn(),
}));

describe("orders api contract", () => {
    beforeEach(() => {
        getMock.mockReset();
    });

    it("loads admin orders from /api/orders/admin with status query", async () => {
        getMock.mockResolvedValue({
            status: 200,
            page_number: 0,
            page_size: 20,
            count_items: 1,
            count_pages: 1,
            message: "ok",
            data: [
                {
                    orderId: "o-1",
                    orderDate: "2026-04-12T10:00:00Z",
                    totalAmount: 1000,
                    deliveryStatus: "PENDING",
                    paymentMethod: "COD",
                    paymentAccountId: null,
                    addressId: "a-1",
                    customerId: "c-1",
                    updatedAt: "2026-04-12T10:00:00Z",
                    items: [],
                },
            ],
        });

        await getAdminOrders({ page: 0, size: 20, status: "PENDING" });

        expect(getMock).toHaveBeenCalledWith("/api/orders/admin", {
            params: expect.objectContaining({
                page: 0,
                size: 20,
                status: "PENDING",
            }),
        });
    });

    it("loads delivery logs from /api/delivery-logs/order/{orderId}", async () => {
        getMock.mockResolvedValue({
            status: 200,
            message: "ok",
            data: [
                {
                    deliveryLogId: "d-1",
                    orderId: "o-1",
                    status: "ON_SHIPPING",
                    message: "picked up",
                    createdAt: "2026-04-12T10:00:00Z",
                },
            ],
        });

        await getDeliveryLogs("o-1");

        expect(getMock).toHaveBeenCalledWith("/api/delivery-logs/order/o-1");
    });

    it("loads order and product feedback read endpoints", async () => {
        getMock
            .mockResolvedValueOnce({
                status: 200,
                message: "ok",
                data: [
                    {
                        orderItemId: "oi-1",
                        productId: "p-1",
                        variantId: "v-1",
                        rating: 5,
                        comment: "good",
                        createdAt: "2026-04-12T10:00:00Z",
                        updatedAt: "2026-04-12T10:00:00Z",
                    },
                ],
            })
            .mockResolvedValueOnce({
                status: 200,
                page_number: 0,
                page_size: 10,
                count_items: 1,
                count_pages: 1,
                message: "ok",
                data: [
                    {
                        orderItemId: "oi-1",
                        productId: "p-1",
                        variantId: "v-1",
                        rating: 5,
                        comment: "good",
                        createdAt: "2026-04-12T10:00:00Z",
                        updatedAt: "2026-04-12T10:00:00Z",
                    },
                ],
            });

        await getOrderFeedbacks("o-1");
        await getProductFeedbacks({ productId: "p-1", page: 0, size: 10 });

        expect(getMock).toHaveBeenNthCalledWith(1, "/api/orders/feedback/o-1");
        expect(getMock).toHaveBeenNthCalledWith(
            2,
            "/api/orders/feedback/product/p-1",
            { params: expect.objectContaining({ page: 0, size: 10 }) }
        );
    });
});

