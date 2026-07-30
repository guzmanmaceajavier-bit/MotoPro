import { FALLBACK_PRODUCTS } from "../constants";
import type { FeaturedProduct } from "../types";

import { api } from "@/api/client";

export async function getFeaturedProducts(): Promise<FeaturedProduct[]> {
  try {
    const data = await api.get("/products?limit=8&featured=1&active=1") as any;
    const items = Array.isArray(data) ? data : data?.data || [];
    if (items.length > 0) {
      return items.map((p: any) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        image: p.image || p.primary_image || "",
        categoryName: p.category_name || p.categoryName || "Sin categoría",
        is_active: p.is_active ?? 1,
      }));
    }
  } catch {}
  return FALLBACK_PRODUCTS;
}
