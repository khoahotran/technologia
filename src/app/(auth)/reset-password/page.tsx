import { Suspense } from "react"

import { FullLoading } from "@/components/shared/loading"

import ResetPasswordClient from "./ResetPasswordClient"

export const metadata = {
  title: "Reset Password | E-Shop",
  description: "Create a new password",
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<FullLoading className="min-h-screen" />}>
      <ResetPasswordClient />
    </Suspense>
  )
}
