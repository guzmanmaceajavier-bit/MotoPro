import { useState } from "react";
import { api } from "@/api/client";
import { useToast } from "@/components/Toast";
import PageHeader from "@/components/PageHeader";
import { Mail, Send, Users, BarChart3, Download, Plus, Trash2, FileText } from "lucide-react";

type Tab = "suscriptores" | "campanas" | "plantillas" | "estadisticas";

export default function NewsletterPage() {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<Tab>("suscriptores");
  const [subscribers] = useState<any[]>([]);
  const [campaigns] = useState<any[]>([]);

  const tabs = [
    { key: "suscriptores" as Tab, label: "Suscriptores", icon: Users },
    { key: "campanas" as Tab, label: "Campañas", icon: Send },
    { key: "plantillas" as Tab, label: "Plantillas", icon: FileText },
    { key: "estadisticas" as Tab, label: "Estadísticas", icon: BarChart3 },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Newsletter" description="Gestión de suscriptores, campañas y plantillas de correo" />

      {/* Tabs */}
      <div className="flex gap-1 bg-[var(--mp-surface-tertiary)] p-1 rounded-lg w-fit">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === t.key ? "bg-[var(--mp-interactive-accent)] text-black" : "text-[var(--mp-text-secondary)] hover:text-[var(--mp-text-primary)]"
            }`}
          >
            <t.icon size={16} />
            {t.label}
          </button>
        ))}
      </div>

      {/* Suscriptores */}
      {activeTab === "suscriptores" && (
        <div className="mp-card">
          <div className="flex items-center justify-between p-5 border-b border-[var(--mp-border)]">
            <h3 className="text-sm font-semibold text-[var(--mp-text-primary)]">Lista de suscriptores</h3>
            <div className="flex items-center gap-2">
              <button className="mp-btn text-sm flex items-center gap-1.5"><Plus size={14} /> Agregar</button>
              <button className="mp-btn-ghost text-sm flex items-center gap-1.5"><Download size={14} /> Exportar CSV</button>
            </div>
          </div>
          {subscribers.length === 0 ? (
            <div className="p-10 text-center">
              <Mail size={32} className="mx-auto text-[var(--mp-text-tertiary)] mb-3" />
              <p className="text-sm text-[var(--mp-text-secondary)]">No hay suscriptores registrados</p>
              <p className="text-xs text-[var(--mp-text-tertiary)] mt-1">Importa tu lista o agrega manualmente</p>
            </div>
          ) : (
            <div className="overflow-x-auto">{/* Table */}</div>
          )}
        </div>
      )}

      {/* Campañas */}
      {activeTab === "campanas" && (
        <div className="mp-card">
          <div className="flex items-center justify-between p-5 border-b border-[var(--mp-border)]">
            <h3 className="text-sm font-semibold text-[var(--mp-text-primary)]">Campañas de email</h3>
            <button className="mp-btn text-sm flex items-center gap-1.5"><Plus size={14} /> Nueva campaña</button>
          </div>
          {campaigns.length === 0 ? (
            <div className="p-10 text-center">
              <Send size={32} className="mx-auto text-[var(--mp-text-tertiary)] mb-3" />
              <p className="text-sm text-[var(--mp-text-secondary)]">No hay campañas creadas</p>
              <p className="text-xs text-[var(--mp-text-tertiary)] mt-1">Crea tu primera campaña de email marketing</p>
            </div>
          ) : (
            <div className="overflow-x-auto">{/* Table */}</div>
          )}
        </div>
      )}

      {/* Plantillas */}
      {activeTab === "plantillas" && (
        <div className="mp-card">
          <div className="flex items-center justify-between p-5 border-b border-[var(--mp-border)]">
            <h3 className="text-sm font-semibold text-[var(--mp-text-primary)]">Plantillas de correo</h3>
          </div>
          <div className="p-10 text-center">
            <FileText size={32} className="mx-auto text-[var(--mp-text-tertiary)] mb-3" />
            <p className="text-sm text-[var(--mp-text-secondary)]">Gestión de plantillas</p>
            <p className="text-xs text-[var(--mp-text-tertiary)] mt-1">Las plantillas se gestionan desde Configuración &gt; Correo</p>
          </div>
        </div>
      )}

      {/* Estadísticas */}
      {activeTab === "estadisticas" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: "Total suscriptores", value: "0", icon: Users, color: "var(--mp-interactive-accent)" },
            { label: "Campañas enviadas", value: "0", icon: Send, color: "#0EA5E9" },
            { label: "Tasa de apertura", value: "—", icon: BarChart3, color: "#10B981" },
          ].map(s => (
            <div key={s.label} className="mp-card p-5">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg" style={{ backgroundColor: `${s.color}15` }}>
                  <s.icon size={20} style={{ color: s.color }} />
                </div>
                <div>
                  <p className="text-xs text-[var(--mp-text-tertiary)]">{s.label}</p>
                  <p className="text-xl font-bold text-[var(--mp-text-primary)]">{s.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
