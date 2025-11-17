import { Product } from "@/domain/product";

export function filterAvailable(products: Product[]): Product[] {
  return products.filter(p => p.price > 0);
}
