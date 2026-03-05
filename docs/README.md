# Frontend Architecture - Tài Liệu Toàn Diện (Comprehensive Documentation)

**Dự án:** frontend-architecture  
**Phiên bản:** 0.2.0  
**Ngôn ngữ:** TypeScript + React 19 + Next.js 14  
**Kiến trúc:** Clean Architecture + Domain-Driven Design (DDD)  
**Cập nhật:** March 5, 2026

---

## 📚 Hướng Dẫn Đọc Tài Liệu (Documentation Guide)

Chọn hướng dẫn phù hợp với vai trò và mục đích của bạn:

### 🎯 Bắt Đầu Nhanh (Quick Start)
- **Mới vào dự án?** → Đọc [GETTING_STARTED.md](./GETTING_STARTED.md) (10 phút)
- **Muốn hiểu project trước khi code?** → Đọc [PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md) (30 phút)

### 🏗️ Hiểu Kiến Trúc (Architecture Deep-Dive)
- **Nguyên tắc Clean Architecture?** → [ARCHITECTURE.md](./ARCHITECTURE.md)
- **Cấu trúc thư mục chi tiết?** → [FOLDER_STRUCTURE.md](./FOLDER_STRUCTURE.md)
- **Luồng dữ liệu từ UI đến API?** → [DATA_FLOW_GUIDE.md](./DATA_FLOW_GUIDE.md)

### 📖 Đọc Hiểu Code (File-by-File Guides)
- **Domain Layer** → [LAYER_DOMAIN.md](./LAYER_DOMAIN.md)
- **Application Layer** → [LAYER_APPLICATION.md](./LAYER_APPLICATION.md)
- **Infrastructure Layer** → [LAYER_INFRASTRUCTURE.md](./LAYER_INFRASTRUCTURE.md)
- **Presentation Layer** → [LAYER_PRESENTATION.md](./LAYER_PRESENTATION.md)
- **Shared Utilities** → [LAYER_SHARED.md](./LAYER_SHARED.md)
- **Components UI** → [LAYER_COMPONENTS.md](./LAYER_COMPONENTS.md)

### 🔌 API & Backend
- **API Integration & Tương thích** → [API_INTEGRATION_AUDIT_DOC.md](./API_INTEGRATION_AUDIT_DOC.md)
- **API Routes & Proxy** → [API_ROUTES.md](./API_ROUTES.md) - Danh sách đầy đủ endpoints, request/response
- **Error Handling Strategy** → [ERROR_HANDLING.md](./ERROR_HANDLING.md) - Error hierarchy, mapping, handling patterns

### 🧪 Testing & Quality
- **Chiến lược Testing** → [TESTING_GUIDE.md](./TESTING_GUIDE.md)
- **Linting & Format** → [CODE_QUALITY.md](./CODE_QUALITY.md)

### 🚀 Phát Triển & Triển Khai
- **Setup Development Environment** → [DEVELOPMENT_SETUP.md](./DEVELOPMENT_SETUP.md)
- **Contributing Guidelines** → [CONTRIBUTING.md](./CONTRIBUTING.md) - Git workflow, PR process, code review
- **Deployment Guide** → [DEPLOYMENT.md](./DEPLOYMENT.md)

