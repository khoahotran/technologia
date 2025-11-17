"use client";

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <html>
      <body style={{ padding: 40, fontFamily: "sans-serif" }}>
        <h1>Lỗi toàn cục</h1>
        <p>{error.message}</p>

        <button
          onClick={() => reset()}
          style={{ padding: "8px 16px", marginTop: 20, cursor: "pointer" }}
        >
          Thử lại
        </button>
      </body>
    </html>
  );
}
