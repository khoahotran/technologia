/**
 * Tầng Infrastructure (Hạ tầng)
 *
 * Tầng này chịu trách nhiệm:
 * 1. Giao tiếp với External Services (HTTP Client, API)
 * 2. Lưu trữ dữ liệu bền vững (Persistence - LocalStorage, Cookies)
 * 3. Triển khai các Repositories cụ thể cho Domain
 * 4. Quản lý trạng thái ứng dụng (State - Zustand)
 */

// HTTP Client - Lớp giao tiếp API trung tâm
export * from "./http/client";

// Repositories - Triển khai các logic truy xuất dữ liệu
export * from "./repositories";

// Persistence - Công cụ lưu giữ dữ liệu ở phía Client
export * from "./persistence/storage";

// State (Zustand) - Các kho lưu trữ trạng thái toàn cục (Auth, UI...)
export * from "./state/auth.store";