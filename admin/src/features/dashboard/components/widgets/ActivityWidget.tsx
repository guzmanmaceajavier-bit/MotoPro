import React from "react";
import type { ActivityDto } from "../types/api/dashboard.dto";

export default function ActivityWidget({ items = [] as ActivityDto[] }) {
  return (
    <div className="rounded-xl border bg-surface-secondary p-4">
      <h3 className="font-semibold mb-2">Actividad reciente</h3>
      <ul className="space-y-2 text-sm">
        {items.map(it => <li key={it.id}>{it.message}</li>)}
        {items.length === 0 && <li className="text-sm text-text-tertiary">No hay actividad reciente</li>}
      </ul>
    </div>
  );
}
