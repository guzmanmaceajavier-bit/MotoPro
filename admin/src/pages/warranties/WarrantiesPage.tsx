import { useState, useEffect } from "react";
import { api } from "@/api/client";
import { useToast } from "@/components/Toast";
import { Shield, Plus, Search, Eye, Loader2, Image as ImageIcon, Upload, CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";
import Modal from "@/components/Modal";

interface WarrantyPhoto {
  id: string;
  url: string;
  caption?: string;
  created_at?: string;
}

interface Warranty {
  id: string;
  customer_id: string;
  customer_name?: string;
  entity_type: "service" | "product";
  entity_name: string;
  duration_days: number;
  start_date: string;
  end_date: string;
  status: "active" | "expired" | "claimed";
  terms?: string;
  notes?: string;
  photos?: WarrantyPhoto[];
  resolution_status?: "pending_review" | "in_progress" | "resolved" | "rejected";
  resolution_notes?: string;
  resolution_date?: string;
  created_at: string;
}

const STATUS_LABELS: Record<string, string> = { active: "Activa", expired: "Vencida", claimed: "Reclamada" };
const STATUS_COLORS: Record<string, string> = {
  active: "bg-green-500/20 text-green-400 border-green-500/30",
  expired: "bg-red-500/20 text-red-400 border-red-500/30",
  claimed: "bg-amber-500/20 text-amber-400 border-amber-500/30",
};
const RESOLUTION_LABELS: Record<string, string> = {
  pending_review: "Pendiente de revisión",
  in_progress: "En proceso",
  resolved: "Resuelta",
  rejected: "Rechazada",
};
const RESOLUTION_COLORS: Record<string, string> = {
  pending_review: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  in_progress: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  resolved: "bg-green-500/20 text-green-400 border-green-500/30",
  rejected: "bg-red-500/20 text-red-400 border-red-500/30",
};
const RESOLUTION_ICONS: Record<string, any> = {
  pending_review: Clock,
  in_progress: AlertCircle,
  resolved: CheckCircle,
  rejected: XCircle,
};

export default function WarrantiesPage() {
  const [warranties, setWarranties] = useState<Warranty[]>([]);
  const [customers, setCustomers] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [viewWarranty, setViewWarranty] = useState<Warranty | null>(null);
  const { showToast } = useToast();

  const [form, setForm] = useState({
    customer_id: "", entity_type: "service" as "service" | "product",
    entity_name: "", duration_days: 365, start_date: new Date().toISOString().split("T")[0],
    terms: "", notes: "",
  });

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      api.get("/warranties").then((r) => setWarranties(r || [])),
      api.get("/customers").then((r) => setCustomers(r || [])),
    ]).catch(() => showToast("error", "Error al cargar datos"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = warranties.filter((w) => {
    if (filterStatus !== "all" && w.status !== filterStatus) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!(w.customer_name || "").toLowerCase().includes(q) && !w.entity_name.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const handleResolution = async (id: string, resolution_status: string) => {
    try {
      await api.put(`/warranties/${id}`, { status: resolution_status === "rejected" || resolution_status === "resolved" ? "claimed" : "claimed", resolution_status, resolution_date: resolution_status === "resolved" || resolution_status === "rejected" ? new Date().toISOString() : undefined });
      showToast("success", `Reclamo ${RESOLUTION_LABELS[resolution_status]?.toLowerCase() || resolution_status}`);
      setViewWarranty((prev) => prev ? { ...prev, resolution_status: resolution_status as any } : null);
      fetchData();
    } catch { showToast("error", "Error al actualizar resolución"); }
  };

  const handleCreate = async () => {
    try {
      await api.post("/warranties", form);
      showToast("success", "Garantía creada");
      setShowModal(false);
      setForm({ customer_id: "", entity_type: "service", entity_name: "", duration_days: 365, start_date: new Date().toISOString().split("T")[0], terms: "", notes: "" });
      fetchData();
    } catch (err: unknown) {
      showToast("error", err instanceof Error ? err.message : "Error al crear");
    }
  };

  const remainingDays = (w: Warranty) => {
    if (w.status !== "active") return 0;
    const end = new Date(w.end_date);
    const now = new Date();
    return Math.max(0, Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={28} className="animate-spin text-[var(--mp-accent)]" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[rgba(255,107,0,0.1)] text-[var(--mp-accent)]">
            <Shield size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[var(--mp-text-primary)]">Garantías</h1>
            <p className="text-sm text-[var(--mp-text-tertiary)]">Gestión de garantías de servicios y productos</p>
          </div>
        </div>
        <button onClick={() => setShowModal(true)} className="mp-btn-primary text-sm inline-flex items-center gap-1.5">
          <Plus size={15} /> Nueva garantía
        </button>
      </div>

      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--mp-text-tertiary)]" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar cliente o servicio..."
            className="mp-input text-sm w-full pl-9" />
        </div>
        <div className="flex gap-1 p-1 rounded-xl bg-[var(--mp-bg-elevated)]">
          {[
            { key: "all", label: "Todas" },
            { key: "active", label: "Activas" },
            { key: "expired", label: "Vencidas" },
            { key: "claimed", label: "Reclamadas" },
          ].map((t) => (
            <button key={t.key} onClick={() => setFilterStatus(t.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filterStatus === t.key ? "bg-[var(--mp-accent)] text-white" : "text-[var(--mp-text-tertiary)] hover:text-[var(--mp-text-primary)]"
              }`}>
              {t.label}
            </button>
          ))}
        </div>
        <span className="text-xs text-[var(--mp-text-tertiary)] ml-auto">{filtered.length} garantía{filtered.length !== 1 ? "s" : ""}</span>
      </div>

      {filtered.length === 0 ? (
        <div className="mp-card p-12 flex flex-col items-center text-center">
          <Shield size={40} className="text-[var(--mp-text-tertiary)] mb-3" />
          <h3 className="text-lg font-semibold text-[var(--mp-text-primary)] mb-1">
            {search || filterStatus !== "all" ? "Sin resultados" : "Sin garantías registradas"}
          </h3>
          <p className="text-sm text-[var(--mp-text-tertiary)] mb-6 max-w-sm">
            {search ? "Intenta con otros términos de búsqueda" : "Registra garantías para servicios y productos del taller."}
          </p>
          {!search && filterStatus === "all" && (
            <button onClick={() => setShowModal(true)} className="mp-btn-primary text-sm inline-flex items-center gap-1.5">
              <Plus size={15} /> Nueva garantía
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((w) => {
            const remaining = remainingDays(w);
            return (
              <div key={w.id}
                className="mp-card p-4 flex items-center gap-4 cursor-pointer hover:bg-[var(--mp-bg-elevated)] transition-colors"
                onClick={() => setViewWarranty(w)}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  w.status === "active" ? "bg-green-500/10 text-green-400" :
                  w.status === "expired" ? "bg-red-500/10 text-red-400" : "bg-amber-500/10 text-amber-400"
                }`}>
                  <Shield size={18} />
                </div>
                <div className="flex-1 min-w-0 grid grid-cols-2 sm:grid-cols-4 gap-3 items-center">
                  <div>
                    <p className="text-sm font-medium text-[var(--mp-text-primary)] truncate">{w.customer_name || "—"}</p>
                    <p className="text-xs text-[var(--mp-text-tertiary)]">{w.entity_name}</p>
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-xs text-[var(--mp-text-tertiary)]">Tipo</p>
                    <p className="text-sm text-[var(--mp-text-primary)] capitalize">{w.entity_type === "service" ? "Servicio" : "Producto"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--mp-text-tertiary)]">Vence</p>
                    <p className="text-sm text-[var(--mp-text-primary)]">{new Date(w.end_date).toLocaleDateString("es-ES")}</p>
                    {w.status === "active" && (
                      <p className="text-[10px] text-[var(--mp-accent)]">{remaining} días restantes</p>
                    )}
                  </div>
                  <div className="text-right">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${STATUS_COLORS[w.status] || ""}`}>
                      {STATUS_LABELS[w.status] || w.status}
                    </span>
                  </div>
                </div>
                <button onClick={(e) => { e.stopPropagation(); setViewWarranty(w); }}
                  className="p-1.5 rounded-lg hover:bg-[var(--mp-bg-hover)] text-[var(--mp-text-tertiary)] hover:text-[var(--mp-text-primary)] shrink-0">
                  <Eye size={14} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      <Modal open={!!viewWarranty} onClose={() => setViewWarranty(null)} title="Detalle de garantía" size="lg">
        {viewWarranty && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[var(--mp-text-primary)]">{viewWarranty.customer_name || "Cliente"}</h3>
                <p className="text-xs text-[var(--mp-text-tertiary)]">{viewWarranty.entity_name}</p>
              </div>
              <span className={`text-xs px-3 py-1 rounded-full font-medium border ${STATUS_COLORS[viewWarranty.status]}`}>
                {STATUS_LABELS[viewWarranty.status]}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-[var(--mp-bg-elevated)]">
              <div>
                <p className="text-xs text-[var(--mp-text-tertiary)]">Tipo</p>
                <p className="text-sm font-medium text-[var(--mp-text-primary)] capitalize">
                  {viewWarranty.entity_type === "service" ? "Servicio" : "Producto"}
                </p>
              </div>
              <div>
                <p className="text-xs text-[var(--mp-text-tertiary)]">Duración</p>
                <p className="text-sm font-medium text-[var(--mp-text-primary)]">{viewWarranty.duration_days} días</p>
              </div>
              <div>
                <p className="text-xs text-[var(--mp-text-tertiary)]">Inicio</p>
                <p className="text-sm font-medium text-[var(--mp-text-primary)]">{new Date(viewWarranty.start_date).toLocaleDateString("es-ES")}</p>
              </div>
              <div>
                <p className="text-xs text-[var(--mp-text-tertiary)]">Vencimiento</p>
                <p className="text-sm font-medium text-[var(--mp-text-primary)]">{new Date(viewWarranty.end_date).toLocaleDateString("es-ES")}</p>
              </div>
            </div>

            {/* Fotos */}
            {viewWarranty.photos && viewWarranty.photos.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <ImageIcon size={14} className="text-[var(--mp-text-tertiary)]" />
                  <h4 className="text-xs font-semibold text-[var(--mp-text-primary)]">Fotos ({viewWarranty.photos.length})</h4>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {viewWarranty.photos.map((photo) => (
                    <div key={photo.id} className="relative group rounded-lg overflow-hidden bg-[var(--mp-bg-elevated)] aspect-square">
                      <img src={photo.url} alt={photo.caption || ""} className="w-full h-full object-cover" />
                      {photo.caption && (
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-1.5">
                          <p className="text-[10px] text-white truncate">{photo.caption}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {viewWarranty.status === "claimed" && (
              <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5">
                <div className="flex items-center gap-2 mb-3">
                  <AlertCircle size={16} className="text-amber-400" />
                  <h4 className="text-sm font-semibold text-[var(--mp-text-primary)]">Resolución del reclamo</h4>
                </div>

                {viewWarranty.resolution_status && (
                  <div className="flex items-center gap-2 mb-3">
                    {(() => {
                      const Icon = RESOLUTION_ICONS[viewWarranty.resolution_status] || Clock;
                      return <Icon size={14} className="text-[var(--mp-text-tertiary)]" />;
                    })()}
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${RESOLUTION_COLORS[viewWarranty.resolution_status]}`}>
                      {RESOLUTION_LABELS[viewWarranty.resolution_status]}
                    </span>
                    {viewWarranty.resolution_date && (
                      <span className="text-[10px] text-[var(--mp-text-tertiary)]">
                        {new Date(viewWarranty.resolution_date).toLocaleDateString("es-ES")}
                      </span>
                    )}
                  </div>
                )}

                {/* Timeline de resolución */}
                <div className="space-y-2 mb-4">
                  {[
                    { status: "pending_review", label: "Pendiente de revisión", desc: "Reclamo recibido, esperando revisión" },
                    { status: "in_progress", label: "En proceso", desc: "Evaluando y gestionando el reclamo" },
                    { status: "resolved", label: "Resuelta", desc: "Reclamo resuelto satisfactoriamente" },
                    { status: "rejected", label: "Rechazada", desc: "Reclamo no procede" },
                  ].map((step) => {
                    const current = viewWarranty.resolution_status || "pending_review";
                    const order = ["pending_review", "in_progress", "resolved", "rejected"];
                    const idx = order.indexOf(current);
                    const stepIdx = order.indexOf(step.status);
                    const isActive = stepIdx <= idx || (current === "rejected" && step.status === "rejected");
                    const isCurrent = step.status === current;
                    const isRejectedPath = current === "rejected";

                    return (
                      <div key={step.status} className={`flex items-start gap-3 p-2 rounded-lg ${
                        isCurrent ? "bg-[var(--mp-bg-surface)]" : ""
                      }`}>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                          isCurrent ? "bg-amber-500 text-white" :
                          isActive && !isRejectedPath ? "bg-green-500/20 text-green-400" :
                          step.status === "rejected" && isRejectedPath ? "bg-red-500/20 text-red-400" :
                          "bg-[var(--mp-bg-surface)] text-[var(--mp-text-tertiary)]"
                        }`}>
                          {stepIdx < order.indexOf(current) && !isRejectedPath ? (
                            <CheckCircle size={12} />
                          ) : step.status === "rejected" && isRejectedPath ? (
                            <XCircle size={12} />
                          ) : (
                            <div className="w-2 h-2 rounded-full bg-current" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-medium ${isCurrent ? "text-[var(--mp-text-primary)]" : "text-[var(--mp-text-secondary)]"}`}>
                            {step.label}
                          </p>
                          <p className="text-[10px] text-[var(--mp-text-tertiary)]">{step.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {viewWarranty.resolution_notes && (
                  <div className="mb-3">
                    <p className="text-[10px] font-medium text-[var(--mp-text-tertiary)] mb-1">Notas de resolución</p>
                    <p className="text-sm text-[var(--mp-text-primary)] p-2 rounded-lg bg-[var(--mp-bg-elevated)]">
                      {viewWarranty.resolution_notes}
                    </p>
                  </div>
                )}

                {/* Acciones de resolución */}
                {(!viewWarranty.resolution_status || viewWarranty.resolution_status === "pending_review") && (
                  <div className="flex gap-2">
                    <button onClick={() => handleResolution(viewWarranty.id, "in_progress")}
                      className="flex-1 px-3 py-2 rounded-lg text-xs font-medium bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors">
                      Iniciar revisión
                    </button>
                    <button onClick={() => handleResolution(viewWarranty.id, "rejected")}
                      className="px-3 py-2 rounded-lg text-xs font-medium bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors">
                      Rechazar
                    </button>
                  </div>
                )}
                {viewWarranty.resolution_status === "in_progress" && (
                  <div className="flex gap-2">
                    <button onClick={() => handleResolution(viewWarranty.id, "resolved")}
                      className="flex-1 px-3 py-2 rounded-lg text-xs font-medium bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors">
                      Marcar como resuelta
                    </button>
                    <button onClick={() => handleResolution(viewWarranty.id, "rejected")}
                      className="px-3 py-2 rounded-lg text-xs font-medium bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors">
                      Rechazar
                    </button>
                  </div>
                )}
                {viewWarranty.resolution_status === "resolved" && (
                  <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center gap-2">
                    <CheckCircle size={16} className="text-green-400" />
                    <p className="text-xs text-green-400 font-medium">Reclamo resuelto</p>
                  </div>
                )}
                {viewWarranty.resolution_status === "rejected" && (
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-2">
                    <XCircle size={16} className="text-red-400" />
                    <p className="text-xs text-red-400 font-medium">Reclamo rechazado</p>
                  </div>
                )}
              </div>
            )}

            {viewWarranty.terms && (
              <div>
                <p className="text-xs font-medium text-[var(--mp-text-tertiary)] mb-1">Términos</p>
                <div className="p-3 rounded-xl bg-[var(--mp-bg-elevated)] text-sm text-[var(--mp-text-primary)]">
                  {viewWarranty.terms}
                </div>
              </div>
            )}

            {viewWarranty.notes && (
              <p className="text-xs text-[var(--mp-text-tertiary)] italic">Notas: {viewWarranty.notes}</p>
            )}
          </div>
        )}
      </Modal>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Nueva garantía" size="md">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-[var(--mp-text-primary)] mb-1 block">Cliente *</label>
            <select value={form.customer_id} onChange={(e) => setForm((f) => ({ ...f, customer_id: e.target.value }))}
              className="mp-select text-sm w-full">
              <option value="">Seleccionar cliente</option>
              {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--mp-text-primary)] mb-1 block">Tipo de entidad</label>
            <div className="flex gap-2">
              <button type="button" onClick={() => setForm((f) => ({ ...f, entity_type: "service" }))}
                className={`flex-1 p-3 rounded-xl text-sm font-medium transition-all border ${
                  form.entity_type === "service"
                    ? "border-[var(--mp-accent)] bg-[rgba(255,107,0,0.1)] text-[var(--mp-accent)]"
                    : "border-white/10 bg-[var(--mp-bg-elevated)] text-[var(--mp-text-secondary)]"
                }`}>
                Servicio
              </button>
              <button type="button" onClick={() => setForm((f) => ({ ...f, entity_type: "product" }))}
                className={`flex-1 p-3 rounded-xl text-sm font-medium transition-all border ${
                  form.entity_type === "product"
                    ? "border-[var(--mp-accent)] bg-[rgba(255,107,0,0.1)] text-[var(--mp-accent)]"
                    : "border-white/10 bg-[var(--mp-bg-elevated)] text-[var(--mp-text-secondary)]"
                }`}>
                Producto
              </button>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--mp-text-primary)] mb-1 block">Nombre del servicio/producto *</label>
            <input value={form.entity_name} onChange={(e) => setForm((f) => ({ ...f, entity_name: e.target.value }))}
              className="mp-input text-sm w-full" placeholder="Ej: Reparación de motor" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-[var(--mp-text-primary)] mb-1 block">Duración (días) *</label>
              <input type="number" min={1} value={form.duration_days}
                onChange={(e) => setForm((f) => ({ ...f, duration_days: parseInt(e.target.value) || 365 }))}
                className="mp-input text-sm w-full" />
            </div>
            <div>
              <label className="text-xs font-medium text-[var(--mp-text-primary)] mb-1 block">Fecha de inicio</label>
              <input type="date" value={form.start_date}
                onChange={(e) => setForm((f) => ({ ...f, start_date: e.target.value }))}
                className="mp-input text-sm w-full" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--mp-text-primary)] mb-1 block">Términos</label>
            <textarea value={form.terms} onChange={(e) => setForm((f) => ({ ...f, terms: e.target.value }))}
              className="mp-input text-sm w-full resize-none" rows={3}
              placeholder="Términos y condiciones de la garantía..." />
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--mp-text-primary)] mb-1 block">Notas</label>
            <textarea value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              className="mp-input text-sm w-full resize-none" rows={2} placeholder="Notas opcionales" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setShowModal(false)}
              className="px-4 py-2 rounded-lg text-sm text-[var(--mp-text-secondary)] hover:bg-[var(--mp-bg-hover)]">
              Cancelar
            </button>
            <button onClick={handleCreate} disabled={!form.customer_id || !form.entity_name}
              className="mp-btn-primary text-sm disabled:opacity-50">
              Crear garantía
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
