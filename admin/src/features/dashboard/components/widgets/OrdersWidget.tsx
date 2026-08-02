import React from "react";
import type { OrderDto } from "../types/api/dashboard.dto";

export default function OrdersWidget({ orders = [] as OrderDto[] }: { orders?: OrderDto[] }) {
  return (
    <div className="rounded-xl border bg-surface-secondary p-4">
      <h3 className="font-semibold mb-2">Últimas órdenes</h3>
      <ul className="space-y-2 text-sm">
        {orders.map(o => (
          <li key={o.id} className="flex justify-between">
            <div>
              <div className="font-medium">{o.order_number || `#${o.id}`}</div>
              <div className="text-xs text-text-tertiary">{o.customer_name} • {o.status}</div>
            </div>
            <div className="text-xs text-text-tertiary">{o.updated_at?.split('T')[0]}</div>
          </li>
        ))}
        {orders.length === 0 && <li className="text-sm text-text-tertiary">Sin órdenes recientes</li>}
      </ul>
    </div>
  );
}
