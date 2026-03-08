"use client";

import { GoogleOAuthProvider } from "@react-oauth/google";
import { Suspense, type ReactNode } from "react";

import Loading from "@/app/loading";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/shared/providers/auth.provider";
import { LanguageProvider } from "@/shared/providers/language.provider";
import { QueryProvider } from "@/shared/providers/query.provider";
import { RepositoryProvider } from "@/shared/providers/repository.provider";

export function AppProviders({ children }: { children: ReactNode }) {
  const googleClientId = process.env["NEXT_PUBLIC_GOOGLE_CLIENT_ID"];
  const content = (
    <AuthProvider>
      {children}
    </AuthProvider>
  );

  return (
    <LanguageProvider>
      <Suspense fallback={<Loading />}>
        <QueryProvider>
          <Toaster
            richColors
            position="top-center"
            toastOptions={{ className: "mx-auto" }}
          />
          <RepositoryProvider>
            {googleClientId ? (
              <GoogleOAuthProvider clientId={googleClientId}>
                {content}
              </GoogleOAuthProvider>
            ) : (
              content
            )}
          </RepositoryProvider>
        </QueryProvider>
      </Suspense>
    </LanguageProvider>
  );
}
