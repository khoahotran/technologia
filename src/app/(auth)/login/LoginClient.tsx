"use client"

import { GoogleLogin, type CredentialResponse, GoogleOAuthProvider } from "@react-oauth/google"
import { Facebook, Youtube, Instagram, Linkedin } from "lucide-react"
import Link from "next/link"
import { useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useLogin, useGoogleLogin } from "@/features/auth/hooks"
import { useLanguage } from "@/providers/language.provider";

export default function LoginClient() {
    const { t } = useLanguage()
    const loginMutation = useLogin()
    const googleLoginMutation = useGoogleLogin()
    const [formData, setFormData] = useState({
        username: "",
        password: ""
    })
    const [error, setError] = useState("")

    const loading = loginMutation.isPending || googleLoginMutation.isPending

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const errorMessages = useMemo(() => ({
        forbidden: t('login_err_forbidden', {}, "Your session has no permission or expired. Please login again."),
        session_expired: t('login_err_expired', {}, "Your session has expired. Please login again."),
        unauthorized: t('login_err_unauthorized', {}, "Please login to access this feature."),
    }), [t])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")

        try {
            await loginMutation.mutateAsync({
                username: formData.username,
                password: formData.password
            })
        } catch (err) {
            setError(err instanceof Error ? err.message : t('login_err_failed', {}, "Login failed."))
        }
    }

    const onGoogleSuccess = async (credentialResponse: CredentialResponse) => {
        setError("")

        if (!credentialResponse.credential) {
            setError(t('login_err_google_failed', {}, "Google login failed. Please try again."))
            return
        }

        try {
            await googleLoginMutation.mutateAsync({ idToken: credentialResponse.credential })
        } catch (err) {
            setError(err instanceof Error ? err.message : t('login_err_failed', {}, "Google login failed."))
        }
    }

    return (
        <GoogleOAuthProvider clientId={process.env["NEXT_PUBLIC_GOOGLE_CLIENT_ID"] ?? ""}>
            <div className="min-h-screen grid md:grid-cols-2">
                <div className="bg-white flex items-center justify-center p-8 order-2 md:order-1">
                    <div className="w-full max-w-md space-y-8">
                        <div className="text-center">
                            <h2 className="text-3xl font-bold text-gray-800">{t('login_sign_in', {}, "SIGN IN")}</h2>
                        </div>

                        <form className="space-y-6" onSubmit={handleSubmit}>
                            {error && (
                                <div className="bg-red-50 text-red-500 text-sm p-3 rounded-lg text-center border border-red-100">
                                    {errorMessages[error as keyof typeof errorMessages] ?? error}
                                </div>
                            )}

                            <Input
                                name="username"
                                type="text"
                                placeholder={t('login_username_placeholder', {}, "Username/Email")}
                                className="h-12 bg-background border-gray-200"
                                value={formData.username}
                                onChange={handleChange}
                                required
                            />

                            <div className="space-y-2">
                                <Input
                                    name="password"
                                    type="password"
                                    placeholder={t('login_password_placeholder', {}, "Password")}
                                    className="h-12 bg-background border-gray-200"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                />
                                <div className="text-right">
                                    <Link href="/forgot-password" className="text-sm text-secondary hover:underline">
                                        {t('login_forgot_password', {}, "Forgot Password?")}
                                    </Link>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full h-12 bg-secondary hover:bg-secondary/90 text-white font-semibold text-base"
                            >
                                {loading ? t('login_signing_in', {}, "Signing In...") : t('login_sign_in', {}, "SIGN IN")}
                            </Button>

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-200"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-4 bg-white text-gray-500">{t('login_or', {}, "Or")}</span>
                                </div>
                            </div>

                            <div className="flex flex-col space-y-3 items-center">
                                <div className="w-full">
                                    {process.env["NEXT_PUBLIC_GOOGLE_CLIENT_ID"] ? (
                                        <GoogleLogin
                                            onSuccess={onGoogleSuccess}
                                            onError={() => setError(t('login_err_google_failed', {}, "Google login failed. Please try again."))}
                                            useOneTap
                                            width="100%"
                                            theme="outline"
                                            shape="rectangular"
                                        />
                                    ) : (
                                        <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-100 text-center">
                                            {t('login_google_config_missing', {}, "Google Login is not configured. (Missing client_id)")}
                                        </div>
                                    )}
                                </div>
                            </div>


                            <div className="text-center text-sm text-gray-600">
                                {t('login_no_account', {}, "Do not have account?")} {" "}
                                <Link href="/register" className="text-primary hover:underline font-medium">
                                    {t('login_sign_up', {}, "Sign Up")}
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>

                <div className="bg-primary text-white flex flex-col justify-center items-center p-12 relative overflow-hidden order-1 md:order-2">
                    <div className="absolute bottom-0 left-0 right-0">
                        <svg viewBox="0 0 1200 400" className="w-full">
                            <path
                                d="M0,200 Q300,100 600,200 T1200,200 L1200,400 L0,400 Z"
                                fill="rgba(139, 176, 195, 0.3)"
                            />
                            <path
                                d="M0,250 Q300,150 600,250 T1200,250 L1200,400 L0,400 Z"
                                fill="rgba(139, 176, 195, 0.5)"
                            />
                            <path
                                d="M0,300 Q300,200 600,300 T1200,300 L1200,400 L0,400 Z"
                                fill="rgba(195, 228, 244, 0.4)"
                            />
                        </svg>
                    </div>

                    <div className="relative z-10 text-center space-y-6 max-w-md">
                        <h1 className="text-5xl font-extrabold tracking-tight">
                            {t('login_welcome_back', {}, "Welcome back")}
                        </h1>
                        <p className="text-xl leading-relaxed">
                            {t('login_welcome_desc', {}, "Access your account to shop with ease, discover great deals, and enjoy a personalized shopping experience.")}
                        </p>

                        <div className="flex justify-center gap-6 pt-8">
                            <a href="#" aria-label="Facebook" className="bg-[#1877F2] p-3 rounded-lg hover:opacity-80 transition-opacity">
                                <Facebook className="h-6 w-6" fill="white" />
                            </a>
                            <a href="#" aria-label="Youtube" className="bg-[#FF0000] p-3 rounded-lg hover:opacity-80 transition-opacity">
                                <Youtube className="h-6 w-6" fill="white" />
                            </a>
                            <a href="#" aria-label="Instagram" className="bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#F77737] p-3 rounded-lg hover:opacity-80 transition-opacity">
                                <Instagram className="h-6 w-6" fill="white" />
                            </a>
                            <a href="#" aria-label="Linkedin" className="bg-[#0A66C2] p-3 rounded-lg hover:opacity-80 transition-opacity">
                                <Linkedin className="h-6 w-6" fill="white" />
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </GoogleOAuthProvider>
    )
}

