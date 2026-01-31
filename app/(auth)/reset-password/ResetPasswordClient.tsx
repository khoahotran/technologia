"use client"

import { ArrowLeft, Loader2, Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AuthRepository } from "@/infrastructure/repositories/auth/auth.repository"

export default function ResetPasswordClient() {
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
            setError("Invalid or missing reset token.")
            return
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.")
            return
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters long.")
            return
        }

        setLoading(true)
        setError("")

        try {
            await AuthRepository.resetPassword({
                resetToken: token,
                newPassword: password
            })
            setSuccess(true)
            setTimeout(() => {
                router.push("/login")
            }, 3000)
        } catch (err: unknown) {
            console.error(err)
            const errorObj = err as { response?: { data?: { message?: string } } };
            setError(errorObj.response?.data?.message || "Failed to reset password. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    if (!token) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 text-center space-y-6">
                    <h2 className="text-2xl font-bold text-red-600">Invalid Link</h2>
                    <p className="text-gray-600">The password reset link is invalid or has expired.</p>
                    <Link href="/forgot-password" className="inline-block text-blue-600 hover:underline">
                        Request a new link
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 space-y-8">
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-gray-800">Reset Password</h2>
                    <p className="mt-2 text-gray-600">Creating a new password for your account.</p>
                </div>

                {success ? (
                    <div className="space-y-6 text-center">
                        <div className="p-4 bg-green-50 text-green-700 rounded-lg">
                            Password reset successfully! Redirecting to login...
                        </div>
                        <Button className="w-full" onClick={() => router.push("/login")}>
                            Go to Login Now
                        </Button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">New Password</label>
                            <div className="relative">
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter new password"
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
                            <label className="text-sm font-medium text-gray-700">Confirm Password</label>
                            <Input
                                type="password"
                                placeholder="Confirm new password"
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
                                    Resetting...
                                </>
                            ) : (
                                "Reset Password"
                            )}
                        </Button>

                        <div className="text-center">
                            <Link href="/login" className="inline-flex items-center text-sm text-gray-600 hover:text-blue-600 transition-colors">
                                <ArrowLeft className="w-4 h-4 mr-1" />
                                Back to Login
                            </Link>
                        </div>
                    </form>
                )}
            </div>
        </div>
    )
}
