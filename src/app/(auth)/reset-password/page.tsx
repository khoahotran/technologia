import { Loader2 } from "lucide-react"
import { Suspense } from "react"

import ResetPasswordClient from "./ResetPasswordClient"

export const metadata = {
  title: "Reset Password | E-Shop",
  description: "Create a new password",
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>}>
      <ResetPasswordClient />
    </Suspense>
  )
}
