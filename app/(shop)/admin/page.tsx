/**
 * Giao diện Quản trị viên (Admin Dashboard)
 * 
 * Đây là trang dashboard chính dành cho Admin (hiện tại đang là mock).
 * Trong tương lai sẽ hiển thị các chỉ số tổng quan, biểu đồ và menu điều hướng quản trị.
 */
export default function AdminDashboard() {
  return (
    <main className="container mx-auto p-10 space-y-4">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      <p className="text-gray-600">Quản trị hệ thống.</p>
    </main>
  );
}
