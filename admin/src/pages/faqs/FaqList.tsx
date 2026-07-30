import { useState, useEffect, useCallback } from "react";
import { Plus, Trash2, Eye, EyeOff, Search, Filter, ArrowUpDown, HelpCircle, FolderOpen, FileText, Save } from "lucide-react";
import { useToast } from "@/components/Toast";
import { api } from "@/api/client";

interface Faq {
  id: string;
  question: string;
  answer: string;
  category: string;
  sort_order: number;
  is_active: number;
}

const CATEGORIES = ["general", "servicios", "compras", "envios", "garantia", "taller"];

const categoryLabels: Record<string, string> = {
  general: "General", servicios: "Servicios", compras: "Compras", envios: "Envios", garantia: "Garantia", taller: "Taller"
};

function QuestionIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="20" r="20" fill="#F0FDF4" />
      <circle cx="20" cy="20" r="12" fill="var(--mp-accent)" />
      <text x="20" y="25" textAnchor="middle" fill="white" fontSize="16" fontWeight="bold">?</text>
    </svg>
  );
}

function EmptyFaqIllustration() {
  return (
    <svg width="200" height="150" viewBox="0 0 200 150" fill="none">
      <circle cx="100" cy="75" r="55" fill="#F0FDF4" />
      <rect x="65" y="30" width="70" height="85" rx="8" fill="white" stroke="#E5E7EB" strokeWidth="1.5" />
      <rect x="75" y="45" width="50" height="4" rx="2" fill="#E5E7EB" />
      <rect x="75" y="55" width="40" height="4" rx="2" fill="#E5E7EB" />
      <rect x="75" y="65" width="45" height="4" rx="2" fill="#E5E7EB" />
      <rect x="75" y="75" width="30" height="4" rx="2" fill="#E5E7EB" />
      <circle cx="115" cy="95" r="14" fill="var(--mp-accent)" />
      <text x="115" y="100" textAnchor="middle" fill="white" fontSize="18" fontWeight="bold">?</text>
      <circle cx="55" cy="40" r="3" fill="#D1FAE5" />
      <circle cx="150" cy="35" r="2" fill="#D1FAE5" />
      <circle cx="145" cy="110" r="2.5" fill="#D1FAE5" />
    </svg>
  );
}

