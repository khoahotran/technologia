import { beforeEach, describe, expect, it, vi } from "vitest";

import { getAdminActionLogById, getAdminActionLogs } from "@/features/admin/api";

const getMock = vi.fn();

vi.mock("@/api/client", () => ({
    get: (...args: unknown[]) => getMock(...args),
    post: vi.fn(),
}));

describe("admin api contract", () => {
    beforeEach(() => {
        getMock.mockReset();
    });

    it("loads admin action logs from /api/admins/action-logs/filter", async () => {
        getMock.mockResolvedValue({
            status: 200,
            message: "ok",
            page_number: 0,
            page_size: 10,
            count_items: 1,
            count_pages: 1,
            data: [
                {
                    adminActionLogId: "log-1",
                    adminId: "admin-1",
                    action: "UPDATE_ORDER",
                    note: "updated status",
                    createdAt: "2026-05-07T10:00:00Z",
                    entityType: "ORDER",
                },
            ],
        });

        await getAdminActionLogs({ page: 0, size: 10, sortBy: "createdAt", sortDirection: "DESC" });

        expect(getMock).toHaveBeenCalledWith("/api/admins/action-logs/filter", {
            params: expect.objectContaining({
                page: 0,
                size: 10,
                sortBy: "createdAt",
                sortDirection: "DESC",
            }),
        });
    });

    it("loads admin action log detail from /api/admins/action-logs/by-id/{logId}", async () => {
        getMock.mockResolvedValue({
            status: 200,
            message: "ok",
            data: {
                adminActionLogId: "log-1",
                adminId: "admin-1",
                action: "CREATE_PRODUCT",
                note: "created product",
                createdAt: "2026-05-07T10:00:00Z",
                entityType: "PRODUCT",
            },
        });

        await getAdminActionLogById("log-1");
        expect(getMock).toHaveBeenCalledWith("/api/admins/action-logs/by-id/log-1");
    });
});
