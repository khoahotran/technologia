# Sizing & Typography Audit Report

This report summarizes the state of the design system scaling, focusing on typography, spacing, and layout dimensions in the Next.js/Tailwind v4 environment.

## 1. Executive Summary

| Metric | Baseline | Post-Refactor |
| :--- | :--- | :--- |
| **Token Adoption Rate** | 97.52% | **98.63%** |
| **Hardcoded Arbitrary Values** | 103 | **57** |
| **Unique Font Sizes** | 91 | 90 |
| **Unique Spacing Scale** | 21 | 21 |

## 2. Scale Inconsistency Analysis

### Typography Drift
The audit detected a high number of unique typography configurations (90+). This is largely due to the use of arbitrary pixel values like `text-[10px]` (standardized now to `text-tiny`) and one-off `leading` / `tracking` values.

### Spacing Scale
The spacing scale is relatively healthy, adhering to the 4px Tailwind default for 98% of the codebase. The remaining 2% consists of viewport-relative units (`vh`, `vw`) and `calc()` expressions in complex components like the `Chatbot`.

### Layout Fragmentation
Component heights are the primary source of "magic numbers". Buttons and inputs vary slightly across the admin and shop modules.
- **Action**: Unified common banner heights under `--size-banner-*` tokens.

## 3. Top Issues Resolved

1. **Tiny Text Standardization**: 32 occurrences of `text-[10px]` and `text-[9px]` were migrated to a semantic `text-tiny` utility.
2. **Banner Scaling**: Fixed heights like `h-[400px]` and `h-[350px]` were moved to theme-driven variables.
3. **Radius Consolidation**: Large arbitrary radii like `rounded-[32px]` were mapped to `rounded-4xl`.
4. **Spacing Normalization**: Standardized common fixed widths (140px, 180px) to the nearest Tailwind scale values (w-36, w-44).

## 4. Technical Debt Hotspots

| Component / Directory | Debt Level | Issue Type |
| :--- | :--- | :--- |
| `src/app/(shop)/admin/reports` | HIGH | High density of `text-[10px]` and `min-w-[...]` |
| `src/components/features/Chatbot.tsx` | MEDIUM | Complex `calc` and `env()` safe-area logic |
| `src/app/(shop)/products/[id]` | LOW | Arbitrary `aspect-[4/3]` ratios |

## 5. Next Steps
- **UI Verification**: Review the `AdminReportsClient` to ensure `text-tiny` (10px) is readable across all devices.
- **Layout Primtives**: Implement a `<Container />` and `<Flex />` primitive component to further reduce the need for `p-*` and `m-*` at the component level.
- **CI Enforcement**: Use the `scripts/run-size-audit.mjs` in the CI pipeline to prevent new arbitrary values from being introduced.
