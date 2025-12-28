import type { Meta, StoryObj } from "@storybook/react"
import { ProductCard } from "@/components/ui/product-card"

const meta = {
    title: "UI/ProductCard",
    component: ProductCard,
    parameters: {
        layout: "centered",
    },
    tags: ["autodocs"],
    argTypes: {
        variant: {
            control: "select",
            options: ["default", "compact", "selectable"],
        },
        title: { control: "text" },
        price: { control: "text" },
        rating: { control: "number", min: 0, max: 5 },
    },
} satisfies Meta<typeof ProductCard>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
    args: {
        title: "Premium Wireless Headphones",
        price: "$299.00",
        rating: 4,
        image: "https://placehold.co/400x400/png",
        variant: "default",
    },
}

export const Compact: Story = {
    args: {
        title: "Compact Camera",
        price: "$599.00",
        rating: 5,
        image: "https://placehold.co/400x400/png",
        variant: "compact",
    },
}

export const Selectable: Story = {
    args: {
        title: "Selected Item",
        price: "$199.00",
        rating: 3,
        image: "https://placehold.co/400x400/png",
        variant: "selectable",
        isSelected: true,
    },
}