export default function FaqList() {
  const [items, setItems] = useState<Faq[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Partial<Faq> | null>(null);
  const [filterCategory, setFilterCategory] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState("manual");
  const { showToast } = useToast();

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try { const r = await api.get("/faqs?all=1"); setItems(Array.isArray(r) ? r : r?.data || []); }
    catch { showToast("error", "Error al cargar FAQs"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const openNew = () => {
    setEditing({ question: "", answer: "", category: "general", is_active: 1 });
    setModal(true);
  };

  const openEdit = (item: Faq) => {
    setEditing({ ...item });
    setModal(true);
  };

  const saveItem = async () => {
    if (!editing?.question || !editing?.answer) { showToast("error", "Pregunta y respuesta son requeridas"); return; }
    try {
      if (editing.id) {
        await api.put(`/faqs/${editing.id}`, editing);
        showToast("success", "FAQ actualizada");
      } else {
        await api.post("/faqs", { ...editing, sort_order: items.length });
        showToast("success", "FAQ creada");
      }
      setModal(false);
      setEditing(null);
      fetchItems();
    } catch { showToast("error", "Error al guardar"); }
  };

  const deleteItem = async (id: string) => {
    if (!confirm("Eliminar esta FAQ?")) return;
    await api.delete(`/faqs/${id}`);
    showToast("success", "FAQ eliminada");
    fetchItems();
  };

  const toggleActive = async (item: Faq) => {
    await api.put(`/faqs/${item.id}`, { is_active: item.is_active ? 0 : 1 });
    fetchItems();
  };

  const filtered = items
    .filter(i => filterCategory === "all" || i.category === filterCategory)
    .filter(i => {
      if (statusFilter === "active" && !i.is_active) return false;
      if (statusFilter === "inactive" && i.is_active) return false;
      return true;
    })
    .filter(i => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (i.question || "").toLowerCase().includes(q) || (i.answer || "").toLowerCase().includes(q);
    })
    .sort((a, b) => {
      if (sortOrder === "newest") return new Date(b.id).getTime() - new Date(a.id).getTime();
      if (sortOrder === "az") return (a.question || "").localeCompare(b.question || "");
      if (sortOrder === "za") return (b.question || "").localeCompare(a.question || "");
      return (a.sort_order || 0) - (b.sort_order || 0);
    });

  const activeCount = items.filter(i => i.is_active).length;
  const categoryCount = new Set(items.map(i => i.category)).size;

  const categoryColors: Record<string, string> = {
    general: "#6366F1", servicios: "#ff6b00", compras: "#F59E0B", envios: "#3B82F6", garantia: "#10B981", taller: "#EF4444"
  };

  if (loading) return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-center justify-between"><div className="h-8 w-32 bg-gray-200 rounded animate-pulse" /><div className="h-10 w-32 bg-gray-200 rounded animate-pulse" /></div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map(i => <div key={i} className="rounded-xl border border-gray-200 bg-white p-5 h-24 animate-pulse" />)}
      </div>
    </div>
  );

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[rgba(255,107,0,0.1)] text-[var(--mp-accent)]">
            <HelpCircle size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2 text-xs text-gray-400 mb-0.5">
              <span>Contenido</span>
              <span>&gt;</span>
              <span className="text-gray-600 font-medium">FAQ</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">Preguntas Frecuentes</h1>
            <p className="text-sm text-gray-400">Gestiona las preguntas frecuentes de tu sitio web</p>
          </div>
        </div>
        <button onClick={openNew}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white transition-colors"
          style={{ background: "var(--mp-accent)" }}>
          <Plus size={16} /> Nueva FAQ
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5 mt-6">
        <div className="rounded-xl border border-gray-200 bg-white p-5 flex items-center gap-4 relative overflow-hidden">
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-purple-400" />
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-purple-50 text-purple-500">
            <HelpCircle size={22} />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium">Total</p>
            <p className="text-2xl font-bold text-gray-900">{items.length}</p>
            <p className="text-[11px] text-gray-400">preguntas</p>
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 flex items-center gap-4 relative overflow-hidden">
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-teal-400" />
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-teal-50 text-teal-500">
            <Eye size={22} />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium">Activas</p>
            <p className="text-2xl font-bold text-gray-900">{activeCount}</p>
            <p className="text-[11px] text-gray-400">publicadas</p>
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 flex items-center gap-4 relative overflow-hidden">
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-orange-400" />
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-orange-50 text-orange-500">
            <FolderOpen size={22} />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium">Categorias</p>
            <p className="text-2xl font-bold text-gray-900">{categoryCount}</p>
            <p className="text-[11px] text-gray-400">registradas</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            placeholder="Buscar preguntas..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-[var(--mp-accent)]/20 focus:border-[var(--mp-accent)]"
          />
        </div>
        <div className="relative">
          <select
            value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}
            className="appearance-none pl-4 pr-9 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[var(--mp-accent)]/20 focus:border-[var(--mp-accent)] cursor-pointer"
          >
            <option value="all">Todas las categorias</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{categoryLabels[c] || c}</option>)}
          </select>
          <Filter size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
        <div className="relative">
          <select
            value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className="appearance-none pl-9 pr-9 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[var(--mp-accent)]/20 focus:border-[var(--mp-accent)] cursor-pointer"
          >
            <option value="all">Todas</option>
            <option value="active">Activas</option>
            <option value="inactive">Inactivas</option>
          </select>
          <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
        <button
          onClick={() => setSortOrder(sortOrder === "manual" ? "az" : sortOrder === "az" ? "za" : sortOrder === "za" ? "newest" : "manual")}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors bg-white"
        >
          <ArrowUpDown size={14} /> Ordenar
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex flex-col items-center justify-center py-16">
            <EmptyFaqIllustration />
            <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-2">
              {search || filterCategory !== "all" || statusFilter !== "all"
                ? "No se encontraron resultados"
                : "Aun no hay preguntas frecuentes"}
            </h3>
            <p className="text-sm text-gray-400 mb-6 max-w-sm text-center">
              {search
                ? `No hay preguntas que coincidan con "${search}"`
                : "Crea tu primera pregunta frecuente para ayudar a tus usuarios."}
            </p>
            {!search && (
              <button onClick={openNew}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white transition-colors"
                style={{ background: "var(--mp-accent)" }}>
                <Plus size={16} /> Crear primera FAQ
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white">
          <div className="space-y-0">
            {filtered.map((item) => (
              <div key={item.id}
                className="flex items-center gap-4 px-5 py-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors group">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">{item.question}</p>
                  <p className="text-xs text-gray-400 mt-0.5 truncate">{item.answer}</p>
                </div>
                <span className="px-2.5 py-1 rounded-lg text-xs font-medium shrink-0"
                  style={{ background: `${categoryColors[item.category] || "#6366F1"}15`, color: categoryColors[item.category] || "#6366F1" }}>
                  {categoryLabels[item.category] || item.category}
                </span>
                <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => toggleActive(item)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:bg-gray-100"
                    style={{ color: item.is_active ? "var(--mp-accent)" : "#9CA3AF" }}
                    type="button" title={item.is_active ? "Desactivar" : "Activar"}>
                    {item.is_active ? <Eye size={15} /> : <EyeOff size={15} />}
                  </button>
                  <button onClick={() => openEdit(item)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-[var(--mp-accent)] transition-all"
                    type="button" title="Editar">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                  </button>
                  <button onClick={() => deleteItem(item.id)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all"
                    type="button" title="Eliminar">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {modal && editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => { setModal(false); setEditing(null); }} />
          <div className="relative w-full max-w-[640px] rounded-2xl bg-white shadow-2xl animate-scale-in max-h-[90vh] flex flex-col">

            <div className="flex items-center gap-3 px-6 pt-6 pb-2">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-[rgba(255,107,0,0.1)] text-[var(--mp-accent)]">
                <HelpCircle size={22} />
              </div>
              <div className="flex-1">
                <h3 className="text-[15px] font-semibold text-gray-900">{editing.id ? "Editar Pregunta Frecuente" : "Nueva Pregunta Frecuente"}</h3>
                <p className="text-xs text-gray-400">{editing.id ? "Actualiza la informacion de la FAQ" : "Completa la informacion para crear una nueva FAQ"}</p>
              </div>
              <button onClick={() => { setModal(false); setEditing(null); }} type="button"
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1 block">
                  Categoria <span className="text-red-500">*</span>
                </label>
                <p className="text-xs text-gray-400 mb-2">Selecciona la categoria a la que pertenece esta pregunta</p>
                <div className="relative">
                  <select
                    value={editing.category || "general"}
                    onChange={(e) => setEditing({ ...editing, category: e.target.value })}
                    className="w-full appearance-none pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-[var(--mp-accent)]/20 focus:border-[var(--mp-accent)] cursor-pointer"
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{categoryLabels[c] || c}</option>)}
                  </select>
                  <FolderOpen size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1 block">
                  Pregunta <span className="text-red-500">*</span>
                </label>
                <p className="text-xs text-gray-400 mb-2">Escribe la pregunta de forma clara y concisa</p>
                <div className="relative">
                  <input
                    type="text"
                    value={editing.question || ""}
                    onChange={(e) => setEditing({ ...editing, question: e.target.value })}
                    placeholder="Cual es la pregunta frecuente?"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-[var(--mp-accent)]/20 focus:border-[var(--mp-accent)]"
                  />
                  <HelpCircle size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300" />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1 block">
                  Respuesta <span className="text-red-500">*</span>
                </label>
                <p className="text-xs text-gray-400 mb-2">Proporciona una respuesta detallada y util</p>
                <div className="relative">
                  <textarea
                    value={editing.answer || ""}
                    onChange={(e) => setEditing({ ...editing, answer: e.target.value })}
                    placeholder="Escribe la respuesta completa aqui..."
                    rows={5}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 bg-white resize-none focus:outline-none focus:ring-2 focus:ring-[var(--mp-accent)]/20 focus:border-[var(--mp-accent)]"
                  />
                  <svg className="absolute right-3 bottom-3 text-gray-300" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                </div>
              </div>

              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">Visible en el sitio</p>
                  <p className="text-xs text-gray-400">La pregunta sera visible para los usuarios en la seccion FAQ</p>
                </div>
                <button type="button" onClick={() => setEditing({ ...editing, is_active: editing.is_active ? 0 : 1 })}
                  className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
                  style={{ background: editing.is_active ? "var(--mp-accent)" : "#D1D5DB" }}>
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${editing.is_active ? "translate-x-6" : "translate-x-1"}`} />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
              <button onClick={() => { setModal(false); setEditing(null); }}
                className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors">
                Cancelar
              </button>
              <button onClick={saveItem} disabled={!editing.question?.trim() || !editing.answer?.trim()}
                className="px-5 py-2.5 rounded-xl text-sm font-medium text-white flex items-center gap-2 disabled:opacity-50 transition-colors"
                style={{ background: "var(--mp-accent)" }}>
                <Save size={16} />
                {editing.id ? "Guardar Cambios" : "Guardar Pregunta"}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
