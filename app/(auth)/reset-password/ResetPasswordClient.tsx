"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function ResetPasswordClient() {
    return (
        <div className="min-h-screen bg-[#3E93B3] relative overflow-hidden flex items-center justify-center p-4">
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

            {/* Modal */}
            <div className="relative z-10 bg-white rounded-2xl shadow-2xl p-12 max-w-2xl w-full">
                <div className="text-center space-y-6">
                    <h1 className="text-3xl font-bold text-gray-800">RESET PASSWORD</h1>

                    <p className="text-gray-600 leading-relaxed">
                        Please create a new password that you don't use on any other site.
                    </p>

                    <div className="pt-4 space-y-4">
                        <Input
                            type="password"
                            placeholder="Your new password"
                            className="h-14 bg-[#F9F8FE] border-gray-200"
                        />

                        <Input
                            type="password"
                            placeholder="Confirm your new password"
                            className="h-14 bg-[#F9F8FE] border-gray-200"
                        />

                        <div className="pt-2">
                            <Button className="w-full max-w-md mx-auto h-12 bg-[#8AB0C3] hover:bg-[#7A9EB0] text-white font-semibold text-base">
                                Forgot Password
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
