"use client"

import { Ticket } from "lucide-react"
import { useState } from "react"

import { CartItem } from "@/components/features/cart/CartItem"
import { CartSummary } from "@/components/features/cart/CartSummary"
import { Subscribe } from "@/components/features/home/Subscribe"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"

export default function CartClient() {
    // Mock Data
    const [items, setItems] = useState([
        {
            id: "1",
            title: "IPHONE 12 128G",
            price: 13999999,
            image: "https://placehold.co/400x400/fef3c7/fef3c7",
            quantity: 1,
            isSelected: false,
        },
        {
            id: "2",
            title: "Sony WH-1000XM4",
            price: 8470000,
            image: "https://placehold.co/400x400/e5e7eb/e5e7eb",
            quantity: 1,
            isSelected: true,
        },
        {
            id: "3",
            title: "Beats Solo 3 Wireless",
            price: 3790000,
            image: "https://placehold.co/400x400/f3f4f6/f3f4f6",
            quantity: 1,
            isSelected: false,
        },
    ])

    const toggleItem = (id: string) => {
        setItems(items.map(item =>
            item.id === id ? { ...item, isSelected: !item.isSelected } : item
        ))
    }

    const updateQuantity = (id: string, quantity: number) => {
        setItems(items.map(item =>
            item.id === id ? { ...item, quantity } : item
        ))
    }

    const removeItem = (id: string) => {
        setItems(items.filter(item => item.id !== id))
    }

    const toggleAll = (checked: boolean) => {
        setItems(items.map(item => ({ ...item, isSelected: checked })))
    }

    const allSelected = items.length > 0 && items.every(item => item.isSelected)
    const total = items
        .filter(item => item.isSelected)
        .reduce((sum, item) => sum + item.price * item.quantity, 0)

    return (
        <div className="min-h-screen bg-[#F9F8FE] pb-20">
            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Main Cart Content */}
                    <div className="flex-1 space-y-6">
                        {/* Select All Bar */}
                        <div className="bg-white p-4 rounded-xl border border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Checkbox
                                    checked={allSelected}
                                    onCheckedChange={(checked) => toggleAll(checked as boolean)}
                                />
                                <span className="font-medium text-gray-900">Select All</span>
                            </div>
                            <Button variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-50 font-medium">
                                REMOVE
                            </Button>
                        </div>

                        {/* Cart Items */}
                        <div className="space-y-4">
                            {items.map((item) => (
                                <CartItem
                                    key={item.id}
                                    {...item}
                                    onToggle={() => toggleItem(item.id)}
                                    onQuantityChange={(q) => updateQuantity(item.id, q)}
                                    onRemove={() => removeItem(item.id)}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="w-full lg:w-96 space-y-6">
                        {/* Promo Code */}
                        <div className="bg-[#D3E4F4] p-4 rounded-xl flex items-center justify-center gap-2 text-gray-700 font-medium cursor-pointer hover:bg-[#C1D8EB] transition-colors">
                            <Ticket className="h-5 w-5" />
                            <span>I have promo code</span>
                        </div>

                        {/* Summary */}
                        <CartSummary total={total} />
                    </div>
                </div>
            </div>

            {/* Subscribe Section */}
            <div className="mt-20">
                <Subscribe variant="rounded" className="max-w-6xl" />
            </div>
        </div>
    )
}
