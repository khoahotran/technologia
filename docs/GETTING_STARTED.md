# Bắt Đầu Nhanh (Getting Started) - 10 Phút

**Mục đích:** Cài đặt, chạy project, và hiểu cơ bản trong 10 phút.

---

## ⚡ Yêu Cầu Hệ Thống

- **Node.js:** v18.17+ (kiểm tra với `node -v`)
- **pnpm:** v8+ (cài với `npm install -g pnpm`)
- **Backend Services:** 3 service chạy ở port 8081, 8082, 8083

---

## 🚀 Setup & Chạy

### Bước 1: Clone & Install (2 phút)
```bash
# Clone repository
git clone <repo-url>
cd frontend-architecture

# Install dependencies
pnpm install
```

### Bước 2: Cấu Hình Environment (1 phút)
```bash
# Copy file environment example
cp .env.example .env.local
```

Chỉnh sửa `.env.local`:
```env
# Frontend base URL
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000

# Backend service URLs (if direct access needed)
NEXT_PUBLIC_USER_SERVICE_URL=http://localhost:8081
NEXT_PUBLIC_PRODUCT_SERVICE_URL=http://localhost:8082
NEXT_PUBLIC_CART_SERVICE_URL=http://localhost:8083
```

> ⚠️ **Lưu ý:** Frontend **không gọi trực tiếp** đến backend services. Nó gọi qua **API Proxy Routes** ở `/api/**`.

### Bước 3: Kiểm Tra Backend Services
```bash
# Kiểm tra User Service (port 8081)
curl http://localhost:8081/health

# Kiểm tra Product Service (port 8082)
curl http://localhost:8082/health

# Kiểm tra Cart Service (port 8083)
curl http://localhost:8083/health
```

**Nếu lỗi 404:** Backend services chưa chạy. Start chúng trước!

### Bước 4: Start Development Server (2 phút)
```bash
pnpm dev
```

Output sẽ hiện:
```
- Local:        http://localhost:3000
- Environments: .env.local
```

Truy cập: **http://localhost:3000**

---

## 🔍 Kiểm Tra Setup Thành Công

### ✅ Dấu Hiệu Setup OK
- [ ] Trang Home load được (hiển thị sản phẩm)
- [ ] Có thể Đăng nhập (Login page hoạt động)
- [ ] Giỏ hàng không báo lỗi (Open cart, thêm sản phẩm)
- [ ] Console không có 404 errors cho `/api/**`

### ❌ Gặp Lỗi?

#### Lỗi 1: `ECONNREFUSED localhost:8081`
```
❌ User Service không chạy
✅ Giải pháp: Start User Service ở terminal khác
```

#### Lỗi 2: `Cannot GET /api/products`
```
❌ API Proxy route lỗi
✅ Giải pháp: Check next.config.mjs - rewrites config có đúng không?
```

#### Lỗi 3: `Failed to fetch auth token`
```
❌ Backend không return token đúng format
✅ Giải pháp: Kiểm tra POST /api/auth/login response
```

Xem chi tiết: [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

---

## 📂 Cấu Trúc Thư Mục Tóm Tắt

```
frontend-architecture/
├── app/                    # Next.js App Router
│   ├── api/               # ← API Proxy Routes (gọi Backend)
│   ├── (auth)/            # Auth pages (Login, Register)
│   └── (shop)/            # Shop pages (Products, Cart, etc)
│
├── domain/                # ← Business Rules (Entities, Interfaces)
├── application/           # ← Use-Cases (Business Logic)
├── infrastructure/        # ← HTTP Client, Repositories, Storage
├── presentation/          # ← Custom Hooks, Queries
├── components/            # ← React Components (Features, UI)
├── shared/                # ← Utils, Types, Validators
│
├── docs/                  # ← Documentation (bạn đang đọc)
├── package.json           # ← Dependencies
└── tsconfig.json          # ← TypeScript config
```

Giải thích chi tiết: [FOLDER_STRUCTURE.md](./FOLDER_STRUCTURE.md)

---

## 🧪 Chạy Test

```bash
# Interactive test runner (watch mode)
pnpm test

# Run all tests once
pnpm test -- --run

# Run test cho file cụ thể
pnpm test -- src/domain/product.test.ts
```

✅ **Kỳ vọng:** Tất cả 146 tests pass

---

## 💻 Phát Triển Thứ Nhất

### Mục tiêu: Thêm validation vào form Login

**Bước 1:** Mở file `shared/validators/api-schemas.ts`
```typescript
// Tìm LoginSchema
export const LoginSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6),
});
```

**Bước 2:** Thêm validation cho email format
```typescript
// Sửa thành:
export const LoginSchema = z.object({
  username: z.string().min(3).email("Invalid email format"),
  password: z.string().min(6),
});
```

**Bước 3:** Chạy test
```bash
pnpm test -- --run
```

**Bước 4:** Check thay đổi
- Lỗi validation sẽ hiển thị ở UI Form

Xong! 🎉

---

## 📖 Học Tiếp?

Sau khi setup thành công, **tìm hiểu project bằng cách:**

1. **Đọc:** [PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md) - Hiểu tổng quan
2. **Khám phá:** [project_walkthrough.md](./PROJECT_WALKTHROUGH.md) - Dạo một vòng project
3. **Sâu hơn:** [ARCHITECTURE.md](./ARCHITECTURE.md) - Clean Architecture details

---

## 🎯 Quick Commands

```bash
# Development
pnpm dev                 # Start dev server (port 3000)
pnpm test                # Run tests (watch mode)
pnpm test -- --run      # Run tests once
pnpm lint                # Check code quality (ESLint)
pnpm lint --fix         # Fix linting issues

# Building
pnpm build              # Build for production
pnpm start              # Start production server

# Code quality
pnpm format             # Format code with Prettier
pnpm type-check         # Check TypeScript

# Git
git status
git add .
git commit -m "message"
git push
```

---

## 🆘 Cần Giúp?

| Vấn đề | Hướng Dẫn |
|--------|---------|
| Setup lỗi | [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) |
| Không hiểu kiến trúc | [ARCHITECTURE.md](./ARCHITECTURE.md) |
| Muốn viết code | [BEST_PRACTICES.md](./BEST_PRACTICES.md) |
| Debug API issue | [API_ROUTES.md](./API_ROUTES.md) |
| Viết test | [TESTING_GUIDE.md](./TESTING_GUIDE.md) |

---

## ✨ Tiếp Theo?

**Sau 10 phút:**
- ✅ Cài đặt xong
- ✅ Hiểu cấu trúc cơ bản
- ✅ Biết cách chạy test & dev server

**Bước tiếp theo:**
1. Đọc [PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md)
2. Khám phá từng layer (LAYER_*.md)
3. Thực hành code tríển

---

**Chúc mừng! 🎉 Bạn đã setup thành công!**

**Last Updated:** March 5, 2026

