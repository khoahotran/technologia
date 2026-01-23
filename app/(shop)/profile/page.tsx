"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/presentation/hooks/use-auth.hook";
import { UserRepository } from "@/infrastructure/repositories/user/user.repository";
import { UserProfileDto, UpdateProfileDto } from "@/domain/user/dto/profile.dto";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner"; // Assuming sonner is installed as per package.json

export default function ProfilePage() {
    const { isAuthenticated, user, logout, login } = useAuth();
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
        const token = localStorage.getItem("accessToken");
        if (!token) {
            router.push("/login");
        }
    }, [router]);

    useEffect(() => {
        if (!isAuthenticated) {
            router.push("/login");
            return;
        }

        fetchProfile();
    }, [isAuthenticated, router]);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const data = await UserRepository.getMe();
            setProfile(data);
            setUpdateForm({
                firstname: data.firstName || "",
                lastname: data.lastName || "",
                email: data.email || "",
                phoneNumber: data.phoneNumber || "",
                displayName: data.displayName || ""
            });
            // Update context user if needed
        } catch (error) {
            toast.error("Failed to fetch profile");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const updated = await UserRepository.updateMe(updateForm);
            setProfile(updated);
            toast.success("Profile updated successfully");
        } catch (error) {
            toast.error("Failed to update profile");
        }
    };

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const { avatarUrl } = await UserRepository.changeAvatar(file);
            if (profile) {
                setProfile({ ...profile, imageUrl: avatarUrl });
            }
            toast.success("Avatar updated successfully");
        } catch (error) {
            toast.error("Failed to update avatar");
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        try {
            await UserRepository.changePassword({
                oldPassword: passwordForm.oldPassword,
                newPassword: passwordForm.newPassword
            });
            toast.success("Password changed successfully");
            setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
        } catch (error) {
            toast.error("Failed to change password");
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="container mx-auto py-10">
            <h1 className="text-2xl font-bold mb-6">User Profile</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Sidebar / Avatar Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center">
                        <div className="relative group">
                            <Avatar className="w-32 h-32 mb-4">
                                <AvatarImage src={profile?.imageUrl || ""} />
                                <AvatarFallback>{profile?.username?.[0]?.toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <label htmlFor="avatar-upload" className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white opacity-0 group-hover:opacity-100 rounded-full cursor-pointer transition-opacity">
                                Change
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
                            <TabsTrigger value="details">Details</TabsTrigger>
                            <TabsTrigger value="password">Security</TabsTrigger>
                        </TabsList>

                        <TabsContent value="details">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Personal Information</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleUpdateProfile} className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>First Name</Label>
                                                <Input
                                                    value={updateForm.firstname}
                                                    onChange={(e) => setUpdateForm({ ...updateForm, firstname: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Last Name</Label>
                                                <Input
                                                    value={updateForm.lastname}
                                                    onChange={(e) => setUpdateForm({ ...updateForm, lastname: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Display Name</Label>
                                            <Input
                                                value={updateForm.displayName}
                                                onChange={(e) => setUpdateForm({ ...updateForm, displayName: e.target.value })}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Email</Label>
                                            <Input
                                                value={updateForm.email}
                                                onChange={(e) => setUpdateForm({ ...updateForm, email: e.target.value })}
                                                disabled
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Phone Number</Label>
                                            <Input
                                                value={updateForm.phoneNumber}
                                                onChange={(e) => setUpdateForm({ ...updateForm, phoneNumber: e.target.value })}
                                            />
                                        </div>

                                        <Button type="submit">Save Changes</Button>
                                    </form>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="password">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Change Password</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleChangePassword} className="space-y-4">
                                        <div className="space-y-2">
                                            <Label>Current Password</Label>
                                            <Input
                                                type="password"
                                                value={passwordForm.oldPassword}
                                                onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>New Password</Label>
                                            <Input
                                                type="password"
                                                value={passwordForm.newPassword}
                                                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Confirm New Password</Label>
                                            <Input
                                                type="password"
                                                value={passwordForm.confirmPassword}
                                                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                            />
                                        </div>
                                        <Button type="submit">Update Password</Button>
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
