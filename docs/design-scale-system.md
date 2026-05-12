# Design Scale System

This document outlines the standardized sizing, spacing, and typography scales for the project, moving away from arbitrary pixel values to a tokenized system.

## 1. Typography Scale

| Token | CSS Variable | Value | Usage |
| :--- | :--- | :--- | :--- |
| `text-tiny` | `--text-tiny` | `0.625rem` (10px) | Legal text, badges, secondary info |
| `text-xs` | `--text-xs` | `0.75rem` (12px) | Small labels, captions |
| `text-sm` | `--text-sm` | `0.875rem` (14px) | Secondary body text |
| `text-base` | `--text-base` | `1rem` (16px) | Default body text |
| `text-lg` | `--text-lg` | `1.125rem` (18px) | Large body text, subheadings |
| `text-xl` | `--text-xl` | `1.25rem` (20px) | Small headings |
| `text-2xl` | `--text-2xl` | `1.5rem` (24px) | Main section headings |
| `text-display` | `--text-display` | `3rem` (48px) | Hero section titles |

## 2. Spacing & Sizing Scale

We follow a 4px (0.25rem) base scale.

| Token | Multiplier | Value (px) | Usage |
| :--- | :--- | :--- | :--- |
| `space-1` | 0.25 | 4px | Micro-spacing, inner gaps |
| `space-2` | 0.5 | 8px | Small component padding |
| `space-4` | 1 | 16px | Standard component padding |
| `space-6` | 1.5 | 24px | Section inner spacing |
| `space-8` | 2 | 32px | Section vertical spacing |
| `space-12` | 3 | 48px | Large section gaps |

### Component Specific Sizes
- **Navbar Height**: `4.5rem` (72px)
- **Sidebar Width**: `16rem` (256px)
- **Button Height (MD)**: `2.75rem` (44px)
- **Input Height (MD)**: `3rem` (48px)
- **Avatar (MD)**: `2.5rem` (40px)

## 3. Radius Scale

| Token | Value | Usage |
| :--- | :--- | :--- |
| `radius-sm` | `0.25rem` (4px) | Checkboxes, small inputs |
| `radius-md` | `0.5rem` (8px) | Buttons, small cards |
| `radius-lg` | `0.75rem` (12px) | Standard cards, modals |
| `radius-xl` | `1rem` (16px) | Large banners, sections |
| `radius-2xl` | `1.25rem` (20px) | Current project default |
| `radius-full` | `9999px` | Circular elements |

## 4. Layout Containers

- **Container SM**: `640px`
- **Container MD**: `768px`
- **Container LG**: `1024px`
- **Container XL**: `1280px`
- **Container 2XL**: `1536px`
- **Max Content Width**: `80rem` (1280px)

## 5. Implementation Rules
1. **Never use arbitrary pixels** for standard spacing (e.g., `p-[13px]`). Use the closest scale token.
2. **Standardize Heights**: All inputs and buttons should use the shared height tokens to ensure alignment.
3. **Responsive Scaling**: Use the `text-sm md:text-base` pattern instead of one-off pixel values for mobile vs desktop.
