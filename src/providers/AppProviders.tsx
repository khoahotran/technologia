"use client";


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
                    <AuthProvider>
                        {children}
                        <Toaster position="top-right" richColors />
                    </AuthProvider>
                </ThemeProvider>
            </LanguageProvider>
        </QueryProvider>
    );
}
