# Sizing Audit Report

## Summary
- **Total Usages**: 4159
- **Arbitrary Values**: 57
- **Token Adoption Rate**: 98.63%
- **Unique Sizes**: 190
- **Unique Spacing Scale**: 21
- **Unique Typography Scale**: 90

## Top Arbitrary Values
- `min-w-[200px]`: 4 occurrences
- `max-w-[88%]`: 2 occurrences
- `left-[50%]`: 2 occurrences
- `top-[50%]`: 2 occurrences
- `w-[200%]`: 2 occurrences
- `max-h-[60vh]`: 2 occurrences
- `max-w-[200px]`: 2 occurrences
- `aspect-[4/3]`: 2 occurrences
- `min-h-[60vh]`: 1 occurrences
- `text-[12rem]`: 1 occurrences
- `bottom-[max(1rem,env(safe-area-inset-bottom))]`: 1 occurrences
- `right-[max(1rem,env(safe-area-inset-right))]`: 1 occurrences
- `w-[calc(100vw-1rem)]`: 1 occurrences
- `max-w-[420px]`: 1 occurrences
- `h-[360px]`: 1 occurrences
- `min-w-[18px]`: 1 occurrences
- `h-[18px]`: 1 occurrences
- `max-w-[calc(100%-2rem)]`: 1 occurrences
- `min-h-[2.5em]`: 1 occurrences
- `min-w-[8rem]`: 1 occurrences

## Details by File
### src/app/error.tsx
- L11: **SZ001** - Arbitrary sizing value detected: min-h-[60vh]

### src/app/not-found.tsx
- L14: **SZ001** - Arbitrary sizing value detected: text-[12rem]

### src/components/features/Chatbot.tsx
- L165: **SZ001** - Arbitrary sizing value detected: bottom-[max(1rem,env(safe-area-inset-bottom))]
- L165: **SZ001** - Arbitrary sizing value detected: right-[max(1rem,env(safe-area-inset-right))]
- L168: **SZ001** - Arbitrary sizing value detected: w-[calc(100vw-1rem)]
- L168: **SZ001** - Arbitrary sizing value detected: max-w-[420px]
- L209: **SZ001** - Arbitrary sizing value detected: h-[360px]
- L214: **SZ001** - Arbitrary sizing value detected: max-w-[88%]
- L244: **SZ001** - Arbitrary sizing value detected: max-w-[88%]

### src/components/features/Header.tsx
- L306: **SZ001** - Arbitrary sizing value detected: min-w-[18px]
- L306: **SZ001** - Arbitrary sizing value detected: h-[18px]

### src/components/ui/alert-dialog.tsx
- L39: **SZ001** - Arbitrary sizing value detected: left-[50%]
- L39: **SZ001** - Arbitrary sizing value detected: top-[50%]

### src/components/ui/dialog.tsx
- L75: **SZ001** - Arbitrary sizing value detected: top-[50%]
- L75: **SZ001** - Arbitrary sizing value detected: left-[50%]
- L75: **SZ001** - Arbitrary sizing value detected: max-w-[calc(100%-2rem)]

### src/components/ui/product-card.tsx
- L154: **SZ001** - Arbitrary sizing value detected: min-h-[2.5em]

### src/components/ui/select.tsx
- L78: **SZ001** - Arbitrary sizing value detected: min-w-[8rem]

### src/components/ui/switch.tsx
- L22: **SZ001** - Arbitrary sizing value detected: h-[1.15rem]

### src/components/ui/tabs.tsx
- L38: **SZ001** - Arbitrary sizing value detected: p-[3px]
- L55: **SZ001** - Arbitrary sizing value detected: h-[calc(100%-1px)]

### src/app/(auth)/forgot-password/ForgotPasswordClient.tsx
- L41: **SZ001** - Arbitrary sizing value detected: w-[200%]
- L41: **SZ001** - Arbitrary sizing value detected: h-[150px]
- L46: **SZ001** - Arbitrary sizing value detected: w-[200%]
- L46: **SZ001** - Arbitrary sizing value detected: h-[100px]

### src/app/(shop)/about/AboutClient.tsx
- L79: **SZ001** - Arbitrary sizing value detected: rounded-[3rem]
- L297: **SZ001** - Arbitrary sizing value detected: min-h-[120px]

### src/app/(shop)/products/ProductListView.tsx
- L159: **SZ001** - Arbitrary sizing value detected: h-[320px]
- L171: **SZ001** - Arbitrary sizing value detected: min-h-[70vh]
- L375: **SZ001** - Arbitrary sizing value detected: rounded-[1.5rem]

### src/components/features/admin/DiscountFormDialog.tsx
- L133: **SZ001** - Arbitrary sizing value detected: max-h-[60vh]
- L261: **SZ001** - Arbitrary sizing value detected: min-h-[80px]

### src/components/features/admin/ProductFormDialog.tsx
- L230: **SZ001** - Arbitrary sizing value detected: max-h-[60vh]

### src/components/features/admin/UnknownApiNotice.tsx
- L17: **SZ001** - Arbitrary sizing value detected: text-[#8A6532]
- L23: **SZ001** - Arbitrary sizing value detected: text-[#6E5A37]

### src/components/features/about/PartnerLogo.tsx
- L16: **SZ001** - Arbitrary sizing value detected: min-w-[150px]

### src/components/features/about/StatCard.tsx
- L24: **SZ001** - Arbitrary sizing value detected: min-w-[200px]

### src/components/features/about/TeamMemberCard.tsx
- L21: **SZ001** - Arbitrary sizing value detected: min-w-[280px]

### src/components/features/orders/OrderCard.tsx
- L121: **SZ001** - Arbitrary sizing value detected: w-[110px]
- L121: **SZ001** - Arbitrary sizing value detected: h-[110px]
- L125: **SZ001** - Arbitrary sizing value detected: text-[28px]

### src/app/(shop)/admin/products/AdminProductsClient.tsx
- L155: **SZ001** - Arbitrary sizing value detected: min-h-[2.2em]

### src/app/(shop)/admin/orders/AdminOrdersClient.tsx
- L171: **SZ001** - Arbitrary sizing value detected: min-w-[200px]
- L423: **SZ001** - Arbitrary sizing value detected: left-[11px]
- L423: **SZ001** - Arbitrary sizing value detected: top-[22px]
- L522: **SZ001** - Arbitrary sizing value detected: min-h-[60px]

### src/app/(shop)/orders/[id]/OrderTrackingClient.tsx
- L251: **SZ001** - Arbitrary sizing value detected: text-[#FF4D4F]
- L280: **SZ001** - Arbitrary sizing value detected: text-[#9A6A23]

### src/app/(shop)/admin/reports/AdminReportsClient.tsx
- L112: **SZ001** - Arbitrary sizing value detected: min-w-[200px]
- L500: **SZ001** - Arbitrary sizing value detected: max-w-[160px]
- L530: **SZ001** - Arbitrary sizing value detected: min-w-[34px]
- L671: **SZ001** - Arbitrary sizing value detected: min-w-[200px]
- L772: **SZ001** - Arbitrary sizing value detected: max-w-[200px]

### src/app/(shop)/products/[id]/ProductDetailClient.tsx
- L142: **SZ001** - Arbitrary sizing value detected: max-w-[200px]
- L151: **SZ001** - Arbitrary sizing value detected: aspect-[4/3]
- L340: **SZ001** - Arbitrary sizing value detected: aspect-[4/3]

### src/app/(shop)/orders/[id]/feedback/GiveFeedbackClient.tsx
- L278: **SZ001** - Arbitrary sizing value detected: min-h-[170px]

