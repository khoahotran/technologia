"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { PaymentMethodList } from "@/components/features/checkout/PaymentMethodList"

export default function ShippingClient() {
    const [paymentMethod, setPaymentMethod] = useState("bank")

    // Mock data
    const defaultAddress = {
        name: "Customer name",
        phone: "Customer phone number",
        address: "Customer address (note, no, street, ward, city, province)",
    }

    const orderItems = [
        { id: "1", name: "Product name", quantity: 1, price: 1000000 },
        { id: "2", name: "Product name", quantity: 2, price: 8000000 },
    ]

    const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const shipping = 0
    const total = subtotal + shipping

    const bankAccounts = [
        {
            id: "1",
            type: "bank" as const,
            name: "Bank name",
            accountName: "NAME",
            accountNumber: "bank account number",
            isDefault: true,
        },
        {
            id: "2",
            type: "bank" as const,
            name: "Bank name",
            accountName: "NAME",
            accountNumber: "bank account number",
        },
    ]

    const walletAccounts = [
        {
            id: "1",
            type: "wallet" as const,
            name: "E-wallet name",
            accountName: "NAME",
            accountNumber: "e-wallet number",
            isDefault: true,
        },
        {
            id: "2",
            type: "wallet" as const,
            name: "E-wallet name",
            accountName: "NAME",
            accountNumber: "e-wallet account number",
        },
    ]

    return (
        <div className="min-h-screen bg-[#F9F8FE]">
            {/* Header with categories */}
            <div className="bg-white py-4 border-b border-gray-100">
                <div className="container mx-auto px-4">
                    <ul className="flex items-center justify-between text-sm font-medium text-gray-600">
                        <li>All categories</li>
                        <li>Smartphone</li>
                        <li>Laptop</li>
                        <li>Gaming Equipment</li>
                        <li>Headphone</li>
                        <li>Speaker</li>
                        <li>Others</li>
                    </ul>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                {/* Back to cart */}
                <Link href="/cart" className="inline-flex items-center gap-2 text-gray-700 hover:text-gray-900 mb-6">
                    <ArrowLeft className="h-4 w-4" />
                    <span className="font-medium">Back to cart</span>
                </Link>

                {/* Page Title */}
                <h1 className="text-2xl font-bold text-gray-900 mb-8">Shipping Detail</h1>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Left Sidebar - Payment Methods */}
                    <div className="lg:col-span-1 space-y-6">
                        <PaymentMethodList type="bank" methods={bankAccounts} />
                        <PaymentMethodList type="wallet" methods={walletAccounts} />
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Address Section */}
                        <div className="bg-white p-6 rounded-xl border border-gray-100">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="font-bold text-gray-900">Address</h2>
                                <Link
                                    href="/address-book"
                                    className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
                                >
                                    Choose other address
                                    <ChevronDown className="h-4 w-4" />
                                </Link>
                            </div>
                            <div className="space-y-2 text-sm">
                                <p className="text-gray-500">Customer name</p>
                                <p className="font-medium text-gray-900">{defaultAddress.name}</p>
                                <p className="text-gray-500">Customer phone number</p>
                                <p className="font-medium text-gray-900">{defaultAddress.phone}</p>
                                <p className="text-gray-500">Customer address (note, no, street, ward, city, province)</p>
                                <p className="font-medium text-gray-900">{defaultAddress.address}</p>
                            </div>
                        </div>

                        {/* Order Summary */}
                        <div className="bg-white p-6 rounded-xl border border-gray-100">
                            <h2 className="font-bold text-gray-900 mb-4">My order <span className="text-gray-400">#orderID</span></h2>

                            <div className="space-y-3 mb-6">
                                {orderItems.map((item) => (
                                    <div key={item.id} className="flex justify-between text-sm">
                                        <span className="text-gray-600">{item.quantity}x</span>
                                        <span className="flex-1 ml-4 text-gray-900">{item.name}</span>
                                        <span className="font-medium text-[#3E93B3]">
                                            {new Intl.NumberFormat("vi-VN").format(item.price)} VND
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t border-gray-100 pt-4 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Sub-total</span>
                                    <span className="font-medium text-gray-900">
                                        {new Intl.NumberFormat("vi-VN").format(subtotal)} VND
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Shipping</span>
                                    <span className="font-medium text-green-500">Free Shipping</span>
                                </div>
                                <div className="flex justify-between text-base font-bold pt-2 border-t border-gray-100">
                                    <span className="text-gray-900">Order total</span>
                                    <span className="text-[#3E93B3]">
                                        {new Intl.NumberFormat("vi-VN").format(total)} VND
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Payment Method Selection */}
                        <div className="bg-white p-6 rounded-xl border border-gray-100">
                            <h2 className="font-bold text-gray-900 mb-4">Payment</h2>

                            <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-4">
                                <div className="flex items-start space-x-3">
                                    <RadioGroupItem value="bank" id="bank" className="mt-1" />
                                    <div className="flex-1">
                                        <Label htmlFor="bank" className="font-medium text-gray-900 cursor-pointer">
                                            Direct bank transfer
                                        </Label>
                                        <div className="mt-2 text-sm text-gray-500 space-y-1">
                                            <p>Bank name (default)</p>
                                            <p className="uppercase">NAME</p>
                                            <p>Bank account number</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-3">
                                    <RadioGroupItem value="wallet" id="wallet" className="mt-1" />
                                    <div className="flex-1">
                                        <Label htmlFor="wallet" className="font-medium text-gray-900 cursor-pointer">
                                            E-wallet
                                        </Label>
                                        <div className="mt-2 text-sm text-gray-500 space-y-1">
                                            <p>E-wallet name (default)</p>
                                            <p className="uppercase">NAME</p>
                                            <p>E-wallet account number</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-3">
                                    <RadioGroupItem value="cod" id="cod" className="mt-1" />
                                    <div className="flex-1">
                                        <Label htmlFor="cod" className="font-medium text-gray-900 cursor-pointer flex items-center gap-2">
                                            <Checkbox checked={paymentMethod === "cod"} className="pointer-events-none" />
                                            Cash on delivery
                                        </Label>
                                    </div>
                                </div>
                            </RadioGroup>
                        </div>

                        {/* Place Order Button */}
                        <div className="flex justify-center pt-4">
                            <Button className="w-64 h-12 bg-[#8AB0C3] hover:bg-[#7A9EB0] text-white font-semibold text-base">
                                Place order
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
