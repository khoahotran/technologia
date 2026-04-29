"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCreateAddress } from "@/features/checkout/hooks";
import { useLanguage } from "@/providers/language.provider";

/**
 * Kiểu dữ liệu lưu trữ trạng thái của biểu mẫu tạo địa chỉ.
 */
interface AddressFormState {
    firstName: string;
    lastName: string;
    phone: string;
    province: string;
    city: string;
    ward: string;
    street: string;
    number: string;
    note: string;
    isDefault: boolean;
}

const INITIAL_FORM: AddressFormState = {
    firstName: "",
    lastName: "",
    phone: "",
    province: "",
    city: "",
    ward: "",
    street: "",
    number: "",
    note: "",
    isDefault: false,
};

/**
 * Giao diện Tạo Địa chỉ Mới (Create Address Client)
 * 
 * Hiển thị biểu mẫu cho phép người dùng nhập thông tin địa chỉ giao hàng mới.
 * Thông tin sẽ được thu thập, xác thực cơ bản, và lưu thông qua hàm `addCheckoutAddress`.
 */
export default function CreateAddressClient() {
    const { t } = useLanguage();
    const router = useRouter();
    const [form, setForm] = useState<AddressFormState>(INITIAL_FORM);
    const createAddressMutation = useCreateAddress();

    const setField = <K extends keyof AddressFormState>(key: K, value: AddressFormState[K]) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const handleSubmit = () => {
        if (!form.firstName || !form.lastName || !form.phone || !form.province || !form.city || !form.ward || !form.street || !form.number) {
            toast.error(t('fill_required_fields', {}, "Please fill all required fields"));
            return;
        }

        createAddressMutation.mutate({
            receiverName: `${form.firstName} ${form.lastName}`.trim(),
            receiverPhoneNumber: form.phone,
            no: form.number,
            street: form.street,
            ward: form.ward,
            city: form.city,
            province: form.province,
            isDefault: form.isDefault,
        }, {
            onSuccess: () => {
                router.push("/address-book");
            }
        });
    };

    return (
        <div className="min-h-screen bg-[#F9F8FE]">
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto">
                    <Link
                        href="/address-book"
                        className="inline-flex items-center gap-2 text-gray-700 hover:text-gray-900 mb-6"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span className="font-medium">{t('back_to_address_book', {}, "Back to address book")}</span>
                    </Link>

                    <h1 className="text-2xl font-bold text-gray-900 mb-8">{t('create_new_address_title', {}, "Create new address")}</h1>

                    <div className="bg-white p-8 rounded-xl border border-gray-100 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">{t('firstname_label', {}, "Firstname *")}</label>
                                <Input value={form.firstName} onChange={(e) => setField("firstName", e.target.value)} className="bg-[#F9F8FE] border-gray-200" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">{t('lastname_label', {}, "Last name *")}</label>
                                <Input value={form.lastName} onChange={(e) => setField("lastName", e.target.value)} className="bg-[#F9F8FE] border-gray-200" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">{t('phone_label', {}, "Phone Number *")}</label>
                                <Input value={form.phone} onChange={(e) => setField("phone", e.target.value)} className="bg-[#F9F8FE] border-gray-200" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">{t('province_label', {}, "Province *")}</label>
                                <Input value={form.province} onChange={(e) => setField("province", e.target.value)} className="bg-[#F9F8FE] border-gray-200" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">{t('city_label_required', {}, "City *")}</label>
                                <Input value={form.city} onChange={(e) => setField("city", e.target.value)} className="bg-[#F9F8FE] border-gray-200" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">{t('ward_label_required', {}, "Ward *")}</label>
                                <Input value={form.ward} onChange={(e) => setField("ward", e.target.value)} className="bg-[#F9F8FE] border-gray-200" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">{t('street_label_required', {}, "Street *")}</label>
                                <Input value={form.street} onChange={(e) => setField("street", e.target.value)} className="bg-[#F9F8FE] border-gray-200" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">{t('no_label', {}, "No *")}</label>
                                <Input value={form.number} onChange={(e) => setField("number", e.target.value)} className="bg-[#F9F8FE] border-gray-200" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">{t('notes_label', {}, "Note")}</label>
                            <Textarea value={form.note} onChange={(e) => setField("note", e.target.value)} className="bg-[#F9F8FE] border-gray-200 min-h-[100px]" />
                        </div>

                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="default-address"
                                checked={form.isDefault}
                                onCheckedChange={(checked) => setField("isDefault", Boolean(checked))}
                            />
                            <label htmlFor="default-address" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                {t('set_as_default_label', {}, "Set as default address")}
                            </label>
                        </div>

                        <div className="flex justify-center pt-4">
                            <Button type="button" onClick={handleSubmit} className="w-64 h-12 bg-[#8AB0C3] hover:bg-[#7A9EB0] text-white font-semibold text-base">
                                {t('save_address_btn', {}, "Save address")}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
