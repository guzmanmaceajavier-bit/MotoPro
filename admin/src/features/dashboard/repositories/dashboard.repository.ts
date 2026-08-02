import { api } from "@/api/client";
import type { SalesTodayDto, OrderDto, ActivityDto, AlertDto } from "../types/api/dashboard.dto";

// Repository for dashboard. Uses existing api client. If backend endpoint is not available,
// the implementation will return typed mocks. Replace with real API calls when backend is confirmed.

export const dashboardRepository = {
  async fetchDashboard(): Promise<{ kpis: SalesTodayDto & Record<string, any>; orders: OrderDto[]; activity: ActivityDto[]; alerts: AlertDto[] }>{
    try {
      // The backend documents GET /api/dashboard; api client prefixes /api internally
      const res = await api.get('/dashboard');
      return res;
    } catch (err) {
      // Fallback typed mocks
      const now = new Date().toISOString();
      const kpis: any = {
        monthRevenue: 12345,
        monthWorkOrderRevenue: 6789,
        todayRevenue: 1234,
        workOrdersActive: 3,
        pendingInvoices: 2,
        todayAppointments: 4,
        totalClients: 512,
        totalServices: 120,
      };
      const orders: OrderDto[] = Array.from({ length: 6 }).map((_, i) => ({
        id: 1000 + i,
        order_number: `ORD-${1000+i}`,
        customer_name: `Cliente ${i+1}`,
        vehicle_description: `Moto ${i+1}`,
        mechanic_name: i % 2 ? `Técnico ${i}` : undefined,
        status: i % 2 ? 'in_progress' : 'received',
        total: 100 + i * 10,
        priority: i === 0 ? 'urgent' : 'normal',
        updated_at: now,
      }));
      const activity: ActivityDto[] = Array.from({ length: 5 }).map((_, i) => ({
        id: `a-${i}`,
        activity_type: i % 2 ? 'work_order' : 'store_order',
        message: `Actividad de ejemplo ${i + 1}`,
        created_at: now,
        order_number: `ORD-${1000 + i}`,
        customer_name: `Cliente ${i + 1}`,
      }));
      const alerts: AlertDto[] = [
        { id: 'alert-1', title: 'Producto X bajo', message: 'Stock bajo para Producto X', type: 'warning', action: '/inventory' },
        { id: 'alert-2', title: 'Factura pendiente', message: 'Factura #123 pendiente', type: 'danger', action: '/orders' },
      ];
      return { kpis, orders, activity, alerts };
    }
  }
};
