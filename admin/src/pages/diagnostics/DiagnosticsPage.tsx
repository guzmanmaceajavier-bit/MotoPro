import { useState, useEffect } from "react";
import { api } from "@/api/client";
import { useToast } from "@/components/Toast";
import { Search, Eye, Loader2, Plus, ClipboardList, CheckCircle, AlertTriangle, Clock } from "lucide-react";
import Modal from "@/components/Modal";

interface DiagnosticPhoto {
  id: string;
  url: string;
  caption?: string;
}

interface DiagnosticTest {
  id: string;
  name: string;
  result: string;
  notes?: string;
}

interface Diagnostic {
  id: string;
  work_order_id: string;
  work_order_number?: string;
  customer_name?: string;
  findings: string;
  recommendations?: string;
  urgency: "low" | "medium" | "high";
  status: "pending" | "in_progress" | "completed";
  photos?: DiagnosticPhoto[];
  tests?: DiagnosticTest[];
  created_at: string;
  updated_at?: string;
}

const URGENCY_LABELS: Record<string, string> = { low: "Baja", medium: "Media", high: "Alta" };
const URGENCY_COLORS: Record<string, string> = {
  low: "bg-green-500/20 text-green-400 border-green-500/30",
  medium: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  high: "bg-red-500/20 text-red-400 border-red-500/30",
};

const STATUS_LABELS: Record<string, string> = { pending: "Pendiente", in_progress: "En progreso", completed: "Completado" };
const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  in_progress: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  completed: "bg-green-500/20 text-green-400 border-green-500/30",
};

