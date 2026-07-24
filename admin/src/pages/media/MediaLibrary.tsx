import { useState, useEffect, useRef, useCallback } from "react";
import { Search, Grid3X3, List, Upload, Trash2, RotateCcw, X, FolderInput, Copy, Info, ExternalLink, Filter, Save } from "lucide-react";
import { useToast } from "@/components/Toast";
import { mediaApi } from "../../../../shared/services/media";
import { MediaItem } from "../../../../shared/types";
import { fileSize, formatDate, formatDateTime, clsx } from "../../../../shared/utils";
import { optimizeCloudinaryUrl } from "../../../../shared/utils/cloudinary";

type ViewMode = "grid" | "list";
type Tab = "all" | "trash";

export default function MediaLibrary() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [view, setView] = useState<ViewMode>("grid");
  const [tab, setTab] = useState<Tab>("all");
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<MediaItem | null>(null);
  const [previewUsages, setPreviewUsages] = useState<any[]>([]);
  const [editing, setEditing] = useState<MediaItem | null>(null);
  const [folders, setFolders] = useState<string[]>([]);
  const [filterFolder, setFilterFolder] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const searchTimer = useRef<ReturnType<typeof setTimeout>>();
  const { showToast } = useToast();

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const result = await mediaApi.list({
        search, page, limit: 24,
        trashed: tab === "trash",
        folder: filterFolder || undefined,
      });
      const data = Array.isArray(result) ? result : result.data ?? [];
      setItems(data);
      setTotalPages(result.pagination?.totalPages || 1);
      setTotal(result.pagination?.total || data.length);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [search, page, tab, filterFolder]);

  const fetchFolders = async () => {
    try {
      const result = await mediaApi.getFolders();
      setFolders(Array.isArray(result) ? result : []);
    } catch {}
  };

  useEffect(() => { fetchItems(); fetchFolders(); }, [fetchItems]);

  useEffect(() => {
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => { setPage(1); fetchItems(); }, 300);
    return () => clearTimeout(searchTimer.current);
  }, [search]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await mediaApi.upload(file, filterFolder || "/");
      showToast("success", "Archivo subido correctamente");
      fetchItems();
    } catch {
      showToast("error", "Error al subir archivo");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleTrash = async (id: string) => {
    await mediaApi.trash(id);
    showToast("success", "Archivo movido a la papelera");
    fetchItems();
  };

  const handleRestore = async (id: string) => {
    await mediaApi.restore(id);
    showToast("success", "Archivo restaurado");
    fetchItems();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Eliminar permanentemente este archivo?")) return;
    await mediaApi.delete(id);
    showToast("success", "Archivo eliminado permanentemente");
    if (preview?.id === id) setPreview(null);
    fetchItems();
  };

  const handleEmptyTrash = async () => {
    if (!confirm("Vaciar papelera? Esta accion no se puede deshacer.")) return;
    await mediaApi.emptyTrash();
    showToast("success", "Papelera vaciada");
    fetchItems();
  };

  const handleSaveEdit = async () => {
    if (!editing) return;
    try {
      await mediaApi.update(editing.id, {
        name: editing.name,
        folder: editing.folder,
        tags: editing.tags?.join(", ") || "",
        alt: editing.alt || "",
      });
      showToast("success", "Archivo actualizado");
      setEditing(null);
      fetchItems();
    } catch {
      showToast("error", "Error al actualizar");
    }
  };

  const openPreview = async (item: MediaItem) => {
    setPreview(item);
    try {
      const usages = await mediaApi.getUsages(item.id);
      setPreviewUsages(Array.isArray(usages) ? usages : []);
    } catch {
      setPreviewUsages([]);
    }
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    showToast("success", "URL copiada al portapapeles");
  };

  const EntityLabel: Record<string, string> = {
    product: "Producto", category: "Categoria", brand: "Marca",
    service: "Servicio", blog: "Blog", gallery: "Galeria",
    testimonial: "Testimonio", team: "Equipo", hero: "Hero",
    offer: "Oferta", before_after: "Antes/Despues", value: "Valor",
    homepage: "Homepage", about: "Nosotros",
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--mp-accent)] to-[#059669] flex items-center justify-center shadow-lg">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-[var(--mp-text-primary)]">Multimedia</h1>
            <p className="text-sm text-[var(--mp-text-tertiary)]">Gestiona y organiza todos los archivos multimedia de tu plataforma.</p>
          </div>
        </div>
        <button onClick={() => fileRef.current?.click()} disabled={uploading} className="mp-btn-primary text-sm">
          {uploading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
          ) : (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
          )}
          {uploading ? "Subiendo..." : "Subir archivo"}
        </button>
      </div>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />

      <div className="mb-6 border-b border-[var(--mp-border)]">
        <div className="flex gap-1">
          {[
            { key: "all" as Tab, label: "Todos" },
            { key: "trash" as Tab, label: "Papelera" },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => { setTab(t.key); setPage(1); }}
              className={`relative px-4 py-2.5 text-sm font-medium transition-all ${
                tab === t.key
                  ? "text-[var(--mp-accent)]"
                  : "text-[var(--mp-text-tertiary)] hover:text-[var(--mp-text-primary)]"
              }`}
            >
              {t.label}
              {tab === t.key && (
                <span className="absolute bottom-0 left-0 h-0.5 w-full bg-[var(--mp-accent)] rounded-t-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="mp-card p-3 mb-5 flex items-center gap-3 flex-wrap">
        <div className="flex-1 relative min-w-[200px]">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--mp-text-tertiary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" className="mp-input text-sm pl-9 w-full" placeholder="Buscar archivos..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <button className="p-2.5 rounded-xl border border-[var(--mp-border)] text-[var(--mp-text-tertiary)] hover:text-[var(--mp-text-primary)] hover:bg-[var(--mp-bg-elevated)] transition-all">
          <Filter size={16} />
        </button>
        <div className="relative">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--mp-text-tertiary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
          <select className="mp-select text-sm pl-9 pr-8 min-w-[160px]" value={filterFolder} onChange={(e) => { setFilterFolder(e.target.value); setPage(1); }}>
            <option value="">Todas las carpetas</option>
            {folders.map((f) => <option key={f} value={f}>{f === "/" ? "Raiz" : f}</option>)}
          </select>
        </div>
        <div className="flex rounded-xl border border-[var(--mp-border)] overflow-hidden">
          <button onClick={() => setView("grid")} className={`p-2 transition-all ${view === "grid" ? "bg-[var(--mp-accent)] text-white" : "text-[var(--mp-text-tertiary)] hover:bg-[var(--mp-bg-elevated)]"}`}>
            <Grid3X3 size={16} />
          </button>
          <button onClick={() => setView("list")} className={`p-2 transition-all ${view === "list" ? "bg-[var(--mp-accent)] text-white" : "text-[var(--mp-text-tertiary)] hover:bg-[var(--mp-bg-elevated)]"}`}>
            <List size={16} />
          </button>
        </div>
        {tab === "trash" && items.length > 0 && (
          <button onClick={handleEmptyTrash} className="mp-btn-ghost text-sm text-[var(--mp-danger)] border border-[rgba(239,68,68,0.15)]">
            <Trash2 size={14} /> Vaciar papelera
          </button>
        )}
      </div>

      {loading ? (
        <div className={clsx("grid gap-4", view === "grid" ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6" : "grid-cols-1")}>
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className={clsx("rounded-xl animate-pulse bg-[var(--mp-bg-elevated)]", view === "grid" ? "aspect-square" : "h-14")} />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="mp-card flex flex-col items-center justify-center py-20">
          <div className="mb-5">
            <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
              <rect x="15" y="10" width="50" height="55" rx="8" fill="#D1FAE5" stroke="#10B981" strokeWidth="2"/>
              <rect x="22" y="18" width="36" height="6" rx="3" fill="#A7F3D0"/>
              <rect x="22" y="28" width="26" height="4" rx="2" fill="#A7F3D0"/>
              <rect x="22" y="36" width="30" height="4" rx="2" fill="#A7F3D0"/>
              <circle cx="52" cy="58" r="14" fill="#10B981"/>
              <path d="M52 50v16M44 58h16" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
              <circle cx="22" cy="10" r="3" fill="#10B981" opacity="0.3"/>
              <circle cx="62" cy="18" r="2" fill="#10B981" opacity="0.2"/>
              <circle cx="18" cy="42" r="2.5" fill="#10B981" opacity="0.25"/>
              <circle cx="65" cy="45" r="2" fill="#10B981" opacity="0.2"/>
            </svg>
          </div>
          <h3 className="text-lg font-bold text-[var(--mp-text-primary)] mb-1">No hay archivos</h3>
          <p className="text-sm text-[var(--mp-text-tertiary)] mb-5">
            {tab === "trash" ? "La papelera esta vacia" : "Sube tu primera imagen para comenzar"}
          </p>
          {tab !== "trash" && (
            <button onClick={() => fileRef.current?.click()} className="mp-btn-primary text-sm border-2 border-[var(--mp-accent)] bg-transparent text-[var(--mp-accent)] hover:bg-[var(--mp-accent)]/5">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              Subir archivo
            </button>
          )}
        </div>
      ) : view === "grid" ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-3">
          {items.map((item) => (
            <div key={item.id} className="group relative aspect-square rounded-xl overflow-hidden bg-[var(--mp-bg-elevated)] border border-[var(--mp-border)] cursor-pointer hover:border-[var(--mp-accent)]/30 transition-all"
              onClick={() => openPreview(item)}>
              <img src={optimizeCloudinaryUrl(item.url)} alt={item.alt || item.name} className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                {tab === "trash" ? (
                  <>
                    <button onClick={(e) => { e.stopPropagation(); handleRestore(item.id); }}
                      className="p-2 bg-white/20 hover:bg-white/30 rounded-lg text-white transition-colors" title="Restaurar">
                      <RotateCcw size={16} />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                      className="p-2 bg-[var(--mp-danger)]/70 hover:bg-[var(--mp-danger)] rounded-lg text-white transition-colors" title="Eliminar">
                      <Trash2 size={16} />
                    </button>
                  </>
                ) : (
                  <button onClick={(e) => { e.stopPropagation(); handleTrash(item.id); }}
                    className="p-2 bg-white/20 hover:bg-white/30 rounded-lg text-white transition-colors" title="Mover a papelera">
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
              <div className="absolute bottom-0 inset-x-0 p-2 bg-gradient-to-t from-black/60 to-transparent">
                <p className="text-white text-xs truncate font-medium">{item.name}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mp-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--mp-border)]">
                <th className="text-left p-3 font-medium text-xs uppercase tracking-wider text-[var(--mp-text-tertiary)]">Archivo</th>
                <th className="text-left p-3 font-medium text-xs uppercase tracking-wider text-[var(--mp-text-tertiary)]">Carpeta</th>
                <th className="text-left p-3 font-medium text-xs uppercase tracking-wider text-[var(--mp-text-tertiary)]">Tamano</th>
                <th className="text-left p-3 font-medium text-xs uppercase tracking-wider text-[var(--mp-text-tertiary)]">Fecha</th>
                <th className="text-right p-3 font-medium text-xs uppercase tracking-wider text-[var(--mp-text-tertiary)]">Usos</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="cursor-pointer border-b border-[var(--mp-border)] last:border-b-0 hover:bg-[var(--mp-bg-elevated)] transition-colors"
                  onClick={() => openPreview(item)}>
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-[var(--mp-bg-elevated)] shrink-0">
                        <img src={optimizeCloudinaryUrl(item.url)} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="font-medium text-sm truncate max-w-[200px] text-[var(--mp-text-primary)]">{item.name}</p>
                        <p className="text-xs text-[var(--mp-text-tertiary)]">{item.mime_type}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--mp-bg-elevated)] text-[var(--mp-text-secondary)]">
                      {item.folder === "/" ? "Raiz" : item.folder}
                    </span>
                  </td>
                  <td className="p-3 text-[var(--mp-text-secondary)]">{fileSize(item.size)}</td>
                  <td className="p-3 text-[var(--mp-text-secondary)]">{formatDate(item.created_at)}</td>
                  <td className="p-3 text-right">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--mp-accent)]/10 text-[var(--mp-accent)]">{item.usage_count} usos</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <span className="text-xs text-[var(--mp-text-tertiary)]">Pagina {page} de {totalPages}</span>
          <div className="flex gap-1">
            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="mp-btn-ghost text-sm">Anterior</button>
            <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="mp-btn-ghost text-sm">Siguiente</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
        <div className="mp-card p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#3B82F6]/15 to-[#3B82F6]/5 flex items-center justify-center flex-shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/></svg>
          </div>
          <div className="flex-1">
            <p className="text-xs text-[var(--mp-text-tertiary)] mb-1">Almacenamiento usado</p>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-[var(--mp-text-primary)]">0 B de 5 GB</span>
              <span className="text-xs text-[var(--mp-text-tertiary)] ml-auto">0%</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-[var(--mp-bg-elevated)] mt-2">
              <div className="h-full rounded-full bg-[var(--mp-accent)]" style={{ width: "0%" }} />
            </div>
          </div>
        </div>
        <div className="mp-card p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#F59E0B]/15 to-[#F59E0B]/5 flex items-center justify-center flex-shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          </div>
          <div>
            <p className="text-xs text-[var(--mp-text-tertiary)] mb-0.5">Formatos permitidos</p>
            <p className="text-sm font-semibold text-[var(--mp-text-primary)]">JPG, PNG, GIF, SVG, WEBP. Tamano maximo: 10 MB</p>
          </div>
        </div>
      </div>

      {preview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) setPreview(null); }}>
          <div className="mp-card w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between p-4 border-b border-[var(--mp-border)]">
              <h3 className="font-bold text-[var(--mp-text-primary)]">Informacion del archivo</h3>
              <button onClick={() => setPreview(null)} className="p-1.5 rounded-lg text-[var(--mp-text-tertiary)] hover:bg-[var(--mp-bg-hover)] transition-all"><X size={16} /></button>
            </div>
            <div className="p-4">
              <div className="aspect-video rounded-xl overflow-hidden bg-[var(--mp-bg-elevated)] mb-4">
                <img src={optimizeCloudinaryUrl(preview.url)} alt={preview.alt || preview.name} className="w-full h-full object-contain" />
              </div>
              <div className="grid grid-cols-2 gap-3 mb-4">
                {[{ label: "Nombre", value: preview.name }, { label: "Tamano", value: fileSize(preview.size) },
                  { label: "Dimensiones", value: `${preview.width} x ${preview.height} px` }, { label: "Tipo MIME", value: preview.mime_type },
                  { label: "Carpeta", value: preview.folder }, { label: "Subido", value: formatDateTime(preview.created_at) },
                ].map((f) => (
                  <div key={f.label} className="p-3 rounded-xl bg-[var(--mp-bg-elevated)]">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--mp-text-tertiary)] mb-1">{f.label}</p>
                    <p className="text-sm text-[var(--mp-text-primary)]">{f.value}</p>
                  </div>
                ))}
                {preview.tags?.length > 0 && (
                  <div className="col-span-2 p-3 rounded-xl bg-[var(--mp-bg-elevated)]">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--mp-text-tertiary)] mb-1.5">Etiquetas</p>
                    <div className="flex flex-wrap gap-1">
                      {preview.tags.map((tag) => (
                        <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-[var(--mp-accent)]/10 text-[var(--mp-accent)]">{tag}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {previewUsages.length > 0 && (
                <div className="mb-4">
                  <p className="text-[10px] font-semibold uppercase tracking-wider mb-2 text-[var(--mp-text-tertiary)]">Usada en ({previewUsages.length})</p>
                  <div className="space-y-1">
                    {previewUsages.map((usage) => (
                      <div key={usage.id} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[var(--mp-bg-elevated)]">
                        <ExternalLink size={12} className="text-[var(--mp-accent)]" />
                        <span className="text-sm text-[var(--mp-text-secondary)]">
                          {EntityLabel[usage.entity_type] || usage.entity_type}
                          {usage.field_name ? ` - ${usage.field_name}` : ""}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2">
                <button onClick={() => handleCopyUrl(preview.url)} className="mp-btn-ghost text-sm border border-[var(--mp-border)]">
                  <Copy size={14} /> Copiar URL
                </button>
                <button onClick={() => { setEditing({ ...preview }); setPreview(null); }} className="mp-btn-ghost text-sm border border-[var(--mp-border)]">
                  <FolderInput size={14} /> Editar
                </button>
                {tab !== "trash" ? (
                  <button onClick={() => { handleTrash(preview.id); setPreview(null); }} className="mp-btn-ghost text-sm text-[var(--mp-danger)] border border-[rgba(239,68,68,0.15)]">
                    <Trash2 size={14} /> Mover a papelera
                  </button>
                ) : (
                  <>
                    <button onClick={() => { handleRestore(preview.id); setPreview(null); }} className="mp-btn-ghost text-sm border border-[var(--mp-border)]">
                      <RotateCcw size={14} /> Restaurar
                    </button>
                    <button onClick={() => { handleDelete(preview.id); setPreview(null); }} className="mp-btn-ghost text-sm text-[var(--mp-danger)] border border-[rgba(239,68,68,0.15)]">
                      <Trash2 size={14} /> Eliminar
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) setEditing(null); }}>
          <div className="mp-card w-full max-w-md p-5 shadow-2xl animate-scale-in">
            <h3 className="font-bold mb-4 text-[var(--mp-text-primary)]">Editar archivo</h3>
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-[var(--mp-bg-elevated)]">
                <label className="text-xs font-semibold text-[var(--mp-text-primary)] mb-1.5 block">Nombre</label>
                <input type="text" className="mp-input text-sm w-full" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
              </div>
              <div className="p-3 rounded-xl bg-[var(--mp-bg-elevated)]">
                <label className="text-xs font-semibold text-[var(--mp-text-primary)] mb-1.5 block">Carpeta</label>
                <input type="text" className="mp-input text-sm w-full" value={editing.folder} onChange={(e) => setEditing({ ...editing, folder: e.target.value })} placeholder="/" />
              </div>
              <div className="p-3 rounded-xl bg-[var(--mp-bg-elevated)]">
                <label className="text-xs font-semibold text-[var(--mp-text-primary)] mb-1.5 block">Texto alternativo (alt)</label>
                <input type="text" className="mp-input text-sm w-full" value={editing.alt || ""} onChange={(e) => setEditing({ ...editing, alt: e.target.value })} />
              </div>
              <div className="p-3 rounded-xl bg-[var(--mp-bg-elevated)]">
                <label className="text-xs font-semibold text-[var(--mp-text-primary)] mb-1.5 block">Etiquetas (separadas por coma)</label>
                <input type="text" className="mp-input text-sm w-full" value={(editing.tags || []).join(", ")} onChange={(e) => setEditing({ ...editing, tags: e.target.value.split(",").map(t => t.trim()).filter(Boolean) })} />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button onClick={() => setEditing(null)} className="mp-btn-ghost text-sm border border-[var(--mp-border)]">Cancelar</button>
              <button onClick={handleSaveEdit} className="mp-btn-primary text-sm"><Save size={14} /> Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