### 🐛 Xử Lý Vấn Đề
- **Troubleshooting** → [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

### 📌 Tham Khảo Nhanh
- **Glossary** → [GLOSSARY.md](./GLOSSARY.md)
- **Best Practices** → [BEST_PRACTICES.md](./BEST_PRACTICES.md)
- **Cheat Sheet** → [CHEAT_SHEET.md](./CHEAT_SHEET.md) - Commands, code snippets, quick reference

---

## 🗂️ Cây Thư Mục Tài Liệu

```
docs/
├── README.md                          # ← Bạn đang xem
├── GETTING_STARTED.md                 # Bắt đầu nhanh trong 10 phút
├── PROJECT_OVERVIEW.md                # Tổng quan dự án chi tiết
├── PROJECT_WALKTHROUGH.md             # Hướng dẫn đi bộ toàn dự án
│
├── ARCHITECTURE.md                    # Clean Architecture & DDD (chi tiết)
├── FOLDER_STRUCTURE.md                # Chi tiết thư mục từng tầng
├── DATA_FLOW_GUIDE.md                 # Luồng dữ liệu end-to-end
│
├── LAYER_DOMAIN.md                    # Domain Layer (Tầng Kinh doanh)
├── LAYER_APPLICATION.md               # Application Layer (Tầng Use-Case)
├── LAYER_INFRASTRUCTURE.md            # Infrastructure Layer (Tầng Kỹ thuật)
├── LAYER_PRESENTATION.md              # Presentation Layer (Tầng Giao diện)
├── LAYER_SHARED.md                    # Shared Utilities (Tiện ích dùng chung)
├── LAYER_COMPONENTS.md                # Components UI (Thành phần ReactJS)
│
├── API_INTEGRATION_AUDIT_DOC.md       # Kiểm toán API (Backend mismatch fixes)
├── API_ROUTES.md                      # Danh sách API routes, endpoints, examples
├── ERROR_HANDLING.md                  # Error hierarchy, mapping, handling patterns
│
├── TESTING_GUIDE.md                   # Unit, Integration, E2E Testing
├── CODE_QUALITY.md                    # ESLint, Prettier, TypeScript
│
├── DEVELOPMENT_SETUP.md               # Cài đặt môi trường phát triển
├── CONTRIBUTING.md                    # Git workflow, PR process, code review
├── DEPLOYMENT.md                      # Deploy lên staging/production
│
├── TROUBLESHOOTING.md                 # Giải quyết vấn đề thường gặp
├── GLOSSARY.md                        # Thuật ngữ & định nghĩa
├── BEST_PRACTICES.md                  # Best Practices code
└── CHEAT_SHEET.md                     # Gợi ý nhanh, code snippets
```

---

## 📊 Tóm Tắt Dự Án (Executive Summary)

### Loại Dự Án
**E-Commerce Frontend** - Giao diện mua sắm trực tuyến với đầy đủ tính năng: Xem sản phẩm, Tìm kiếm, Giỏ hàng, Thanh toán, Quản lý tài khoản người dùng.

### Tech Stack
| Lớp | Công nghệ |
|-----|-----------|
| **Frontend Framework** | React 19 + Next.js 14 |
| **Language** | TypeScript |
| **State Management** | Zustand (client state) + TanStack Query (server state) |
| **Styling** | Tailwind CSS |
| **UI Components** | shadcn/ui |
| **Form Validation** | Zod + React Hook Form |
| **HTTP Client** | Axios + Fetch API |
| **Testing** | Vitest + React Testing Library |
| **API Documentation** | Postman Collections |

### Kiến Trúc Tổng Quan
```
┌─────────────────────────────────────────────────────────────┐
│                      Presentation Layer                       │
│    (React Components, Hooks, Pages, State Management)         │
└───────────────────────┬─────────────────────────────────────┘
                        │ (import)
┌───────────────────────▼─────────────────────────────────────┐
│                    Application Layer                          │
│      (Use-Cases, Business Logic Orchestration)               │
└───────────────────────┬─────────────────────────────────────┘
                        │ (depends on)
┌───────────────────────▼─────────────────────────────────────┐
│                  Infrastructure Layer                         │
│    (Repositories, HTTP Client, Storage, Persistence)        │
└───────────────────────┬─────────────────────────────────────┘
                        │ (implements)
┌───────────────────────▼─────────────────────────────────────┐
│                      Domain Layer                             │
│     (Entities, Value Objects, Interfaces, Business Rules)    │
└─────────────────────────────────────────────────────────────┘
                        │ (separate)
┌───────────────────────▼─────────────────────────────────────┐
│                    Shared Utilities                           │
│      (Constants, Types, Validators, Pure Functions)          │
└─────────────────────────────────────────────────────────────┘
```

### Backend Services
Dự án Frontend kết nối với **3 Backend Services** độc lập:

| Service | Port | Chức Năng |
|---------|------|----------|
| **User Service** | 8081 | Auth, Profile, User Management |
| **Product Service** | 8082 | Products, Brands, Categories |
| **Cart Service** | 8083 | Shopping Cart, Checkout |

### Tính Năng Chính
- ✅ Xác thực người dùng (Email/Google OAuth)
- ✅ Tìm kiếm & lọc sản phẩm (phân trang)
- ✅ Quản lý giỏ hàng (thêm, sửa, xóa)
- ✅ Thanh toán (tính giá, discount)
- ✅ Quản lý đơn hàng
- ✅ Hồ sơ người dùng & địa chỉ
- ✅ Quản lý yêu thích (Wishlist)
- ✅ Hỗ trợ đa ngôn ngữ (EN, VI)

---

## 🚀 Bắt Đầu Trong 5 Phút

### 1. Clone & Install
```bash
git clone <repo-url>
cd frontend-architecture
pnpm install
```

### 2. Setup Environment
```bash
# Copy example env
cp .env.example .env.local

# Edit .env.local với backend URLs
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
```

### 3. Start Dev Server
```bash
pnpm dev
```

Truy cập: `http://localhost:3000`

### 4. Chạy Test
```bash
pnpm test                 # Interactive test runner
pnpm test -- --run       # One-time run
pnpm lint                # ESLint check
```

---

## 📖 Lộ Trình Học Tập Khuyên Dùng

**Nếu bạn là Frontend Developer muốn hiểu project:**

1. **Ngày 1-2** (2 giờ)
   - Đọc [GETTING_STARTED.md](./GETTING_STARTED.md)
   - Chạy project cục bộ, xem UI hoạt động

2. **Ngày 3-4** (3 giờ)
   - Đọc [PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md)
   - Đọc [ARCHITECTURE.md](./ARCHITECTURE.md) phần "Overview"

3. **Tuần 1** (5-8 giờ)
   - Đọc từng LAYER_*.md một
   - Xem code thực tế match với documentation
   - Thực hành thay đổi nhỏ (ex: thêm field validation)

4. **Tuần 2+** (Ongoing)
   - Đọc [DATA_FLOW_GUIDE.md](./DATA_FLOW_GUIDE.md) - hiểu data flow để debug
   - Đọc [BEST_PRACTICES.md](./BEST_PRACTICES.md) - code tốt
   - Đọc [TESTING_GUIDE.md](./TESTING_GUIDE.md) - viết test

**Nếu bạn là Backend Developer hoặc QA:**

1. Đọc [API_INTEGRATION_AUDIT_DOC.md](./API_INTEGRATION_AUDIT_DOC.md)
2. Đọc [API_ROUTES.md](./API_ROUTES.md)
3. Đọc [ERROR_HANDLING.md](./ERROR_HANDLING.md)

---

## 💡 Tại Sao Cấu Trúc Này?

### Clean Architecture Benefits
✅ **Testable** - Dễ viết test vì separation of concerns  
✅ **Maintainable** - Thay đổi backend không ảnh hưởng domain logic  
✅ **Scalable** - Thêm feature mới dễ dàng  
✅ **Understandable** - Code tính ổn định, dễ follow  
✅ **Flexible** - Có thể swap Database, API client dễ dàng  

### DDD Benefits
✅ **Domain-Driven** - Code phản ánh business language  
✅ **Ubiquitous Language** - Team nói chung một "ngôn ngữ"  
✅ **Loosely Coupled** - Entities độc lập, tái sử dụng được  
✅ **Rich Models** - Logic không phải ở dàn UI, tập trung domain  

---

## 📞 Cần Giúp Đỡ?

- **Không biết bắt đầu?** → [GETTING_STARTED.md](./GETTING_STARTED.md)
- **Hiểu project như thế nào?** → [PROJECT_WALKTHROUGH.md](./PROJECT_WALKTHROUGH.md)
- **Lỗi gì đó?** → [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
- **Viết code sao cho đúng?** → [BEST_PRACTICES.md](./BEST_PRACTICES.md)
- **API mismatch?** → [API_INTEGRATION_AUDIT_DOC.md](./API_INTEGRATION_AUDIT_DOC.md)

---

## 🎯 Key Takeaways

1. **Kiến trúc 5 lớp** - Domain, Application, Infrastructure, Presentation, Shared
2. **API Proxy** - Frontend không gọi backend trực tiếp, qua Next.js routes
3. **Token Management** - Tự động refresh token khi hết hạn via interceptors
4. **Error Mapping** - Backend error → Domain error → UI message
5. **State = Server + Client** - TanStack Query cho server state, Zustand cho client state
6. **Testing** - Unit (Domain), Integration (Use-cases), Component (UI)

---

## 📅 Lịch Sử Thay Đổi

| Ngày | Thay Đổi |
|------|---------|
| 2026-03-05 | Khởi tạo toàn bộ documentation |
| 2026-03-03 | API Integration Audit hoàn tất |
| 2026-02-28 | Architecture refactoring hoàn tất |

---

**Last Updated:** March 5, 2026  
**Maintained By:** Frontend Team  
**Quality Level:** Production-grade, DDD-aligned

