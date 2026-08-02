import React from "react";
import type { AlertDto } from "../types/api/dashboard.dto";

export default function AlertsWidget({ alerts = [] as AlertDto[] }) {
  return (
    <div className="rounded-xl border bg-surface-secondary p-4">
      <h3 className="font-semibold mb-2">Alertas</h3>
      <ul className="space-y-2 text-sm">
        {alerts.map(a => <li key={a.id} className={a.type === 'danger' ? 'text-red-500' : ''}>{a.title} — {a.message}</li>)}
        {alerts.length === 0 && <li className="text-sm text-text-tertiary">Sin alertas</li>}
      </ul>
    </div>
  );
}
