import React from "react";
import DashboardKPIs from "../components/widgets/DashboardKPIs";
import OrdersWidget from "../components/widgets/OrdersWidget";
import ActivityWidget from "../components/widgets/ActivityWidget";
import AlertsWidget from "../components/widgets/AlertsWidget";
import useDashboard from "../hooks/useDashboard";

export default function DashboardContainer() {
  const { metrics, orders, activity, alerts, loading } = useDashboard();
  return (
    <div className="space-y-6">
      <DashboardKPIs metrics={metrics} loading={loading} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <OrdersWidget orders={orders} />
          <ActivityWidget items={activity} />
        </div>
        <aside className="space-y-6">
          <AlertsWidget alerts={alerts} />
        </aside>
      </div>
    </div>
  );
}
