/**
 * Thư mục Lớp Trình bày (Presentation Layer)
 * 
 * Lớp này chịu trách nhiệm chuẩn bị dữ liệu và trạng thái (State) trước khi 
 * đưa lên UI (View). Thường chứa các Custom Hooks (React Query) phục vụ 
 * call API, format dữ liệu nhằm tách biệt logic khỏi các component giao diện.
 */

export * from "./hooks";
// export * from "./components"; // Nếu khởi tạo mô hình component barrel