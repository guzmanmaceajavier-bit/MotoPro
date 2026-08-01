import { useState, useEffect } from "react";
import { api } from "@/api/client";
import { StatusBadge } from "./StatusBadge";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Wrench, Clock, ChevronDown, ChevronRight, History } from "lucide-react";
import { Spinner, EmptyState } from "@/components/ui";

interface WorkOrderItem {
  id: string | number;
  title?: string;
  description?: string;
  status: string;
  created_at: string;
  scheduled_date?: string;
  mechanic_name?: string;
  cost?: number;
  diagnosis?: string;
  parts_used?: string[];
  photos?: string[];
  warranty_info?: string;
  vehicle_plate?: string;
  vehicle_description?: string;
}

interface GroupedOrders {
  [key: string]: WorkOrderItem[];
}

function getVehicleKey(order: WorkOrderItem): string {
  return order.vehicle_plate || order.vehicle_description || "Otro";
}

function VehicleTimeline({ vehicle, orders }: { vehicle: string; orders: WorkOrderItem[] }) {
  const [expanded, setExpanded] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<string | number>>(new Set());

  const toggleDetail = (id: string | number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="bg-surface-secondary border border-border rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-surface-tertiary/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Wrench className="w-5 h-5 text-interactive-accent" />
          <span className="text-text-primary font-medium">{vehicle}</span>
          <span className="text-text-secondary text-sm">({orders.length} servicios)</span>
        </div>
        {expanded ? (
          <ChevronDown className="w-5 h-5 text-text-secondary" />
        ) : (
          <ChevronRight className="w-5 h-5 text-text-secondary" />
        )}
      </button>
      {expanded && (
        <div className="border-t border-border">
          {orders.map((order, index) => (
            <div key={order.id}>
              <div
                className="flex items-center justify-between p-4 hover:bg-surface-tertiary/30 transition-colors cursor-pointer"
                onClick={() => toggleDetail(order.id)}
              >
                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-interactive-accent" />
                    {index < orders.length - 1 && (
                      <div className="w-px h-full min-h-[2rem] bg-border" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-text-primary text-sm font-medium">
                      {order.title || `Servicio #${order.id}`}
                    </h4>
                    <div className="flex items-center gap-3 mt-1">
                      <div className="flex items-center gap-1 text-text-secondary text-xs">
                        <Clock className="w-3 h-3" />
                        {format(new Date(order.created_at), "dd MMM yyyy", { locale: es })}
                      </div>
                      {order.mechanic_name && (
                        <span className="text-text-secondary text-xs">{order.mechanic_name}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {order.cost != null && (
                    <span className="text-text-primary font-semibold text-sm">
                      ${Number(order.cost).toLocaleString("es-CO")}
                    </span>
                  )}
                  <StatusBadge status={order.status} />
                  {expandedIds.has(order.id) ? (
                    <ChevronDown className="w-4 h-4 text-text-secondary" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-text-secondary" />
                  )}
                </div>
              </div>
              {expandedIds.has(order.id) && (
                <div className="px-4 pb-4 ml-7 border-t border-border pt-3 space-y-2">
                  {order.description && (
                    <p className="text-text-secondary text-sm">
                      <span className="text-text-primary font-medium">Diagnóstico:</span> {order.description}
                    </p>
                  )}
                  {order.diagnosis && (
                    <p className="text-text-secondary text-sm">
                      <span className="text-text-primary font-medium">Observaciones:</span> {order.diagnosis}
                    </p>
                  )}
                  {order.parts_used && order.parts_used.length > 0 && (
                    <p className="text-text-secondary text-sm">
                      <span className="text-text-primary font-medium">Repuestos usados:</span>{" "}
                      {order.parts_used.join(", ")}
                    </p>
                  )}
                  {order.warranty_info && (
                    <p className="text-text-secondary text-sm">
                      <span className="text-text-primary font-medium">Garantía:</span> {order.warranty_info}
                    </p>
                  )}
                  {order.photos && order.photos.length > 0 && (
                    <div className="flex gap-2 mt-2">
                      {order.photos.map((photo, i) => (
                        <img
                          key={i}
                          src={photo}
                          alt={`Foto ${i + 1}`} loading="lazy"
                          className="w-20 h-20 object-cover rounded border border-border"
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function MaintenanceHistory() {
  const [orders, setOrders] = useState<WorkOrderItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const data = await api.get("/customer-auth/orders");
        const serviceOrders = (data || []).filter(
          (o: any) => o.type === "service" || o.type === "maintenance"
        );
        setOrders(serviceOrders);
      } catch {
        setOrders([]);
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, []);

  if (loading) {
    return <Spinner size="md" className="py-12" />;
  }

  if (orders.length === 0) {
    return <EmptyState icon={<History />} title="Sin historial" description="No hay historial de mantenimiento" />;
  }

  const grouped: GroupedOrders = {};
  for (const order of orders) {
    const key = getVehicleKey(order);
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(order);
  }

  return (
    <div className="space-y-4">
      {Object.entries(grouped).map(([vehicle, vehicleOrders]) => (
        <VehicleTimeline key={vehicle} vehicle={vehicle} orders={vehicleOrders} />
      ))}
    </div>
  );
}
