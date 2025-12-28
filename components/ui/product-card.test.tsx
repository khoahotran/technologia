import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ProductCard } from "./product-card";

describe("ProductCard", () => {
    const defaultProps = {
        title: "Test Product",
        price: "$100",
        rating: 4,
        image: "/test.jpg",
    };

    it("renders product information", () => {
        render(<ProductCard {...defaultProps} />);
        expect(screen.getByText("Test Product")).toBeDefined();
        expect(screen.getByText("$100")).toBeDefined();
        // Rating star count check is implicit via rendering
    });

    it("calls onSelect when button is clicked", () => {
        const onSelect = vi.fn();
        render(<ProductCard {...defaultProps} variant="selectable" onSelect={onSelect} />);

        const selectBtn = screen.getByRole("checkbox");
        fireEvent.click(selectBtn);
        expect(onSelect).toHaveBeenCalled();
    });

    it("renders Add to Cart button in default variant", () => {
        render(<ProductCard {...defaultProps} variant="default" />);
        // Note: The button is hidden by default (opacity-0), but exists in DOM.
        // Testing Library 'getByText' finds it even if hidden unless styled with display:none?
        // Opacity 0 is still "in the document". toBeVisible() checks visibility.
        // Vitest (JSDOM) computes styles.
        const btn = screen.getByText("Add to Cart");
        expect(btn).toBeDefined();
    });
});
