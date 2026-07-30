import { api } from "@/api/client";

export const accountApi = {
  getProfile: () => api.get("/auth/me"),
  updateProfile: (data: Record<string, unknown>) => api.put("/auth/me", data),
  getOrders: () => api.get("/orders"),
  getAppointments: () => api.get("/appointments/my"),
};
