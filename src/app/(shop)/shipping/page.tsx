import { Suspense } from "react"

import ShippingClient from "./ShippingClient"

export default function ShippingDetailPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ShippingClient />
    </Suspense>
  )
}
