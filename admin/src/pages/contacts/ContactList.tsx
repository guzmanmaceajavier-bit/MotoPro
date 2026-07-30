import { useState, useEffect } from "react";
import { api } from "@/api/client";
import { useToast } from "@/components/Toast";
import { downloadCSV, downloadExcel } from "@/utils/export";
import { shareWhatsApp } from "@/utils/share";
import {
  Mail, Trash2, CheckCheck, Search, Download, Send,
  MessageSquare, ExternalLink
} from "lucide-react";
import { Contact } from "@/types";
import { Modal } from "@shared/components/ui/Modal";
import { Pagination } from "@shared/components/ui/Pagination";
import PageHeader from "@/components/PageHeader";

const PAGE_SIZE = 10;

function MailIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function InboxIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function EmptyEnvelopeIllustration() {
  return (
    <svg width="200" height="160" viewBox="0 0 200 160" fill="none">
      <circle cx="100" cy="80" r="60" fill="#F0FDF4" />
      <g transform="translate(55, 35)">
        <path d="M10 50 L90 50 L90 120 L10 120 Z" fill="#E2E8F0" stroke="#CBD5E1" strokeWidth="1" rx="4" />
        <path d="M10 50 L50 85 L90 50" fill="#F1F5F9" stroke="#CBD5E1" strokeWidth="1" />
        <rect x="30" y="65" width="40" height="30" rx="8" fill="#8B5CF6" />
        <circle cx="43" cy="80" r="2" fill="white" />
        <circle cx="50" cy="80" r="2" fill="white" />
        <circle cx="57" cy="80" r="2" fill="white" />
      </g>
      <g opacity="0.5">
        <path d="M30 130 Q40 110 50 130 Q60 110 70 130" stroke="#86EFAC" strokeWidth="2" fill="none" />
        <circle cx="40" cy="118" r="8" fill="#BBF7D0" />
        <circle cx="60" cy="122" r="6" fill="#BBF7D0" />
      </g>
      <g opacity="0.5">
        <path d="M130 130 Q140 110 150 130 Q160 110 170 130" stroke="#86EFAC" strokeWidth="2" fill="none" />
        <circle cx="140" cy="118" r="8" fill="#BBF7D0" />
        <circle cx="160" cy="122" r="6" fill="#BBF7D0" />
      </g>
      <circle cx="45" cy="30" r="1.5" fill="#D1D5DB" />
      <circle cx="155" cy="40" r="1" fill="#D1D5DB" />
      <circle cx="35" cy="60" r="1" fill="#D1D5DB" />
    </svg>
  );
}

