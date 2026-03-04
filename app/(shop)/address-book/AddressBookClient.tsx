"use client";

import { Info } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { AddressCard } from "@/components/features/checkout/AddressCard";
import { Button } from "@/components/ui/button";
import {
    type CheckoutAddress,
    getCheckoutAddresses,
    setDefaultCheckoutAddress,
} from "@/lib/checkout-flow";

/**
 * Chuyển đổi đối tượng địa chỉ thành chuỗi văn bản thân thiện với con người.
 * 
 * @param address - Thông tin địa chỉ cần hiển thị
 * @returns Chuỗi định dạng: "Số nhà, Phường/Xã, Quận/Huyện, Tỉnh/Thành phố"
 */
function toReadableAddress(address: CheckoutAddress) {
    return `${address.line}, ${address.ward}, ${address.city}, ${address.province}`;
}

/**
 * Giao diện Quản lý Sổ địa chỉ (Address Book Client)
 * 
 * Hiển thị danh sách các địa chỉ giao hàng của người dùng. Cho phép:
 * - Xem danh sách địa chỉ hiện có.
 * - Đặt một địa chỉ làm mặc định.
 * - Chọn địa chỉ để sử dụng cho phiên thanh toán hiện tại.
 * - Điều hướng tới trang tạo địa chỉ mới.
 */
export default function AddressBookClient() {
    const router = useRouter();
    const [addresses, setAddresses] = useState<CheckoutAddress[]>(() => getCheckoutAddresses());

    return (
        <div className="min-h-screen bg-[#F9F8FE]">
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-3xl mx-auto space-y-6">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-bold text-gray-900">Address Book</h1>
                        <Info className="h-5 w-5 text-[#3E93B3]" />
                    </div>

                    <div className="space-y-4">
                        {addresses.map((address) => (
                            <AddressCard
                                key={address.id}
                                name={address.fullName}
                                phone={address.phone}
                                address={toReadableAddress(address)}
                                isDefault={address.isDefault}
                                onUse={() => router.push(`/shipping?addressId=${address.id}`)}
                                onSetDefault={() => {
                                    const next = setDefaultCheckoutAddress(address.id);
                                    setAddresses(next);
                                    toast.success("Default address updated");
                                }}
                            />
                        ))}
                    </div>

                    <Link href="/address-book/new">
                        <Button className="w-full bg-[#C3BFCE] hover:bg-[#B3AFBE] text-white font-medium h-12">
                            Create new address
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
