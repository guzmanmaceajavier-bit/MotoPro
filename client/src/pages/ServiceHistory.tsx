import { DataTable, type Column } from "@shared/components/ui/DataTable";
import { Badge } from "@shared/components/ui/Badge";

interface ServiceHistory {
  id: string;
  service: string;
  moto: string;
  date: string;
  status: 'completed' | 'cancelled';
}

const mockHistory: ServiceHistory[] = [
  { id: "SRV-001", service: "Mantenimiento", moto: "MT-09", date: "2024-06-15", status: 'completed' },
  { id: "SRV-002", service: "Cambio de pastillas", moto: "MT-09", date: "2024-03-10", status: 'completed' },
];

export default function ServiceHistory() {
  const columns: Column<ServiceHistory>[] = [
    { key: "id", label: "ID Servicio" },
    { key: "service", label: "Servicio" },
    { key: "moto", label: "Vehículo" },
    { key: "date", label: "Fecha" },
    { key: "status", label: "Estado", render: (s) => (
      <Badge variant={s.status === 'completed' ? 'success' : 'danger'}>
        {s.status === 'completed' ? 'Completado' : 'Cancelado'}
      </Badge>
    )},
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-h3 text-text-primary tracking-tight">Historial de Servicios</h1>
      <DataTable columns={columns} data={mockHistory} keyExtractor={s => s.id} />
    </div>
  );
}
