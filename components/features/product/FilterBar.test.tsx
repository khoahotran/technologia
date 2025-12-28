import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { FilterBar } from "./FilterBar";
import * as navigation from "next/navigation";
import * as languageProvider from "../../../shared/providers/language.provider";

// Mock next/navigation
vi.mock("next/navigation", () => ({
    useRouter: vi.fn(),
    usePathname: vi.fn(),
    useSearchParams: vi.fn(),
}));

// Mock LanguageProvider
vi.mock("../../../shared/providers/language.provider", () => ({
    useLanguage: vi.fn(),
}));

describe("FilterBar", () => {
    const pushMock = vi.fn();
    const searchParams = new URLSearchParams();

    beforeEach(() => {
        vi.clearAllMocks();
        (navigation.useRouter as any).mockReturnValue({ push: pushMock });
        (navigation.usePathname as any).mockReturnValue("/products");
        (navigation.useSearchParams as any).mockReturnValue(searchParams);

        (languageProvider.useLanguage as any).mockReturnValue({
            locales: {
                filter_max_star: "Max Star",
                select_stars: "Select Stars",
                // Add other keys as fallback or mock full dictionary
            }
        });
    });

    it("renders filter options", () => {
        render(<FilterBar />);
        expect(screen.getByText("Max Star")).toBeDefined();
        expect(screen.getByText("Select Stars")).toBeDefined();
    });

    // Note: Testing Radix UI Select with Testing Library can be tricky due to portals.
    // We might just check if the trigger exists and mock the interactions if needed.
    // Or purely integration testing via E2E is better for complex UI interactions.
    // But we can check if the component renders without crashing.
});
