"use client";

import { Info } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { AddressCard } from "@/components/features/checkout/AddressCard";
import { Button } from "@/components/ui/button";
import { useAddresses } from "@/features/checkout/hooks";
import type { Address } from "@/features/checkout/types";
import { useLanguage } from "@/providers/language.provider";

function toReadableAddress(address: Address) {
    return `${address.no} ${address.street}, ${address.ward}, ${address.city}, ${address.province}`;
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
    const { t } = useLanguage();
    const router = useRouter();
    const { data: addresses = [], isLoading } = useAddresses();

    if (isLoading) {
        return <div className="flex justify-center p-8">{t('loading', {}, "Loading...")}</div>;
    }

    return (
        <div className="min-h-screen bg-[#F9F8FE]">
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-3xl mx-auto space-y-6">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-bold text-gray-900">{t('address_book_title', {}, "Address Book")}</h1>
                        <Info className="h-5 w-5 text-[#3E93B3]" />
                    </div>

                    <div className="space-y-4">
                        {addresses.map((address) => (
                            <AddressCard
                                key={address.addressId}
                                name={address.receiverName}
                                phone={address.receiverPhoneNumber}
                                address={toReadableAddress(address)}
                                isDefault={address.isDefault}
                                onUse={() => router.push(`/shipping?addressId=${address.addressId}`)}
                                onSetDefault={() => {
                                    // TBD: Implement set default via API
                                    toast.info(t('feature_coming_soon', {}, "Feature coming soon via API"));
                                }}
                            />
                        ))}
                    </div>

                    <Link href="/address-book/new">
                        <Button className="w-full bg-[#C3BFCE] hover:bg-[#B3AFBE] text-white font-medium h-12">
                            {t('create_new_address_btn', {}, "Create new address")}
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
