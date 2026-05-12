# Color Audit Report

## Summary
- **Total Unique Colors**: 211
- **Total Usages**: 1778
- **Issues Found**: 13
- **Token Adoption Rate**: 99.27%

## Detected Cycles
No token cycles detected.

## Issues by Severity
- **HIGH**: 13
- **MEDIUM**: 0

## Top Hardcoded Colors
- `bg-[#5B6C8F]`: 1 occurrences
- `bg-[#EFF4F9]`: 1 occurrences
- `bg-[#EB8435]`: 1 occurrences
- `border-[#D6B57D]`: 1 occurrences
- `bg-[#FFF8EE]`: 1 occurrences
- `text-[#8A6532]`: 1 occurrences
- `text-[#6E5A37]`: 1 occurrences
- `bg-[#C3A57D]`: 1 occurrences
- `bg-[#BFC7CF]`: 1 occurrences
- `border-[#FF4D4F]`: 1 occurrences

## Similar Color Candidates
No similar color candidates found.

## Migration Recommendations
| File | Line | Current | Suggested Token | Confidence |
| :--- | :--- | :--- | :--- | :--- |
| src\components\features\home\Subscribe.tsx | 93 | `bg-[#5B6C8F]` | `--background` | HIGH |
| src\components\features\orders\OrderCard.tsx | 121 | `bg-[#EFF4F9]` | `--background` | HIGH |
| src\components\features\orders\OrderCard.tsx | 129 | `bg-[#EB8435]` | `--background` | HIGH |
| src\components\features\admin\UnknownApiNotice.tsx | 17 | `border-[#D6B57D]` | `--border` | HIGH |
| src\components\features\admin\UnknownApiNotice.tsx | 17 | `bg-[#FFF8EE]` | `--background` | HIGH |
| src\components\features\admin\UnknownApiNotice.tsx | 17 | `text-[#8A6532]` | `--primary-foreground` | HIGH |
| src\components\features\admin\UnknownApiNotice.tsx | 23 | `text-[#6E5A37]` | `--primary-foreground` | HIGH |
| src\app\(shop)\orders\[id]\OrderTrackingClient.tsx | 168 | `bg-[#C3A57D]` | `--background` | HIGH |
| src\app\(shop)\orders\[id]\OrderTrackingClient.tsx | 240 | `bg-[#BFC7CF]` | `--background` | HIGH |
| src\app\(shop)\orders\[id]\OrderTrackingClient.tsx | 251 | `border-[#FF4D4F]` | `--border` | HIGH |
| src\app\(shop)\orders\[id]\OrderTrackingClient.tsx | 251 | `text-[#FF4D4F]` | `--primary-foreground` | HIGH |
| src\app\(shop)\orders\[id]\OrderTrackingClient.tsx | 268 | `bg-[#C8D5E0]` | `--background` | HIGH |
| src\app\(shop)\orders\[id]\OrderTrackingClient.tsx | 280 | `text-[#9A6A23]` | `--primary-foreground` | HIGH |

## Details by File
### src\components\features\home\Subscribe.tsx
- L93: **CA001** - Hardcoded arbitrary value: #5B6C8F (`bg-[#5B6C8F]`)

### src\components\features\orders\OrderCard.tsx
- L121: **CA001** - Hardcoded arbitrary value: #EFF4F9 (`bg-[#EFF4F9]`)
- L129: **CA001** - Hardcoded arbitrary value: #EB8435 (`bg-[#EB8435]`)

### src\components\features\admin\UnknownApiNotice.tsx
- L17: **CA001** - Hardcoded arbitrary value: #D6B57D (`border-[#D6B57D]`)
- L17: **CA001** - Hardcoded arbitrary value: #FFF8EE (`bg-[#FFF8EE]`)
- L17: **CA001** - Hardcoded arbitrary value: #8A6532 (`text-[#8A6532]`)
- L23: **CA001** - Hardcoded arbitrary value: #6E5A37 (`text-[#6E5A37]`)

### src\app\(shop)\orders\[id]\OrderTrackingClient.tsx
- L168: **CA001** - Hardcoded arbitrary value: #C3A57D (`bg-[#C3A57D]`)
- L240: **CA001** - Hardcoded arbitrary value: #BFC7CF (`bg-[#BFC7CF]`)
- L251: **CA001** - Hardcoded arbitrary value: #FF4D4F (`border-[#FF4D4F]`)
- L251: **CA001** - Hardcoded arbitrary value: #FF4D4F (`text-[#FF4D4F]`)
- L268: **CA001** - Hardcoded arbitrary value: #C8D5E0 (`bg-[#C8D5E0]`)
- L280: **CA001** - Hardcoded arbitrary value: #9A6A23 (`text-[#9A6A23]`)

