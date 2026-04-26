# Lighthouse Optimization Plan - Target 90+

## Current Score (2026-04-23)
- Performance: TBD
- Accessibility: 87 ⚠️
- Best Practices: TBD
- SEO: TBD

## Issues Found & Priority Fixes

### 1. SEO - Metadata (HIGH) ✅ FIXED
- **File:** `src/app/layout.tsx`
- **Fix:** Added proper metadata with title template, Vietnamese keywords, OpenGraph

### 2. SEO - Language Tag (HIGH) ✅ FIXED
- **File:** `src/app/layout.tsx:39`
- **Fix:** Changed `lang="en"` → `lang="vi"`

### 3. Performance - Lazy Load Chatbot (HIGH) ✅ FIXED
- **File:** `src/app/template.tsx`
- **Fix:** Using `next/dynamic` with `ssr: false` for Chatbot component

### 4. Accessibility - Icon-only Buttons (HIGH) ✅ FIXED
- **Files:** Footer.tsx (4 buttons), Chatbot.tsx (already has aria-label)
- **Fix:** Added aria-label to all icon-only buttons

### 5. Performance - Font Optimization (MEDIUM)
- **Status:** Using Geist fonts via CSS - acceptable for now
- **Note:** Project uses `--font-geist-sans/mono` which are self-hosted Next.js fonts

## Implementation Order

1. [x] Audit codebase - DONE
2. [x] Fix layout.tsx (lang="vi" + metadata) - DONE
3. [x] Lazy load Chatbot with next/dynamic - DONE
4. [x] Add aria-labels to icon-only buttons - DONE
5. [ ] Run Lighthouse verify

## Summary of Changes Made
| File | Change |
|------|-------|
| `src/app/layout.tsx` | Updated metadata + lang="vi" + env access fix |
| `src/app/template.tsx` | Added dynamic import for Chatbot |
| `src/components/features/Footer.tsx` | Added aria-labels to 4 social buttons |

## Build Status
✅ Build PASSED - Ready for Lighthouse test

## Next Steps
1. Run Lighthouse audit: `npm run lint` then test in browser
2. Verify Accessibility score improvement (should be 95+)

## Files Modified
- `src/app/layout.tsx` (8 lines changed)
- `src/app/template.tsx` (full rewrite with dynamic import)
- `src/components/features/Footer.tsx` (4 aria-labels added)

## Expected Impact
- Accessibility: 87 → 95+ ✅
- Performance: +5-10 points
- SEO: +5-10 points