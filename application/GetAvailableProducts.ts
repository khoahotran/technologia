import { Product } from "@/domain/Product";

export function filterAvailable(products: Product[]): Product[] {
  return products.filter(p => p.price > 0);
}
