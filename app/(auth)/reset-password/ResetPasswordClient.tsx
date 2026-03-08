"use client"

import { ArrowLeft, Loader2, Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AuthRepository } from "@/infrastructure/repositories/auth/auth.repository"
import { useLanguage } from "@/shared/providers/language.provider"
import { safe } from "@/shared/utils/result"

export default function ResetPasswordClient() {
    const { t } = useLanguage()
    const router = useRouter()
    const searchParams = useSearchParams()
    const token = searchParams.get("token")

    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState("")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!token) {
            setError(t('invalid_reset_token', {}, "Invalid or missing reset token."))
            return
        }

        if (password !== confirmPassword) {
            setError(t('register_err_password_match', {}, "Passwords do not match."))
            return
        }

        if (password.length < 6) {
            setError(t('password_min_length', {}, "Password must be at least 6 characters long."))
            return
        }

        setLoading(true)
        setError("")

        const [, err] = await safe(AuthRepository.resetPassword({
            resetToken: token,
            newPassword: password
        }))

        if (err !== null) {
            console.error(err)
            const errorObj = err as { response?: { data?: { message?: string } } };
            setError(errorObj.response?.data?.message || t('failed_reset_password', {}, "Failed to reset password. Please try again."))
        } else {
            setSuccess(true)
            setTimeout(() => {
                router.push("/login")
            }, 3000)
        }

        setLoading(false)
    }

    if (!token) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 text-center space-y-6">
                    <h2 className="text-2xl font-bold text-red-600">{t('invalid_link_title', {}, "Invalid Link")}</h2>
                    <p className="text-gray-600">{t('invalid_link_desc', {}, "The password reset link is invalid or has expired.")}</p>
                    <Link href="/forgot-password" className="inline-block text-blue-600 hover:underline">
                        {t('request_new_link', {}, "Request a new link")}
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 space-y-8">
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-gray-800">{t('reset_password_title', {}, "Reset Password")}</h2>
                    <p className="mt-2 text-gray-600">{t('reset_password_desc', {}, "Creating a new password for your account.")}</p>
                </div>

                {success ? (
                    <div className="space-y-6 text-center">
                        <div className="p-4 bg-green-50 text-green-700 rounded-lg">
                            {t('reset_password_success', {}, "Password reset successfully! Redirecting to login...")}
                        </div>
                        <Button className="w-full" onClick={() => router.push("/login")}>
                            {t('go_to_login_btn', {}, "Go to Login Now")}
                        </Button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">{t('new_password_label', {}, "New Password")}</label>
                            <div className="relative">
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    placeholder={t('enter_new_password_placeholder', {}, "Enter new password")}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="h-11 pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">{t('confirm_password_label', {}, "Confirm Password")}</label>
                            <Input
                                type="password"
                                placeholder={t('confirm_new_password_placeholder', {}, "Confirm new password")}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                className="h-11"
                            />
                        </div>

                        {error && (
                            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">
                                {error}
                            </div>
                        )}

                        <Button type="submit" className="w-full h-11 text-lg" disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    {t('resetting', {}, "Resetting...")}
                                </>
                            ) : (
                                t('reset_password_title', {}, "Reset Password")
                            )}
                        </Button>

                        <div className="text-center">
                            <Link href="/login" className="inline-flex items-center text-sm text-gray-600 hover:text-blue-600 transition-colors">
                                <ArrowLeft className="w-4 h-4 mr-1" />
                                {t('back_to_login', {}, "Back to Login")}
                            </Link>
                        </div>
                    </form>
                )}
            </div>
        </div>
    )
}
