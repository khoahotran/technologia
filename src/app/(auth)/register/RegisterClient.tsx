"use client"

import { Facebook, Youtube, Instagram, Linkedin } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { register } from "@/features/auth/api"
import { useLanguage } from "@/providers/language.provider";

/**
 * Giao diện Đăng ký (Register Client View)
 * 
 * Hiển thị biểu mẫu thu thập thông tin người dùng mới (username, mật khẩu, email...).
 * Xử lý xác thực đầu vào, so khớp mật khẩu và gọi API đăng ký.
 */
export default function RegisterClient() {
    const { t } = useLanguage()
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [formData, setFormData] = useState({
        username: "",
        password: "",
        confirmPassword: "",
        email: "",
        phoneNumber: "",
        firstName: "",
        lastName: ""
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setLoading(true)

        if (formData.password !== formData.confirmPassword) {
            setError(t('register_err_password_match', {}, "Passwords do not match"))
            setLoading(false)
            return
        }

        try {
            await register({
                username: formData.username,
                password: formData.password,
                phoneNumber: formData.phoneNumber,
                email: formData.email,
                firstName: formData.firstName,
                lastName: formData.lastName
            });

            toast.success(t('register_success', {}, "Registration successful! Redirecting to login..."), {
                duration: 2000,
            })

            // Delay redirect to allow user to see the success message
            setTimeout(() => {
                router.push("/login")
            }, 2000)
        } catch (err: unknown) {
            console.error(err)
            const message = err instanceof Error ? err.message : 'Unknown error';
            const errorMessage = message || t('register_err_failed', {}, "Registration failed");
            setError(errorMessage)
            toast.error(errorMessage);
        }

        setLoading(false)
    }

    return (
        <div className="min-h-screen grid md:grid-cols-2">
            {/* Left Panel - Welcome */}
            <div className="bg-primary text-white flex flex-col justify-center items-center p-12 relative overflow-hidden">
                {/* Decorative waves */}
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
                        {t('register_welcome_title', {}, "Welcome")}
                    </h1>
                    <p className="text-xl leading-relaxed">
                        {t('register_welcome_desc', {}, "Sign up now to explore the latest smartphones and offers!")}
                    </p>

                    {/* Social Media Icons */}
                    <div className="flex justify-center gap-6 pt-8">
                        <a href="#" className="bg-[#1877F2] p-3 rounded-lg hover:opacity-80 transition-opacity">
                            <Facebook className="h-6 w-6" fill="white" />
                        </a>
                        <a href="#" className="bg-[#FF0000] p-3 rounded-lg hover:opacity-80 transition-opacity">
                            <Youtube className="h-6 w-6" fill="white" />
                        </a>
                        <a href="#" className="bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#F77737] p-3 rounded-lg hover:opacity-80 transition-opacity">
                            <Instagram className="h-6 w-6" fill="white" />
                        </a>
                        <a href="#" className="bg-[#0A66C2] p-3 rounded-lg hover:opacity-80 transition-opacity">
                            <Linkedin className="h-6 w-6" fill="white" />
                        </a>
                    </div>
                </div>
            </div>

            {/* Right Panel - Form */}
            <div className="bg-white flex items-center justify-center p-8">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold text-gray-800">{t('register_create_account', {}, "CREATE ACCOUNT")}</h2>
                    </div>

                    <form className="space-y-4" onSubmit={handleSubmit}>
                        {error && <div className="text-red-500 text-sm text-center">{error}</div>}

                        <Input
                            name="username"
                            type="text"
                            placeholder={t('register_username_placeholder', {}, "Username*")}
                            className="h-12 bg-background border-gray-200"
                            value={formData.username}
                            onChange={handleChange}
                            required
                        />

                        <Input
                            name="password"
                            type="password"
                            placeholder={t('register_password_placeholder', {}, "Password*")}
                            className="h-12 bg-background border-gray-200"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />

                        <Input
                            name="confirmPassword"
                            type="password"
                            placeholder={t('register_confirm_password_placeholder', {}, "Confirm Password*")}
                            className="h-12 bg-background border-gray-200"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                        />

                        <Input
                            name="email"
                            type="email"
                            placeholder={t('register_email_placeholder', {}, "Email*")}
                            className="h-12 bg-background border-gray-200"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />

                        <Input
                            name="phoneNumber"
                            type="tel"
                            placeholder={t('register_phone_placeholder', {}, "Phone Number")}
                            className="h-12 bg-background border-gray-200"
                            value={formData.phoneNumber}
                            onChange={handleChange}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                name="firstName"
                                type="text"
                                placeholder={t('register_first_name_placeholder', {}, "First Name")}
                                className="h-12 bg-background border-gray-200"
                                value={formData.firstName}
                                onChange={handleChange}
                            />
                            <Input
                                name="lastName"
                                type="text"
                                placeholder={t('register_last_name_placeholder', {}, "Last Name")}
                                className="h-12 bg-background border-gray-200"
                                value={formData.lastName}
                                onChange={handleChange}
                            />
                        </div>

                        <Button
                            disabled={loading}
                            className="w-full h-12 bg-secondary hover:bg-secondary/90 text-white font-semibold text-base"
                        >
                            {loading ? t('register_signing_up', {}, "Signing up...") : t('register_sign_up', {}, "Sign Up")}
                        </Button>

                        <div className="text-center text-sm text-gray-600">
                            {t('register_already_account', {}, "Already have account?")}{" "}
                            <Link href="/login" className="text-primary hover:underline font-medium">
                                {t('login_sign_in', {}, "Sign In")}
                            </Link>
                        </div>

                        <div className="text-center text-sm text-gray-600">
                            <Link href="/" className="text-gray-400 hover:text-gray-600">
                                {t('register_home_link', {}, "Home")} &rarr;
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
