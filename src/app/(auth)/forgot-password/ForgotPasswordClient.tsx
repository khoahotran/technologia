"use client"

import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { forgotPassword } from "@/features/auth/api"
import { useLanguage } from "@/providers/language.provider"

export default function ForgotPasswordClient() {
    const { t } = useLanguage()
    const [email, setEmail] = useState("")
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState("")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError("")
        setSuccess(false)

        try {
            await forgotPassword({ email });
            setSuccess(true);
        } catch (err: unknown) {
            console.error(err);
            const message = err instanceof Error ? err.message : 'Unknown error';
            setError(message || t('failed_send_reset_email', {}, "Failed to send reset email. Please try again."));
        }

        setLoading(false)
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 space-y-8">
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-gray-800">{t('forgot_password_title', {}, "Forgot Password?")}</h2>
                    <p className="mt-2 text-gray-600">{t('forgot_password_desc', {}, "Enter your email address and we'll send you a link to reset your password.")}</p>
                </div>

                {success ? (
                    <div className="space-y-6 text-center">
                        <div className="p-4 bg-green-50 text-green-700 rounded-lg">
                            {t('reset_link_sent', { email }, `Check your email! We have sent a password reset link to ${email}.`)}
                        </div>
                        <Link href="/login" className="inline-block text-blue-600 hover:underline font-medium">
                            {t('back_to_login', {}, "Back to Login")}
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-medium text-gray-700">{t('email_address_label', {}, "Email Address")}</label>
                            <Input
                                id="email"
                                type="email"
                                placeholder={t('email_placeholder', {}, "Enter your email")}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
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
                                    {t('sending_link', {}, "Sending Link...")}
                                </>
                            ) : (
                                t('send_reset_link_btn', {}, "Send Reset Link")
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
