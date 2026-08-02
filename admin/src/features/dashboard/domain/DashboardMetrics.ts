export interface DashboardMetrics {
  monthRevenue: number;
  monthWorkOrderRevenue?: number;
  todayRevenue?: number;
  workOrdersActive: number;
  pendingInvoices: number;
  todayAppointments: number;
  totalClients: number;
  totalServices?: number;
}
