import React from "react";
import type { DashboardMetrics } from "../domain/DashboardMetrics";

export default function DashboardKPIs({ metrics, loading }: { metrics: DashboardMetrics | null; loading: boolean }) {
  if (loading || !metrics) {
    return <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{Array.from({length:4}).map((_,i)=>(<div key={i} className="rounded-xl border p-4"/>))}</div>;
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div>
        <div className="text-xs text-text-tertiary uppercase">Ingresos del Mes</div>
        <div className="text-2xl font-bold">${metrics.monthRevenue.toLocaleString()}</div>
      </div>
      <div>
        <div className="text-xs text-text-tertiary uppercase">Órdenes activas</div>
        <div className="text-2xl font-bold">{metrics.workOrdersActive}</div>
      </div>
      <div>
        <div className="text-xs text-text-tertiary uppercase">Clientes</div>
        <div className="text-2xl font-bold">{metrics.totalClients}</div>
      </div>
      <div>
        <div className="text-xs text-text-tertiary uppercase">Citas hoy</div>
        <div className="text-2xl font-bold">{metrics.todayAppointments}</div>
      </div>
    </div>
  );
}
