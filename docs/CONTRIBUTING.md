# Contributing Guide

**Mục đích:** Hướng dẫn đóng góp code, quy trình review, và convention.

---

## 🤝 Contributing to Frontend Architecture

Cảm ơn bạn vì muốn đóng góp! Hướng dẫn này sẽ giúp bạn quy trình phát triển, kiểm tra, và submit pull request.

---

## 📋 Prerequisites

- Node.js 22+
- pnpm (recommended) hoặc npm
- Git (đã configured SSH keys)
- VS Code (recommended)
- Backend services chạy cục bộ (xem [GETTING_STARTED.md](./GETTING_STARTED.md))

---

## 🚀 Getting Started

### 1. Fork & Clone

```bash
# Fork repository trên GitHub
# Clone your fork
git clone https://github.com/YOUR_USERNAME/frontend-architecture.git
cd frontend-architecture

# Add upstream remote
git remote add upstream https://github.com/ORIGINAL/frontend-architecture.git
```

### 2. Create Feature Branch

```bash
# Cập nhật main từ upstream
git fetch upstream
git checkout main
git rebase upstream/main

# Create feature branch
git checkout -b feat/your-feature-name
```

**Naming Convention:**
- `feat/` - Tính năng mới
- `fix/` - Fix bug
- `docs/` - Documentation
- `refactor/` - Refactoring code
- `chore/` - Build, config, dependencies
- `test/` - Tests

### 3. Make Changes

Follow code style guidelines (see [BEST_PRACTICES.md](./BEST_PRACTICES.md)):

```typescript
// ✅ Good: Typed, clear, error-handled
const handleAddToCart = async (productId: string) => {
  try {
    const [cart, err] = await safe(
      CartRepository.addToCart({ productId, quantity: 1 })
    );
    
    if (err) {
      setError(`${t('error.addToCart')}: ${err.message}`);
      return;
    }
    
    setSuccess(t('success.itemAdded'));
  } catch (unexpected) {
    console.error('Unexpected error:', unexpected);
  }
};

// ❌ Bad: Unclear, untyped, no error handling
const addItem = () => {
  fetch('/api/carts/add', {
    method: 'POST',
    body: JSON.stringify({ productId })
  }).then(r => r.json()).then(d => alert('Added!'));
};
```

---

## ✅ Pre-Commit Checklist

Trước khi commit:

- [ ] **Code builds clean:** `pnpm build`
- [ ] **Linting passes:** `pnpm lint`
- [ ] **All tests pass:** `pnpm test -- --run`
- [ ] **No console errors:** Check browser DevTools
- [ ] **Followed TypeScript types:** No `any` unless documented
- [ ] **Updated related tests:** Add/update tests for your change
- [ ] **Updated TypeScript interfaces:** If API changed
- [ ] **No hardcoded strings:** Use localization (`t()`)
- [ ] **Added error handling:** Don't let errors be silent

---

## 📝 Commit Messages

Follow Conventional Commits format:

```bash
# Format
git commit -m "type(scope): description"

# Examples
git commit -m "feat(product): add product rating display"
git commit -m "fix(cart): prevent double add-to-cart"
git commit -m "docs(api): update endpoint documentation"
git commit -m "test(auth): add login error cases"
git commit -m "refactor(types): simplify product interface"

# Multi-line for detailed commits
git commit -m "feat(checkout): implement one-click payment

- Add Stripe integration
- Add payment method selection
- Add order confirmation email"
```

---

## 🧪 Testing Checklist

### Run Tests Locally

```bash
# Run all tests
pnpm test -- --run

# Run specific test file
pnpm test -- ProductDetailClient.test.tsx --run

# Run with coverage
pnpm test -- --coverage --run

# Watch mode for development
pnpm test
```

### Types of Tests to Add

#### 1. Unit Tests (Test isolated functions)

```typescript
// lib/__tests__/utils.test.ts
import { formatPrice } from '../utils';

describe('formatPrice', () => {
  it('should format Vietnamese currency', () => {
    expect(formatPrice(1000000)).toBe('1,000,000₫');
  });
  
  it('should handle 0', () => {
    expect(formatPrice(0)).toBe('0₫');
  });
  
  it('should handle negative', () => {
    expect(formatPrice(-100)).toBe('-100₫');
  });
});
```

#### 2. Component Tests (Test React components)

```typescript
// components/__tests__/ProductCard.test.tsx
import { render, screen } from '@testing-library/react';
import { ProductCard } from '../ProductCard';

describe('ProductCard', () => {
  it('should render product name and price', () => {
    render(<ProductCard product={mockProduct} />);
    
    expect(screen.getByText('Nike Shoes')).toBeInTheDocument();
    expect(screen.getByText('1,000,000₫')).toBeInTheDocument();
  });
  
  it('should call onSelectProduct when clicked', async () => {
    const onSelect = vi.fn();
    const { user } = render(
      <ProductCard product={mockProduct} onSelect={onSelect} />
    );
    
    await user.click(screen.getByRole('button'));
    expect(onSelect).toHaveBeenCalledWith(mockProduct.id);
  });
});
```

#### 3. Integration Tests (Test repository + hook)

```typescript
// infrastructure/__tests__/use-product-detail.integration.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { useProductDetail } from '../../presentation/hooks';

describe('useProductDetail integration', () => {
  it('should fetch and cache product', async () => {
    const { result } = renderHook(() => useProductDetail('p1'));
    
    expect(result.current.isLoading).toBe(true);
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    
    expect(result.current.data?.name).toBe('Nike Shoes');
  });
});
```

