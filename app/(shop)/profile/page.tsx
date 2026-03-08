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
import { UserProfileDto, UpdateProfileDto } from "@/domain/user/dto/profile.dto";
import { UserRepository } from "@/infrastructure/repositories/user/user.repository";
import { useAuth } from "@/presentation/hooks/use-auth";
import { useLanguage } from "@/shared/providers/language.provider";
import { safe } from "@/shared/utils/result";

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
    const { isAuthenticated } = useAuth();
    const router = useRouter();
    const [profile, setProfile] = useState<UserProfileDto | null>(null);
    const [loading, setLoading] = useState(true);

    // Forms
    const [updateForm, setUpdateForm] = useState<UpdateProfileDto>({
        firstname: "",
        lastname: "",
        email: "",
        phoneNumber: "",
        displayName: ""
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

        const fetch = async () => {
            setLoading(true);
            const [data, error] = await safe(UserRepository.getMe());

            if (error) {
                toast.error(t('failed_fetch_profile', {}, "Failed to fetch profile"));
            } else if (data) {
                setProfile(data);
                setUpdateForm({
                    firstname: data.firstName || "",
                    lastname: data.lastName || "",
                    email: data.email || "",
                    phoneNumber: data.phoneNumber || "",
                    displayName: data.displayName || ""
                });
            }
            setLoading(false);
        };

        fetch();
    }, [isAuthenticated, router, t]);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        const [updated, error] = await safe(UserRepository.updateMe(updateForm));

        if (error || !updated) {
            toast.error(t('failed_update_profile', {}, "Failed to update profile"));
        } else {
            setProfile(updated);
            toast.success(t('profile_updated', {}, "Profile updated successfully"));
        }
    };

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const [result, error] = await safe(UserRepository.changeAvatar(file));

        if (error || !result) {
            toast.error(t('failed_update_avatar', {}, "Failed to update avatar"));
        } else {
            if (profile) {
                setProfile({ ...profile, imageUrl: result.avatarUrl });
            }
            toast.success(t('avatar_updated', {}, "Avatar updated successfully"));
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            toast.error(t('passwords_not_match', {}, "Passwords do not match"));
            return;
        }

        const result = await safe(UserRepository.changePassword({
            oldPassword: passwordForm.oldPassword,
            newPassword: passwordForm.newPassword
        }));

        if (result[1]) {
            toast.error(t('failed_change_password', {}, "Failed to change password"));
        } else {
            toast.success(t('password_changed', {}, "Password changed successfully"));
            setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
        }
    };

    if (loading) return <div>{t('loading', {}, "Loading...")}</div>;

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
                                                    value={updateForm.firstname}
                                                    onChange={(e) => setUpdateForm({ ...updateForm, firstname: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>{t('last_name', {}, "Last Name")}</Label>
                                                <Input
                                                    value={updateForm.lastname}
                                                    onChange={(e) => setUpdateForm({ ...updateForm, lastname: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>{t('display_name', {}, "Display Name")}</Label>
                                            <Input
                                                value={updateForm.displayName}
                                                onChange={(e) => setUpdateForm({ ...updateForm, displayName: e.target.value })}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>{t('email', {}, "Email")}</Label>
                                            <Input
                                                value={updateForm.email}
                                                onChange={(e) => setUpdateForm({ ...updateForm, email: e.target.value })}
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
