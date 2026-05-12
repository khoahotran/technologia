# Remaining Hardcoded Sizing Report

The following sizing and typography values were identified but not auto-migrated. Many of these are intentional "one-off" values for specific layout requirements or calculated dimensions.

## Remaining Hardcoded Usages

| File | Line | Utility | Value | Intent / Recommendation |
| :--- | :--- | :--- | :--- | :--- |
| `src/app/not-found.tsx` | 14 | `text` | `[12rem]` | INTENTIONAL: Large hero text for 404 page. |
| `src/components/features/Chatbot.tsx` | 165 | `bottom` | `[max(1rem,env(...))]` | INTENTIONAL: Dynamic safe-area inset logic. |
| `src/components/ui/dialog.tsx` | 75 | `max-w` | `[calc(100%-2rem)]` | INTENTIONAL: Responsive dialog centering logic. |
| `src/app/(shop)/about/AboutClient.tsx` | 79 | `rounded` | `[3rem]` | REVIEW: Extremely large radius for section overlap. |
| `src/components/features/orders/OrderCard.tsx` | 125 | `text` | `[28px]` | REVIEW: Large status text in order card. |
| `src/app/(shop)/admin/reports/AdminReportsClient.tsx` | 590 | `text` | `[9px]` | REVIEW: Extremely small text in admin reports. |

## Unresolved Scale Issues
- **Centering Logic**: Utilities like `left-[50%] top-[50%]` are used for absolute centering. Suggestion: Use a shared `center-absolute` utility.
- **Dynamic Viewport Heights**: `min-h-[60vh]`, `max-h-[60vh]` are used in several dialogs. Suggestion: Create a `--size-dialog-max-height` token.
- **Table/Grid Min-Widths**: Many admin pages use `min-w-[200px]` for column headers. Suggestion: Standardize column width tokens.

## Architecture Risks
- **Magic Number Heights**: Some banners still use `h-[320px]` or `h-[360px]`. These should be unified under the `banner-lg/md/sm` scale.
- **Radius Inconsistency**: `rounded-[1.5rem]` vs `rounded-3xl` (which is 1.5rem). Some components use raw values instead of Tailwind's named scale.
