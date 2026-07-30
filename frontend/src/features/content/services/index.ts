import { api } from "@/api/client";

export const contentApi = {
  getConfig: () => api.get("/config"),
  getFAQ: () => api.get("/faqs"),
  getLegal: (slug: string) => api.get(`/legal/slug/${slug}`),
  sendContact: (data: Record<string, unknown>) => api.post("/contact", data),
};