export default function DiagnosticsPage() {
  const [diagnostics, setDiagnostics] = useState<Diagnostic[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [viewDiagnostic, setViewDiagnostic] = useState<Diagnostic | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { showToast } = useToast();

  const [form, setForm] = useState({
    work_order_id: "",
    findings: "",
    recommendations: "",
    urgency: "medium" as "low" | "medium" | "high",
    status: "pending" as "pending" | "in_progress" | "completed",
  });

  const fetchData = () => {
    setLoading(true);
    api.get("/diagnostics")
      .then((r) => setDiagnostics(r || []))
      .catch(() => showToast("error", "Error al cargar diagnósticos"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = diagnostics.filter((d) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (d.work_order_number || "").toLowerCase().includes(q) ||
           (d.customer_name || "").toLowerCase().includes(q) ||
           d.findings.toLowerCase().includes(q);
  });

  const handleCreate = async () => {
    try {
      await api.post("/diagnostics", form);
      showToast("success", "Diagnóstico creado");
      setShowCreateModal(false);
      setForm({ work_order_id: "", findings: "", recommendations: "", urgency: "medium", status: "pending" });
      fetchData();
    } catch (err: unknown) {
      showToast("error", err instanceof Error ? err.message : "Error al crear");
    }
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
            <ClipboardList size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[var(--mp-text-primary)]">Diagnósticos</h1>
            <p className="text-sm text-[var(--mp-text-tertiary)]">Gestión de diagnósticos del taller</p>
          </div>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="mp-btn-primary text-sm inline-flex items-center gap-1.5">
          <Plus size={15} /> Nuevo diagnóstico
        </button>
      </div>

      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--mp-text-tertiary)]" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por orden, cliente..."
            className="mp-input text-sm w-full pl-9" />
        </div>
        <span className="text-xs text-[var(--mp-text-tertiary)] ml-auto">{filtered.length} diagnóstico{filtered.length !== 1 ? "s" : ""}</span>
      </div>

      {filtered.length === 0 ? (
        <div className="mp-card p-12 flex flex-col items-center text-center">
          <ClipboardList size={40} className="text-[var(--mp-text-tertiary)] mb-3" />
          <h3 className="text-lg font-semibold text-[var(--mp-text-primary)] mb-1">
            {search ? "Sin resultados" : "Sin diagnósticos registrados"}
          </h3>
          <p className="text-sm text-[var(--mp-text-tertiary)] mb-6 max-w-sm">
            {search ? "Intenta con otros términos de búsqueda" : "Registra diagnósticos para las órdenes de trabajo."}
          </p>
          {!search && (
            <button onClick={() => setShowCreateModal(true)} className="mp-btn-primary text-sm inline-flex items-center gap-1.5">
              <Plus size={15} /> Nuevo diagnóstico
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((d) => (
            <div key={d.id}
              className="mp-card p-4 flex items-center gap-4 cursor-pointer hover:bg-[var(--mp-bg-elevated)] transition-colors"
              onClick={() => setViewDiagnostic(d)}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                d.urgency === "high" ? "bg-red-500/10 text-red-400" :
                d.urgency === "medium" ? "bg-amber-500/10 text-amber-400" : "bg-green-500/10 text-green-400"
              }`}>
                {d.urgency === "high" ? <AlertTriangle size={18} /> : d.urgency === "medium" ? <Clock size={18} /> : <CheckCircle size={18} />}
              </div>
              <div className="flex-1 min-w-0 grid grid-cols-2 sm:grid-cols-4 gap-3 items-center">
                <div>
                  <p className="text-sm font-medium text-[var(--mp-text-primary)] truncate">{d.work_order_number || "—"}</p>
                  <p className="text-xs text-[var(--mp-text-tertiary)]">{d.customer_name || "—"}</p>
                </div>
                <div className="hidden sm:block">
                  <p className="text-xs text-[var(--mp-text-tertiary)]">Hallazgos</p>
                  <p className="text-sm text-[var(--mp-text-primary)] truncate max-w-[200px]">{d.findings}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--mp-text-tertiary)]">Fecha</p>
                  <p className="text-sm text-[var(--mp-text-primary)]">{new Date(d.created_at).toLocaleDateString("es-ES")}</p>
                </div>
                <div className="text-right flex items-center justify-end gap-2">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${URGENCY_COLORS[d.urgency] || ""}`}>
                    {URGENCY_LABELS[d.urgency] || d.urgency}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${STATUS_COLORS[d.status] || ""}`}>
                    {STATUS_LABELS[d.status] || d.status}
                  </span>
                </div>
              </div>
              <button onClick={(e) => { e.stopPropagation(); setViewDiagnostic(d); }}
                className="p-1.5 rounded-lg hover:bg-[var(--mp-bg-hover)] text-[var(--mp-text-tertiary)] hover:text-[var(--mp-text-primary)] shrink-0">
                <Eye size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      <Modal open={!!viewDiagnostic} onClose={() => setViewDiagnostic(null)} title="Detalle del diagnóstico" size="xl">
        {viewDiagnostic && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[var(--mp-text-primary)]">Orden: {viewDiagnostic.work_order_number || "—"}</h3>
                <p className="text-xs text-[var(--mp-text-tertiary)]">{viewDiagnostic.customer_name || "Cliente no especificado"}</p>
              </div>
              <div className="flex gap-2">
                <span className={`text-xs px-3 py-1 rounded-full font-medium border ${URGENCY_COLORS[viewDiagnostic.urgency]}`}>
                  {URGENCY_LABELS[viewDiagnostic.urgency]}
                </span>
                <span className={`text-xs px-3 py-1 rounded-full font-medium border ${STATUS_COLORS[viewDiagnostic.status]}`}>
                  {STATUS_LABELS[viewDiagnostic.status]}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[var(--mp-bg-elevated)]">
              <h4 className="text-xs font-semibold text-[var(--mp-text-tertiary)] uppercase mb-2">Hallazgos</h4>
              <p className="text-sm text-[var(--mp-text-primary)] whitespace-pre-wrap">{viewDiagnostic.findings}</p>
            </div>

            {viewDiagnostic.recommendations && (
              <div className="p-4 rounded-xl bg-[var(--mp-bg-elevated)]">
                <h4 className="text-xs font-semibold text-[var(--mp-text-tertiary)] uppercase mb-2">Recomendaciones</h4>
                <p className="text-sm text-[var(--mp-text-primary)] whitespace-pre-wrap">{viewDiagnostic.recommendations}</p>
              </div>
            )}

            {viewDiagnostic.tests && viewDiagnostic.tests.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-[var(--mp-text-tertiary)] uppercase mb-2">Pruebas realizadas</h4>
                <div className="space-y-2">
                  {viewDiagnostic.tests.map((t) => (
                    <div key={t.id} className="p-3 rounded-xl bg-[var(--mp-bg-elevated)]">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-[var(--mp-text-primary)]">{t.name}</p>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400">{t.result}</span>
                      </div>
                      {t.notes && <p className="text-xs text-[var(--mp-text-tertiary)] mt-1">{t.notes}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {viewDiagnostic.photos && viewDiagnostic.photos.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-[var(--mp-text-tertiary)] uppercase mb-2">Fotos</h4>
                <div className="grid grid-cols-3 gap-2">
                  {viewDiagnostic.photos.map((p) => (
                    <div key={p.id} className="rounded-lg overflow-hidden bg-[var(--mp-bg-elevated)]">
                      <img src={p.url} alt={p.caption || ""} className="w-full h-24 object-cover" />
                      {p.caption && <p className="text-[10px] text-[var(--mp-text-tertiary)] p-1">{p.caption}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="text-xs text-[var(--mp-text-tertiary)] pt-2 border-t border-white/10">
              Creado: {new Date(viewDiagnostic.created_at).toLocaleDateString("es-ES", { dateStyle: "long", timeStyle: "short" })}
              {viewDiagnostic.updated_at && <> | Actualizado: {new Date(viewDiagnostic.updated_at).toLocaleDateString("es-ES", { dateStyle: "long", timeStyle: "short" })}</>}
            </div>
          </div>
        )}
      </Modal>

      <Modal open={showCreateModal} onClose={() => setShowCreateModal(false)} title="Nuevo diagnóstico" size="md">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-[var(--mp-text-primary)] mb-1 block">ID de orden de trabajo *</label>
            <input value={form.work_order_id} onChange={(e) => setForm((f) => ({ ...f, work_order_id: e.target.value }))}
              className="mp-input text-sm w-full" placeholder="Ingresa el ID de la orden" />
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--mp-text-primary)] mb-1 block">Hallazgos *</label>
            <textarea value={form.findings} onChange={(e) => setForm((f) => ({ ...f, findings: e.target.value }))}
              className="mp-input text-sm w-full resize-none" rows={4}
              placeholder="Describe los hallazgos del diagnóstico..." />
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--mp-text-primary)] mb-1 block">Recomendaciones</label>
            <textarea value={form.recommendations} onChange={(e) => setForm((f) => ({ ...f, recommendations: e.target.value }))}
              className="mp-input text-sm w-full resize-none" rows={3}
              placeholder="Recomendaciones para el cliente..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-[var(--mp-text-primary)] mb-1 block">Urgencia *</label>
              <select value={form.urgency} onChange={(e) => setForm((f) => ({ ...f, urgency: e.target.value as "low" | "medium" | "high" }))}
                className="mp-select text-sm w-full">
                <option value="low">Baja</option>
                <option value="medium">Media</option>
                <option value="high">Alta</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-[var(--mp-text-primary)] mb-1 block">Estado *</label>
              <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as "pending" | "in_progress" | "completed" }))}
                className="mp-select text-sm w-full">
                <option value="pending">Pendiente</option>
                <option value="in_progress">En progreso</option>
                <option value="completed">Completado</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setShowCreateModal(false)}
              className="px-4 py-2 rounded-lg text-sm text-[var(--mp-text-secondary)] hover:bg-[var(--mp-bg-hover)]">
              Cancelar
            </button>
            <button onClick={handleCreate} disabled={!form.work_order_id || !form.findings}
              className="mp-btn-primary text-sm disabled:opacity-50">
              Crear diagnóstico
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
