import { beforeEach, describe, expect, it, vi } from "vitest";

import { addVariantImageAdmin } from "@/features/products/api";

const postMock = vi.fn();

vi.mock("@/api/client", () => ({
    get: vi.fn(),
    post: (...args: unknown[]) => postMock(...args),
    put: vi.fn(),
    patch: vi.fn(),
    del: vi.fn(),
}));

describe("products admin upload contract", () => {
    beforeEach(() => {
        postMock.mockReset();
    });

    it("uploads variant image with multipart payload", async () => {
        postMock.mockResolvedValue({ status: 200, message: "ok", data: {} });
        const file = new File(["image"], "sample.png", { type: "image/png" });

        await addVariantImageAdmin("product-1", "variant-1", file);

        expect(postMock).toHaveBeenCalledTimes(1);
        expect(postMock).toHaveBeenCalledWith(
            "/api/products/admin/product-1/variant/variant-1/image",
            expect.any(FormData)
        );
    });
});
