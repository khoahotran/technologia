"use client"

import { Facebook, Youtube, Instagram, Linkedin , Chrome } from "lucide-react"
import Link from "next/link"

import { SocialButton } from "@/components/features/home/FormElements"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"



export default function LoginClient() {
    return (
        <div className="min-h-screen grid md:grid-cols-2">
            {/* Left Panel - Form */}
            <div className="bg-white flex items-center justify-center p-8 order-2 md:order-1">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold text-gray-800">SIGN IN</h2>
                    </div>

                    <form className="space-y-6">
                        <Input
                            type="text"
                            placeholder="Username/Email"
                            className="h-12 bg-[#F9F8FE] border-gray-200"
                        />

                        <div className="space-y-2">
                            <Input
                                type="password"
                                placeholder="Password"
                                className="h-12 bg-[#F9F8FE] border-gray-200"
                            />
                            <div className="text-right">
                                <Link href="/forgot-password" className="text-sm text-[#8AB0C3] hover:underline">
                                    Forgot Password?
                                </Link>
                            </div>
                        </div>

                        <Button className="w-full h-12 bg-[#8AB0C3] hover:bg-[#7A9EB0] text-white font-semibold text-base">
                            Sign In
                        </Button>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-4 bg-white text-gray-500">Or</span>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <SocialButton
                                provider="Google"
                                icon={<Chrome className="h-5 w-5 text-red-500" />}
                            />
                            <SocialButton
                                provider="FaceBook"
                                icon={<Facebook className="h-5 w-5 text-blue-600" />}
                            />
                        </div>

                        <div className="text-center text-sm text-gray-600">
                            Do not have account?{" "}
                            <Link href="/register" className="text-[#3E93B3] hover:underline font-medium">
                                Sign Up
                            </Link>
                        </div>
                    </form>
                </div>
            </div>

            {/* Right Panel - Welcome */}
            <div className="bg-[#3E93B3] text-white flex flex-col justify-center items-center p-12 relative overflow-hidden order-1 md:order-2">
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
                        Welcome back
                    </h1>
                    <p className="text-xl leading-relaxed">
                        Access your account to shop with ease, discover great deals, and enjoy a personalized shopping experience.
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
        </div>
    )
}
