"use client"

import { Facebook, Youtube, Instagram, Linkedin } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AuthRepository } from "@/infrastructure/repositories/auth/auth.repository"
import { safe } from "@/shared/utils/result"

/**
 * Giao diện Đăng ký (Register Client View)
 * 
 * Hiển thị biểu mẫu thu thập thông tin người dùng mới (username, mật khẩu, email...).
 * Xử lý xác thực đầu vào, so khớp mật khẩu và gọi API đăng ký.
 */
export default function RegisterClient() {
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
            setError("Passwords do not match")
            setLoading(false)
            return
        }

        const [, err] = await safe(AuthRepository.register({
            username: formData.username,
            password: formData.password,
            phoneNumber: formData.phoneNumber,
            email: formData.email,
            firstname: formData.firstName,
            lastname: formData.lastName
            // role is removed from DTO as it's optional/handled by backend or we update DTO
        }));

        if (err !== null) {
            console.error(err)
            const errorObj = err as { response?: { data?: { message?: string } } };
            const errorMessage = errorObj.response?.data?.message || "Registration failed";
            setError(errorMessage)
            toast.error(errorMessage);
        } else {
            toast.success("Registration successful! Redirecting to login...", {
                duration: 2000,
            })

            // Delay redirect to allow user to see the success message
            setTimeout(() => {
                router.push("/login")
            }, 2000)
        }

        setLoading(false)
    }

    return (
        <div className="min-h-screen grid md:grid-cols-2">
            {/* Left Panel - Welcome */}
            <div className="bg-[#3E93B3] text-white flex flex-col justify-center items-center p-12 relative overflow-hidden">
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
                    <h1 className="text-5xl font-bold" style={{ fontFamily: 'cursive' }}>
                        Welcome
                    </h1>
                    <p className="text-xl leading-relaxed">
                        Sign up now to explore the latest smartphones and offers!
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
                        <h2 className="text-3xl font-bold text-gray-800">CREATE ACCOUNT</h2>
                    </div>

                    <form className="space-y-4" onSubmit={handleSubmit}>
                        {error && <div className="text-red-500 text-sm text-center">{error}</div>}

                        <Input
                            name="username"
                            type="text"
                            placeholder="Username*"
                            className="h-12 bg-[#F9F8FE] border-gray-200"
                            value={formData.username}
                            onChange={handleChange}
                            required
                        />

                        <Input
                            name="password"
                            type="password"
                            placeholder="Password*"
                            className="h-12 bg-[#F9F8FE] border-gray-200"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />

                        <Input
                            name="confirmPassword"
                            type="password"
                            placeholder="Confirm Password*"
                            className="h-12 bg-[#F9F8FE] border-gray-200"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                        />

                        <Input
                            name="email"
                            type="email"
                            placeholder="Email*"
                            className="h-12 bg-[#F9F8FE] border-gray-200"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />

                        <Input
                            name="phoneNumber"
                            type="tel"
                            placeholder="Phone Number"
                            className="h-12 bg-[#F9F8FE] border-gray-200"
                            value={formData.phoneNumber}
                            onChange={handleChange}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                name="firstName"
                                type="text"
                                placeholder="First Name"
                                className="h-12 bg-[#F9F8FE] border-gray-200"
                                value={formData.firstName}
                                onChange={handleChange}
                            />
                            <Input
                                name="lastName"
                                type="text"
                                placeholder="Last Name"
                                className="h-12 bg-[#F9F8FE] border-gray-200"
                                value={formData.lastName}
                                onChange={handleChange}
                            />
                        </div>

                        <Button
                            disabled={loading}
                            className="w-full h-12 bg-[#8AB0C3] hover:bg-[#7A9EB0] text-white font-semibold text-base"
                        >
                            {loading ? "Signing up..." : "Sign Up"}
                        </Button>

                        <div className="text-center text-sm text-gray-600">
                            Already have account?{" "}
                            <Link href="/login" className="text-[#3E93B3] hover:underline font-medium">
                                Sign In
                            </Link>
                        </div>

                        <div className="text-center text-sm text-gray-600">
                            <Link href="/" className="text-gray-400 hover:text-gray-600">
                                Home &rarr;
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
