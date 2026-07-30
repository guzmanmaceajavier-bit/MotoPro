import { api } from "@/api/client";

export const servicesApi = {
  list: () => api.get("/services"),
  getById: (id: string) => api.get(`/services/${id}`),
  getMechanics: () => api.get("/mechanics"),
  getSlots: (date: string, mechanicId: string) => api.get(`/appointments/slots?date=${date}&mechanic_id=${mechanicId}`),
  createAppointment: (data: Record<string, unknown>) => api.post("/appointments", data),
  createServiceRequest: (data: Record<string, unknown>) => api.post("/service-requests", data),
};
