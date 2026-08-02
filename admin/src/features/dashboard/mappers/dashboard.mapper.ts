import type { DashboardMetrics } from "../domain/DashboardMetrics";
import type { SalesTodayDto, OrderDto, ActivityDto } from "../types/api/dashboard.dto";

export function mapToDashboardMetrics(dto: Partial<SalesTodayDto> & Record<string, any>, orders: OrderDto[] | null): DashboardMetrics {
  return {
    monthRevenue: dto.monthRevenue ?? dto.total ?? 0,
    monthWorkOrderRevenue: dto.monthWorkOrderRevenue ?? 0,
    todayRevenue: dto.todayRevenue ?? 0,
    workOrdersActive: dto.workOrdersActive ?? (orders ? orders.length : 0),
    pendingInvoices: dto.pendingInvoices ?? 0,
    todayAppointments: dto.todayAppointments ?? 0,
    totalClients: dto.totalClients ?? 0,
    totalServices: dto.totalServices ?? 0,
  };
}

export function mapActivityDtos(activity: ActivityDto[] | null) {
  return (activity ?? []).map(a => ({ id: a.id, message: a.message, activityType: a.activity_type, createdAt: a.created_at, orderNumber: a.order_number, customerName: a.customer_name }));
}
