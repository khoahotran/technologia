"use client"

import { GoogleLogin, type CredentialResponse } from "@react-oauth/google"
import { Facebook, Youtube, Instagram, Linkedin } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useContext } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { httpClient } from "@/infrastructure/http/client"
import { authStorage } from "@/infrastructure/persistence/storage"
import { AuthRepository } from "@/infrastructure/repositories/auth/auth.repository"
import { UserRepository } from "@/infrastructure/repositories/user/user.repository"
import { AuthContext } from "@/shared/providers/auth.provider"
import { safe } from "@/shared/utils/result"

/**
 * Giao diện Đăng nhập (Login Client View)
 * 
 * Hiển thị form đăng nhập và xử lý logic xác thực người dùng:
 * - Đăng nhập bằng tài khoản (Username/Password)
 * - Đăng nhập bằng Google (Google OAuth)
 * - Xử lý thông báo lỗi (Unauthorized, token expired, ...)
 * - Lưu trữ token vào local storage và cập nhật AuthContext.
 */
export default function LoginClient() {
    const router = useRouter()
    const auth = useContext(AuthContext)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(() => {
        const searchParams = new URLSearchParams(window.location.search);
        const errorType = searchParams.get("error");
        if (errorType === "forbidden") {
            return "Your session has no permission or expired. Please login again.";
        } else if (errorType === "session_expired") {
            return "Your session has expired. Please login again.";
        } else if (errorType === "unauthorized") {
            return "Please login to access this feature.";
        }
        return "";
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setLoading(true)

        console.warn("Attempting local login for:", formData.username);
        // 1. Login to get token
        const [authData, authErr] = await safe(AuthRepository.login({
            username: formData.username,
            password: formData.password
        }));

        if (authErr !== null) {
            console.error("Local Login Error Details:", authErr)
            const appError = authErr as { message?: string, details?: { data?: { message?: string } } };
            const msg = appError.details?.data?.message || appError.message || "Login failed.";
            setError(msg);
            setLoading(false);
            return;
        }

        const { token, refreshToken, userId } = authData!;

        // 2. Store tokens in storage
        console.warn("[LOGIN] After login - storing tokens", {
            hasToken: !!token,
            hasRefreshToken: !!refreshToken,
            tokenLength: token?.length,
            refreshTokenLength: refreshToken?.length,
        });

        authStorage.setTokens(token, refreshToken);
        console.warn("[LOGIN] authStorage.setTokens() completed");

        // Verify tokens were stored
        const storedToken = authStorage.getAccessToken();
        const storedRefresh = authStorage.getRefreshToken();
        console.warn("[LOGIN] Verification - tokens in storage after setTokens()", {
            hasStoredToken: !!storedToken,
            hasStoredRefresh: !!storedRefresh,
            storedTokenMatches: storedToken === token,
            storedRefreshMatches: storedRefresh === refreshToken,
        });

        httpClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        console.warn("[LOGIN] Updated httpClient default headers");

        // 3. User info
        let finalUser = {
            userId,
            username: formData.username,
            email: "",
            role: "CUSTOMER"
        };

        const [userProfile, profileErr] = await safe(UserRepository.getMe());
        if (profileErr !== null) {
            console.warn("Failed to fetch profile after login:", profileErr);
        } else if (userProfile) {
            finalUser = {
                userId: userProfile.userId,
                username: userProfile.username,
                email: userProfile.email,
                role: userProfile.role || "CUSTOMER",
            };
        }

        if (auth) {
            auth.login(token, refreshToken, finalUser);
        }

        console.warn("Local Login Success. Redirecting...");
        router.push("/")
        router.refresh()
        setLoading(false)
    }

    const onGoogleSuccess = async (credentialResponse: CredentialResponse) => {
        console.warn("Google Credential Response:", credentialResponse);
        setLoading(true);
        setError("");

        if (!credentialResponse.credential) {
            console.error("Google Login: No credential received");
            setError("Google login failed - no credential received.");
            setLoading(false);
            return;
        }

        // credentialResponse.credential is the ID Token (JWT)
        const [authData, authErr] = await safe(AuthRepository.loginGoogle({
            idToken: credentialResponse.credential
        }));

        if (authErr !== null) {
            console.error("Backend Google Login Error:", authErr);
            const appError = authErr as { message?: string, details?: { data?: { message?: string } } };
            const msg = appError.details?.data?.message || appError.message || "Google login failed.";
            setError(msg);
            setLoading(false);
            return;
        }

        const { token, refreshToken, userId } = authData!;
        console.warn("Backend Google Login Success:", { userId });

        authStorage.setTokens(token, refreshToken);
        httpClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        let finalUser = {
            userId,
            username: "google_user",
            email: "",
            role: "CUSTOMER"
        };

        const [userProfile, profileErr] = await safe(UserRepository.getMe());

        if (profileErr !== null) {
            console.warn("Failed to fetch profile after Google login:", profileErr);
        } else if (userProfile) {
            finalUser = {
                userId: userProfile.userId,
                username: userProfile.username,
                email: userProfile.email,
                role: userProfile.role || "CUSTOMER"
            };
        }

        if (auth) {
            auth.login(token, refreshToken, finalUser);
        }

        router.push("/");
        router.refresh();
        setLoading(false);
    }

    return (
        <div className="min-h-screen grid md:grid-cols-2">
            {/* Left Panel - Form */}
            <div className="bg-white flex items-center justify-center p-8 order-2 md:order-1">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold text-gray-800">SIGN IN</h2>
                    </div>

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {error && (
                            <div className="bg-red-50 text-red-500 text-sm p-3 rounded-lg text-center border border-red-100">
                                {error}
                            </div>
                        )}

                        <Input
                            name="username"
                            type="text"
                            placeholder="Username/Email"
                            className="h-12 bg-[#F9F8FE] border-gray-200"
                            value={formData.username}
                            onChange={handleChange}
                            required
                        />

                        <div className="space-y-2">
                            <Input
                                name="password"
                                type="password"
                                placeholder="Password"
                                className="h-12 bg-[#F9F8FE] border-gray-200"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                            <div className="text-right">
                                <Link href="/forgot-password" className="text-sm text-[#8AB0C3] hover:underline">
                                    Forgot Password?
                                </Link>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full h-12 bg-[#8AB0C3] hover:bg-[#7A9EB0] text-white font-semibold text-base"
                        >
                            {loading ? "Signing In..." : "Sign In"}
                        </Button>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-4 bg-white text-gray-500">Or</span>
                            </div>
                        </div>

                        <div className="flex flex-col space-y-3 items-center">
                            <div className="w-full">
                                <GoogleLogin
                                    onSuccess={onGoogleSuccess}
                                    onError={() => setError("Google login failed. Please try again.")}
                                    useOneTap
                                    width="100%"
                                    theme="outline"
                                    shape="rectangular"
                                />
                            </div>
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