---

## 🔍 Code Review Self-Check

Before submitting PR:

### Architecture

- [ ] Follows clean architecture (domain → application → infrastructure)
- [ ] Dependencies flow correctly (no circular imports)
- [ ] Repository pattern used for API calls
- [ ] No direct fetch/axios calls in components

### TypeScript

- [ ] All types properly defined (no `any` unless eslint-disable with comment)
- [ ] Interfaces in appropriate layer
- [ ] Union types for error handling

### Error Handling

- [ ] Uses `safe()` utility or try-catch
- [ ] No silent failures
- [ ] User-friendly error messages via localization
- [ ] Console logs for debugging only

### Testing

- [ ] Unit tests for business logic
- [ ] Component tests for UI behavior
- [ ] Mocks properly set up
- [ ] No skipped tests (`skip()`)

### Localization

- [ ] No hardcoded strings in UI
- [ ] Uses `t()` from useTranslation()
- [ ] Both Vietnamese & English translations added

### Performance

- [ ] useCallback/useMemo where needed
- [ ] TanStack Query caching strategy clear
- [ ] No unnecessary re-renders
- [ ] Lazy loading for routes

---

## 📤 Creating Pull Request

### Push to Remote

```bash
# Push your branch (create PR on first push)
git push -u origin feat/your-feature-name

# Subsequent pushes
git push origin feat/your-feature-name
```

### PR Title & Description Template

```markdown
## 📝 Description
What does this PR do? Why is it needed?

## 🔗 Related Issues
Closes #123

## 🧪 Testing
How to test this change:
1. Step 1
2. Step 2
3. Step 3

## 📸 Screenshots (if UI change)
[Add screenshots if applicable]

## ✅ Checklist
- [ ] Code follows style guidelines
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] Linting passes
- [ ] All tests pass
```

### Example PR

```markdown
## 📝 Description
Add rating display to product detail page. Shows average rating and total reviews.

## 🔗 Related Issues
Closes #456

## 🧪 Testing
1. Navigate to product detail page
2. Check that rating stars appear
3. Click on rating to see reviews

## ✅ Checklist
- [x] Code follows style guidelines
- [x] Tests added (ProductRating.test.tsx)
- [x] Updated ProductDetailClient.tsx
- [x] Linting passes
- [x] All tests pass (146/146)
```

---

## 📋 PR Review Process

### Automated Checks

Your PR will automatically:
- ✅ Run ESLint
- ✅ Run TypeScript compiler
- ✅ Run all tests
- ✅ Generate coverage report

### Manual Review

Reviewers will check:
1. **Code Quality** - Is it readable, maintainable, following patterns?
2. **Architecture** - Does it violate clean architecture?
3. **Tests** - Are they sufficient and meaningful?
4. **Performance** - Could it cause slowness?
5. **UX** - Is the user experience good?

### Addressing Feedback

```bash
# Make changes based on feedback
# (edit files)

# Commit with same branch
git add .
git commit -m "Address review feedback"

# Push (no need to force push unless asked)
git push origin feat/your-feature-name
```

---

## 🔄 Merging & Cleanup

Once approved:

1. Someone with write access will merge
2. Your branch will auto-delete on GitHub
3. Clean up locally:

```bash
# Switch to main
git checkout main

# Fetch latest from upstream
git fetch upstream

# Rebase on latest main
git rebase upstream/main

# Delete local branch
git branch -d feat/your-feature-name
```

---

## 📚 Resources

- [BEST_PRACTICES.md](./BEST_PRACTICES.md) - Code style
- [TESTING_GUIDE.md](./TESTING_GUIDE.md) - Testing patterns
- [DATA_FLOW_GUIDE.md](./DATA_FLOW_GUIDE.md) - Data flow examples
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - Common issues
- [Architecture Document](./ARCHITECTURE.md) - System architecture

---

## 🎓 Learning Path for Contributors

1. **New to project?** Start with [GETTING_STARTED.md](./GETTING_STARTED.md)
2. **Understanding architecture?** Read [FOLDER_STRUCTURE.md](./FOLDER_STRUCTURE.md)
3. **Ready to code?** Follow [BEST_PRACTICES.md](./BEST_PRACTICES.md)
4. **Writing tests?** Use [TESTING_GUIDE.md](./TESTING_GUIDE.md)
5. **Stuck?** Check [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
6. **Making PR?** Use this guide

---

## 🤔 FAQ

### Q: How long does code review take?
**A:** Usually 24-48 hours. We review thoroughly to maintain quality.

### Q: Can I open a draft PR?
**A:** Yes! Mark it as Draft and get early feedback while still working.

### Q: What if my branch conflicts with main?
```bash
git fetch upstream
git rebase upstream/main
# Resolve conflicts, then:
git add .
git rebase --continue
git push -f origin feat/your-feature-name
```

### Q: Can I commit directly to main?
**A:** No. All changes must go through PR process for code review.

### Q: How do I undo a commit?
```bash
# If not pushed yet:
git reset --soft HEAD~1  # Keep changes, undo commit

# If already pushed:
git revert HEAD  # Creates new commit that undoes changes
git push origin feat/your-feature-name
```

---

**Thank you for contributing! 🎉**

