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
            if (message.includes('not found')) {
                setError(t('user_not_found'));
            } else if (message.includes('invalid email')) {
                setError(t('invalid_email'));
            } else {
                setError(t('failed_send_reset_email'));
            }
        }

        setLoading(false)
    }

    return (
        <div className="min-h-screen bg-primary-hover flex items-center justify-center p-4 relative overflow-hidden">
            {/* Trang trí sóng phía dưới (Aesthetic waves) */}
            <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none z-0 pointer-events-none">
                <svg className="relative block w-[200%] h-[150px] md:h-banner-sm text-white/10" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
                    <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5,73.84-4.36,147.54,16.88,218.2,52.03,35.33,17.57,67,40.63,101.4,59.34,32.7,17.77,66.8,32.22,102.6,38.86,36.5,6.77,73.9,5.2,110.8,0,33.5-4.7,66-15.6,97.2-31.5,30.3-15.5,58.6-35.3,86-57.5L1200,0Z" fill="currentColor"></path>
                </svg>
            </div>
            <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none z-0 opacity-50 translate-x-1/4 pointer-events-none">
                <svg className="relative block w-[200%] h-[100px] md:h-[200px] text-white/5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
                    <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5,73.84-4.36,147.54,16.88,218.2,52.03,35.33,17.57,67,40.63,101.4,59.34,32.7,17.77,66.8,32.22,102.6,38.86,36.5,6.77,73.9,5.2,110.8,0,33.5-4.7,66-15.6,97.2-31.5,30.3-15.5,58.6-35.3,86-57.5L1200,0Z" fill="currentColor"></path>
                </svg>
            </div>

            <div className="w-full max-w-2xl bg-white rounded-sm shadow-2xl p-6 md:p-12 space-y-10 z-10 relative">
                <div className="text-center space-y-4">
                    <h2 className="text-3xl font-bold text-muted-foreground uppercase tracking-wider">
                        {t('forgot_password_title_upper', {}, "FORGOT PASSWORD")}
                    </h2>
                    <p className="text-gray-500 text-lg max-w-md mx-auto leading-relaxed">
                        {t('forgot_password_desc_modern', {}, "Enter your registered email or phone number and follow the instructions sent to your email.")}
                    </p>
                </div>

                {success ? (
                    <div className="space-y-6 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="p-4 bg-green-50 text-green-700 rounded-lg border border-green-100 italic">
                            {t('reset_link_sent', { email }, `Check your email! We have sent a password reset link to ${email}.`)}
                        </div>
                        <Link href="/login" className="inline-block text-primary-hover hover:underline font-semibold text-lg">
                            {t('back_to_login', {}, "Back to Login")}
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-10 max-w-lg mx-auto">
                        <div className="space-y-2">
                            <Input
                                id="email"
                                type="text"
                                placeholder={t('forgot_password_placeholder_modern', {}, "Your registed Phone Number or Email")}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="h-12 bg-gray-50 border-gray-200 focus:ring-0 focus:border-[#3A8DA8] text-center text-lg rounded-sm"
                            />
                        </div>

                        {error && (
                            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 text-center animate-shake">
                                {error}
                            </div>
                        )}

                        <div className="flex flex-col items-center gap-6">
                            <Button 
                                type="submit" 
                                className="w-full h-12 text-lg font-bold bg-secondary hover:bg-[#7DA1B2] text-gray-800 rounded-sm shadow-md transition-all active:scale-[0.98]" 
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        {t('sending_link', {}, "Sending...")}
                                    </>
                                ) : (
                                    t('forgot_password_btn_modern', {}, "Forgot Password")
                                )}
                            </Button>

                            <Link href="/login" className="inline-flex items-center text-sm text-gray-400 hover:text-primary-hover transition-colors group">
                                <ArrowLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
                                {t('back_to_login', {}, "Back to Login")}
                            </Link>
                        </div>
                    </form>
                )}
            </div>
        </div>
    )
}
