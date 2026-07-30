import { api } from "@/api/client";

export const blogApi = {
  list: () => api.get("/blog"),
  getById: (id: string) => api.get(`/blog/id/${id}`),
};
