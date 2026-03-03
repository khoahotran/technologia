import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import ShippingClient from "../ShippingClient";

import * as PresentationHooks from "@/presentation/hooks";

const mockRefetch = vi.fn();

vi.mock("next/navigation", () => ({
    useRouter: () => ({
        push: vi.fn(),
    }),
    useSearchParams: () => ({
        get: vi.fn(() => null),
    }),
}));

vi.mock("@/lib/checkout-flow", () => ({
    addCheckoutOrder: vi.fn(),
    getCheckoutAddresses: vi.fn(() => []),
}));

vi.mock("@/presentation/hooks", () => ({
    useCartQuery: vi.fn(),
    useCartPriceMutation: vi.fn(() => ({
        mutate: vi.fn(),
        data: undefined,
    })),
    useRemoveCartItemMutation: vi.fn(() => ({
        mutate: vi.fn(),
    })),
}));

describe("ShippingClient", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockRefetch.mockClear();
    });

    it("shows backend error state and allows retry", () => {
        vi.mocked(PresentationHooks.useCartQuery).mockReturnValue({
            data: undefined,
            isLoading: false,
            isError: true,
            refetch: mockRefetch,
        } as any);

        render(<ShippingClient />);

        expect(screen.getByText("Cannot load checkout data from backend.")).toBeInTheDocument();
        fireEvent.click(screen.getByRole("button", { name: "Retry" }));
        expect(mockRefetch).toHaveBeenCalledTimes(1);
    });
});
