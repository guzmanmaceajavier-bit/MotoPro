import { useState, useEffect } from "react";
import type { HeroStats } from "../types";
import { api } from "@/api/client";

const DEFAULT: HeroStats = { products: 5000, brands: 25, reviews: 1500, testimonials: 800 };

export function useHeroStats() {
  const [stats, setStats] = useState<HeroStats>(DEFAULT);

  useEffect(() => {
    Promise.all([
      api.get("/products").catch(() => []),
      api.get("/brands").catch(() => []),
      api.get("/reviews").catch(() => []),
    ]).then(([products, brands, reviews]) => {
      setStats({
        products: Array.isArray(products) ? products.length : DEFAULT.products,
        brands: Array.isArray(brands) ? brands.length : DEFAULT.brands,
        reviews: Array.isArray(reviews) ? reviews.length : DEFAULT.reviews,
        testimonials: DEFAULT.testimonials,
      });
    }).catch((err) => console.warn("[fetch]", err));
  }, []);

  return { stats, fmt: (n: number) => (n >= 1000 ? `${Math.floor(n / 1000)}+` : String(n)) };
}