export default function ContactList() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filterTab, setFilterTab] = useState<"all" | "unread" | "read">("all");
  const [detailContact, setDetailContact] = useState<Contact | null>(null);
  const { showToast } = useToast();

  const fetchData = () => {
    setLoading(true);
    api.get("/contact").then((r) => setContacts(r || [])).finally(() => setLoading(false));
  };
  useEffect(() => { fetchData(); }, []);
  useEffect(() => { setPage(1); }, [search, filterTab]);

  const filtered = contacts.filter(c => {
    if (filterTab === "unread" && c.is_read) return false;
    if (filterTab === "read" && !c.is_read) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!c.name.toLowerCase().includes(q) && !c.email.toLowerCase().includes(q) && !(c.message || "").toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleMarkRead = async (id: string) => {
    try { await api.put(`/contact/${id}/read`); showToast("success", "Marcado como leido"); fetchData(); }
    catch { showToast("error", "Error al marcar"); }
  };

  const handleDelete = async (id: string) => {
    try { await api.delete(`/contact/${id}`); showToast("success", "Mensaje eliminado"); fetchData(); }
    catch { showToast("error", "Error al eliminar"); }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    if (days === 1) return "Ayer";
    if (days < 7) return `${days}d`;
    return date.toLocaleDateString("es-ES", { month: "short", day: "numeric" });
  };

  const exportData = (type: "csv" | "xls") => {
    const data = contacts.map(c => ({ Nombre: c.name, Email: c.email, Telefono: c.phone || "", Mensaje: c.message || "", Estado: c.is_read ? "Leido" : "No leido", Fecha: c.created_at ? new Date(c.created_at).toLocaleDateString() : "" }));
    if (type === "csv") downloadCSV(data, "mensajes-contacto"); else downloadExcel(data, "mensajes-contacto");
  };

  const replyWhatsApp = (contact: Contact) => {
    if (!contact.phone) { showToast("error", "Este contacto no tiene telefono"); return; }
    shareWhatsApp("Hola " + contact.name + ", hemos recibido tu mensaje. Te responderemos pronto.", contact.phone);
  };

  const unread = contacts.filter(c => !c.is_read).length;
  const read = contacts.filter(c => c.is_read).length;

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-3 mb-1">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[rgba(255,107,0,0.1)] text-[var(--mp-accent)]">
          <Mail size={20} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Mensajes de Contacto</h1>
          <p className="text-sm text-gray-400">Mensajes recibidos del formulario de contacto</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5 mt-6">
        <div className="rounded-xl border border-gray-200 bg-white p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-blue-50 text-blue-500">
            <Mail size={22} />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium">Total</p>
            <p className="text-2xl font-bold text-gray-900">{contacts.length}</p>
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-red-50 text-red-400">
            <InboxIcon />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium">Sin leer</p>
            <p className="text-2xl font-bold text-gray-900">{unread}</p>
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-emerald-50 text-emerald-500">
            <CheckIcon />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium">Leidos</p>
            <p className="text-2xl font-bold text-gray-900">{read}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            placeholder="Buscar por nombre, email..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-[var(--mp-accent)]/20 focus:border-[var(--mp-accent)]"
          />
        </div>
        <div className="flex gap-1 rounded-xl p-1 bg-gray-100">
          {[
            { key: "all" as const, label: "Todos", count: contacts.length },
            { key: "unread" as const, label: "No leidos", count: unread },
            { key: "read" as const, label: "Leidos", count: read }
          ].map(p => (
            <button key={p.key} onClick={() => setFilterTab(p.key)} type="button"
              className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${filterTab === p.key ? "bg-[var(--mp-accent)] text-white shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
              {p.label} ({p.count})
            </button>
          ))}
        </div>
        <div className="flex gap-2 ml-auto">
          <button onClick={() => exportData("csv")}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors bg-white">
            <Download size={13} /> CSV
          </button>
          <button onClick={() => exportData("xls")}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors bg-white">
            <Download size={13} /> Excel
          </button>
        </div>
      </div>

      {loading ? (
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 animate-pulse">
                <div className="w-10 h-10 rounded-xl bg-gray-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : paginated.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex flex-col items-center justify-center py-16">
            <EmptyEnvelopeIllustration />
            <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-2">
              {search || filterTab !== "all" ? "Sin resultados" : "Sin mensajes aun"}
            </h3>
            <p className="text-sm text-gray-400 mb-6 max-w-sm text-center">
              {search
                ? `No hay mensajes que coincidan con "${search}"`
                : "Los mensajes del formulario de contacto apareceran aqui."}
            </p>
            <a
              href="https://motopro.com/#contacto"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white transition-colors"
              style={{ background: "var(--mp-accent)" }}
            >
              <ExternalLink size={15} />
              Ir al formulario
            </a>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white">
          <div className="space-y-0">
            {paginated.map((c) => {
              const isUnread = !c.is_read;
              return (
                <div key={c.id}
                  className={`flex items-center gap-4 px-5 py-4 cursor-pointer transition-colors hover:bg-gray-50 border-b border-gray-100 last:border-b-0 ${isUnread ? "bg-gray-50/50" : ""}`}
                  onClick={() => { setDetailContact(c); if (!c.is_read) handleMarkRead(c.id); }}>
                  {isUnread && <div className="w-2 h-2 rounded-full shrink-0 bg-[var(--mp-accent)]" />}
                  {!isUnread && <div className="w-2 shrink-0" />}
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0"
                    style={{ background: isUnread ? "var(--mp-accent)" : "#F3F4F6", color: isUnread ? "white" : "#6B7280" }}>
                    {c.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className={`text-sm truncate ${isUnread ? "font-bold" : "font-medium"} text-gray-900`}>{c.name}</h3>
                      <div className="flex items-center gap-2 shrink-0">
                        {isUnread && <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-teal-50 text-[var(--mp-accent)]">Nuevo</span>}
                        <span className="text-xs whitespace-nowrap text-gray-400">{formatDate(c.created_at)}</span>
                      </div>
                    </div>
                    <p className="text-xs mt-0.5 text-gray-500">{c.email}</p>
                    <p className="text-xs mt-1 truncate text-gray-400">
                      <MessageSquare size={10} className="inline mr-1" />{c.message?.substring(0, 100)}{c.message?.length > 100 ? "..." : ""}
                    </p>
                  </div>
                  <div className="flex gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                    {c.phone && (
                      <button onClick={() => replyWhatsApp(c)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:bg-green-50 hover:text-green-500 text-gray-400"
                        title="WhatsApp" type="button">
                        <Send size={14} />
                      </button>
                    )}
                    {isUnread && (
                      <button onClick={() => handleMarkRead(c.id)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:bg-teal-50 text-[var(--mp-accent)]"
                        title="Marcar leido" type="button">
                        <CheckCheck size={14} />
                      </button>
                    )}
                    <button onClick={() => handleDelete(c.id)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:bg-red-50 hover:text-red-500 text-gray-400"
                      title="Eliminar" type="button">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
            <span className="text-xs text-gray-400">
              Mostrando {paginated.length} de {filtered.length} mensaje{filtered.length !== 1 ? "s" : ""}
            </span>
            {Math.ceil(filtered.length / PAGE_SIZE) > 1 && (
              <Pagination page={page} perPage={PAGE_SIZE} total={filtered.length} onChange={setPage} />
            )}
          </div>
        </div>
      )}

      <Modal open={!!detailContact} onClose={() => setDetailContact(null)} title={detailContact?.name || ""} size="lg">
        {detailContact && (
          <div>
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[var(--mp-accent)] text-white font-bold text-sm">
                {detailContact.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{detailContact.email}</p>
                {detailContact.phone && <p className="text-xs text-gray-400">{detailContact.phone}</p>}
              </div>
            </div>
            <div className="rounded-xl p-4 text-sm leading-relaxed bg-gray-50 text-gray-700">{detailContact.message}</div>
            <p className="text-xs text-gray-400 mt-4">Recibido: {detailContact.created_at ? new Date(detailContact.created_at).toLocaleString("es-ES") : "—"}</p>
            <div className="flex gap-2 mt-4 justify-end pt-4 border-t border-gray-100">
              {detailContact?.phone && (
                <button onClick={() => detailContact && replyWhatsApp(detailContact)}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors flex items-center gap-1.5">
                  <Send size={14} /> WhatsApp
                </button>
              )}
              <button onClick={() => { if (detailContact) handleDelete(detailContact.id); setDetailContact(null); }}
                className="px-4 py-2 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors flex items-center gap-1.5">
                <Trash2 size={14} /> Eliminar
              </button>
              <button onClick={() => setDetailContact(null)}
                className="px-4 py-2 rounded-xl text-sm font-medium text-white transition-colors"
                style={{ background: "var(--mp-accent)" }}>
                Cerrar
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
