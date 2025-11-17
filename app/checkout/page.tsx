export default function CheckoutPage() {
  return (
    <section style={{ padding: 40 }}>
      <h1>Thanh toán</h1>

      <div style={{ marginTop: 20 }}>
        <p>Thông tin đơn hàng của bạn:</p>

        <ul style={{ marginTop: 12 }}>
          <li>Sản phẩm A — 1 x 12.000.000đ</li>
          <li>Sản phẩm B — 2 x 450.000đ</li>
        </ul>

        <p style={{ marginTop: 20, fontWeight: "bold" }}>
          Tổng: 12.900.000đ
        </p>

        <button style={{ marginTop: 30, padding: "8px 16px" }}>
          Xác nhận thanh toán
        </button>
      </div>
    </section>
  );
}
