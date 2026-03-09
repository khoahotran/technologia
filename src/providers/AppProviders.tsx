"use client";

import { GoogleOAuthProvider } from "@react-oauth/google";
import React from "react";
import { Toaster } from "sonner";

import { AuthProvider } from "./auth.provider";
import { LanguageProvider } from "./language.provider";
import { QueryProvider } from "./query.provider";
import { ThemeProvider } from "./theme.provider";


export function AppProviders({ children }: { children: React.ReactNode }) {
    return (
        <QueryProvider>
            <LanguageProvider>
                <ThemeProvider>
                    <GoogleOAuthProvider clientId={process.env["NEXT_PUBLIC_GOOGLE_CLIENT_ID"] ?? ""}>
                        <AuthProvider>
                            {children}
                            <Toaster position="top-right" richColors />
                        </AuthProvider>
                    </GoogleOAuthProvider>
                </ThemeProvider>
            </LanguageProvider>
        </QueryProvider>
    );
}
