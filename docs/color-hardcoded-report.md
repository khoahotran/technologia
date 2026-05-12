# Remaining Hardcoded Colors Report

The following colors were identified but not auto-migrated due to low semantic confidence or unique usage patterns (e.g., status-specific backgrounds).

## Remaining Hardcoded Usages

| File | Line | Utility | Value | Intent / Recommendation |
| :--- | :--- | :--- | :--- | :--- |
| `src\components\features\home\Subscribe.tsx` | 93 | `bg` | `#5B6C8F` | REVIEW: Navy blue background for subscription block. |
| `src\components\features\orders\OrderCard.tsx` | 121 | `bg` | `#EFF4F9` | REVIEW: Light blue background for order status. |
| `src\components\features\orders\OrderCard.tsx` | 129 | `bg` | `#EB8435` | REVIEW: Orange background for "Processing" status. |
| `src\components\features\admin\UnknownApiNotice.tsx` | 17 | `bg` | `#FFF8EE` | WARNING: Amber background for API notice. Use `warning-soft`. |
| `src\components\features\admin\UnknownApiNotice.tsx` | 17 | `border` | `#D6B57D` | WARNING: Amber border for API notice. Use `warning`. |
| `src\app\(shop)\orders\[id]\OrderTrackingClient.tsx` | 251 | `text` | `#FF4D4F` | ERROR: Red text for failed status. Use `destructive`. |
| `src\app\(shop)\orders\[id]\OrderTrackingClient.tsx` | 280 | `text` | `#9A6A23` | WARNING: Brownish text for specific tracking status. |

## Unresolved Semantic Cases
- **Dynamic Gradients**: Some gradients in `Banner.tsx` use template literals that the AST parser flags as low-confidence.
- **Status Colors**: Colors used for specific order statuses (Processing, Shipped, etc.) are currently hardcoded. Recommendation: Create a `StatusToken` system.

## Ignored Brand Colors
- The Instagram gradient components are now partially tokenized (`instagram-start`, etc.) but some files may still have remnants if they were used in complex expressions.
- Facebook and LinkedIn colors are fully tokenized.
