interface Props {
  params: { id: string };
}

export default async function ProductDetailPage({ params }: Props) {
  const { id } = params;
  const product = {
    id,
    name: `Sản phẩm #${id}`,
    price: "9.900.000đ",
    description: "Mô tả sản phẩm cơ bản.",
  };

  return (
    <section style={{ padding: 40 }}>
      <h1>{product.name}</h1>

      <p style={{ marginTop: 10, fontWeight: "bold" }}>{product.price}</p>

      <p style={{ marginTop: 20 }}>{product.description}</p>

      <button style={{ marginTop: 30, padding: "8px 16px" }}>
        Thêm vào giỏ
      </button>
    </section>
  );
}
