"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner"; // Assuming sonner is installed as per package.json

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/features/auth/hooks";
import { useProfile } from "@/features/user/hooks";
import type { UpdateProfile } from "@/features/user/types";
import { useLanguage } from "@/providers/language.provider";

/**
 * Giao diện Hồ sơ Người dùng (Profile Page)
 * 
 * Hiển thị và quản lý thông tin cá nhân của người dùng đã đăng nhập.
 * Các tính năng bao gồm:
 * - Xem và chỉnh sửa thông tin cá nhân (Tên, số điện thoại, ...).
 * - Cập nhật ảnh đại diện (Avatar).
 * - Đổi mật khẩu.
 * - Bảo vệ route bằng cách kiểm tra trạng thái xác thực.
 */
export default function ProfilePage() {
    const { t } = useLanguage();
    const router = useRouter();
    const { isAuthenticated } = useAuth();
    const { profile, isLoading, updateProfile, changePassword, uploadAvatar } = useProfile();

    // Forms
    const [updateForm, setUpdateForm] = useState<UpdateProfile>({
        firstName: "",
        lastName: "",
        phoneNumber: ""
    });

    const [passwordForm, setPasswordForm] = useState({
        oldPassword: "",
        newPassword: "",
        confirmPassword: ""
    });

    useEffect(() => {
        if (!isAuthenticated) {
            router.push("/login");
            return;
        }
    }, [isAuthenticated, router]);

    useEffect(() => {
        if (profile) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setUpdateForm({
                firstName: profile.firstName || "",
                lastName: profile.lastName || "",
                phoneNumber: profile.phoneNumber || ""
            });
        }
    }, [profile]);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await updateProfile({
                ...updateForm,
                email: profile?.email,
                displayName: profile?.displayName ?? profile?.username,
            });
        } catch {
            // Error managed by hook toast
        }
    };

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            await uploadAvatar(file);
        } catch {
            // Error managed by hook toast
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            toast.error(t('passwords_not_match', {}, "Passwords do not match"));
            return;
        }

        try {
            await changePassword({
                oldPassword: passwordForm.oldPassword,
                newPassword: passwordForm.newPassword,
                confirmPassword: passwordForm.confirmPassword
            });
            setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
        } catch {
            // Error managed by hook toast
        }
    };

    if (isLoading) return <div>{t('loading', {}, "Loading...")}</div>;

    return (
        <div className="container mx-auto py-10">
            <h1 className="text-2xl font-bold mb-6">{t('user_profile', {}, "User Profile")}</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Sidebar / Avatar Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>{t('overview', {}, "Overview")}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center">
                        <div className="relative group">
                            <Avatar className="w-32 h-32 mb-4">
                                <AvatarImage src={profile?.imageUrl || ""} />
                                <AvatarFallback>{profile?.username?.[0]?.toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <label htmlFor="avatar-upload" className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white opacity-0 group-hover:opacity-100 rounded-full cursor-pointer transition-opacity">
                                {t('change', {}, "Change")}
                            </label>
                            <input type="file" id="avatar-upload" className="hidden" accept="image/*" onChange={handleAvatarChange} />
                        </div>

                        <h2 className="text-xl font-semibold">{profile?.displayName || profile?.username}</h2>
                        <p className="text-gray-500">{profile?.email}</p>
                    </CardContent>
                </Card>

                {/* Main Content */}
                <div className="md:col-span-2">
                    <Tabs defaultValue="details">
                        <TabsList className="mb-4">
                            <TabsTrigger value="details">{t('details', {}, "Details")}</TabsTrigger>
                            <TabsTrigger value="password">{t('security', {}, "Security")}</TabsTrigger>
                        </TabsList>

                        <TabsContent value="details">
                            <Card>
                                <CardHeader>
                                    <CardTitle>{t('personal_info', {}, "Personal Information")}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleUpdateProfile} className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>{t('first_name', {}, "First Name")}</Label>
                                                <Input
                                                    value={updateForm.firstName}
                                                    onChange={(e) => setUpdateForm({ ...updateForm, firstName: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>{t('last_name', {}, "Last Name")}</Label>
                                                <Input
                                                    value={updateForm.lastName}
                                                    onChange={(e) => setUpdateForm({ ...updateForm, lastName: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>{t('email', {}, "Email")}</Label>
                                            <Input
                                                value={profile?.email || ""}
                                                disabled
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>{t('phone_number', {}, "Phone Number")}</Label>
                                            <Input
                                                value={updateForm.phoneNumber}
                                                onChange={(e) => setUpdateForm({ ...updateForm, phoneNumber: e.target.value })}
                                            />
                                        </div>

                                        <Button type="submit">{t('save_changes', {}, "Save Changes")}</Button>
                                    </form>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="password">
                            <Card>
                                <CardHeader>
                                    <CardTitle>{t('change_password', {}, "Change Password")}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleChangePassword} className="space-y-4">
                                        <div className="space-y-2">
                                            <Label>{t('current_password', {}, "Current Password")}</Label>
                                            <Input
                                                type="password"
                                                value={passwordForm.oldPassword}
                                                onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>{t('new_password', {}, "New Password")}</Label>
                                            <Input
                                                type="password"
                                                value={passwordForm.newPassword}
                                                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>{t('confirm_new_password', {}, "Confirm New Password")}</Label>
                                            <Input
                                                type="password"
                                                value={passwordForm.confirmPassword}
                                                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                            />
                                        </div>
                                        <Button type="submit">{t('update_password', {}, "Update Password")}</Button>
                                    </form>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}
