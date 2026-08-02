import { dashboardRepository } from "../repositories/dashboard.repository";
import { mapToDashboardMetrics, mapActivityDtos } from "../mappers/dashboard.mapper";
import type { DashboardMetrics } from "../domain/DashboardMetrics";

export const dashboardService = {
  async getDashboardData(): Promise<{ metrics: DashboardMetrics; orders: any[]; activity: any[]; alerts: any[] }> {
    const res = await dashboardRepository.fetchDashboard();
    const metrics = mapToDashboardMetrics(res.kpis ?? {}, res.orders ?? []);
    const activity = mapActivityDtos(res.activity ?? []);
    return { metrics, orders: res.orders ?? [], activity, alerts: res.alerts ?? [] };
  }
};
