import { api } from "@/api/client";

export const shopApi = {
  list: (params?: Record<string, string>) => api.get(`/products?${new URLSearchParams(params || {}).toString()}`),
  getBySlug: (slug: string) => api.get(`/products/slug/${slug}`),
  getById: (id: string) => api.get(`/products/${id}`),
  getFeatured: () => api.get("/products/featured"),
  getCategories: () => api.get("/categories"),
  getBrands: () => api.get("/brands"),
  searchOrders: (q: string, type: string) => api.get(`/orders/search?q=${encodeURIComponent(q)}&type=${type}`),
};
