"use client"

import { ArrowLeft } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

export default function CreateAddressClient() {
    return (
        <div className="min-h-screen bg-[#F9F8FE]">
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto">
                    {/* Back to shipping detail */}
                    <Link
                        href="/shipping"
                        className="inline-flex items-center gap-2 text-gray-700 hover:text-gray-900 mb-6"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span className="font-medium">Back to shipping detail</span>
                    </Link>

                    {/* Page Title */}
                    <h1 className="text-2xl font-bold text-gray-900 mb-8">Create new address</h1>

                    {/* Address Form */}
                    <div className="bg-white p-8 rounded-xl border border-gray-100 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Firstname *</label>
                                <Input className="bg-[#F9F8FE] border-gray-200" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Last name *</label>
                                <Input className="bg-[#F9F8FE] border-gray-200" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Phone Number *</label>
                                <Input className="bg-[#F9F8FE] border-gray-200" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Province *</label>
                                <Input className="bg-[#F9F8FE] border-gray-200" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">City</label>
                                <Input className="bg-[#F9F8FE] border-gray-200" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Ward *</label>
                                <Input className="bg-[#F9F8FE] border-gray-200" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Street *</label>
                                <Input className="bg-[#F9F8FE] border-gray-200" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">No *</label>
                                <Input className="bg-[#F9F8FE] border-gray-200" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Note</label>
                            <Textarea className="bg-[#F9F8FE] border-gray-200 min-h-[100px]" />
                        </div>

                        <div className="flex items-center space-x-2">
                            <Checkbox id="default-address" />
                            <label
                                htmlFor="default-address"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                Set as default address
                            </label>
                        </div>

                        <div className="flex justify-center pt-4">
                            <Link href="/shipping">
                                <Button className="w-64 h-12 bg-[#8AB0C3] hover:bg-[#7A9EB0] text-white font-semibold text-base">
                                    Check out
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
