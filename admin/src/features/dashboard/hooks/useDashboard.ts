import { useEffect, useState } from "react";
import { dashboardService } from "../services/dashboard.service";
import type { DashboardMetrics } from "../domain/DashboardMetrics";
import type { OrderDto, ActivityDto, AlertDto } from "../types/api/dashboard.dto";

export default function useDashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [orders, setOrders] = useState<OrderDto[]>([]);
  const [activity, setActivity] = useState<ActivityDto[]>([]);
  const [alerts, setAlerts] = useState<AlertDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await dashboardService.getDashboardData();
      setMetrics(res.metrics);
      setOrders(res.orders);
      setActivity(res.activity);
      setAlerts(res.alerts);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  return { metrics, orders, activity, alerts, loading, error, refresh: load };
}
