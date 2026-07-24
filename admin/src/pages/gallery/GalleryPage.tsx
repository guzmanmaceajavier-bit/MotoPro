import { useState, useEffect, useRef } from "react";
import { api, uploadFile } from "@/api/client";
import { Trash2, Upload, Image as ImageIcon, X, Tag, Download, Share2, Search, ExternalLink, Edit3, Check, Grid, List } from "lucide-react";
import { useToast } from "@/components/Toast";
import { GalleryImage } from "@/types";
import { downloadCSV, downloadExcel } from "@/utils/export";
import { shareWhatsAppItem } from "@/utils/share";
import { EmptyState, Pagination, Modal } from "../../../../shared/components/ui";
import { optimizeCloudinaryUrl } from "../../../../shared/utils/cloudinary";

const PAGE_SIZE = 12;

export default function GalleryPage() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [label, setLabel] = useState("");
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [lightbox, setLightbox] = useState<GalleryImage | null>(null);
  const [editingLabel, setEditingLabel] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  const fetch = () => {
    setLoading(true);
    api.get("/gallery").then(setImages).catch(() => setImages([])).finally(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, []);

  const filtered = images.filter(i => !search || (i.label || "").toLowerCase().includes(search.toLowerCase()));
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => { setPage(1); }, [search]);

  const prepareFile = (file: File) => {
    if (!file || !file.type.startsWith("image/")) { showToast("error", "Solo se permiten imágenes"); return; }
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    try {
      const result = await uploadFile("/gallery", selectedFile);
      if (label && result?.id) await api.put(`/gallery/${result.id}`, { label });
      showToast("success", "Imagen subida correctamente");
      setLabel(""); setPreview(null); setSelectedFile(null); fetch();
    } catch { showToast("error", "Error al subir imagen"); }
    finally { setUploading(false); }
  };

  const cancelPreview = () => { setPreview(null); setSelectedFile(null); if (fileRef.current) fileRef.current.value = ""; };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (file) prepareFile(file); if (fileRef.current) fileRef.current.value = "";
  };

  const handleDrop = (e: React.DragEvent) => { e.preventDefault(); setDragOver(false); const file = e.dataTransfer.files?.[0]; if (file) prepareFile(file); };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar esta imagen?")) return;
    try { await api.delete(`/gallery/${id}`); showToast("success", "Imagen eliminada"); setLightbox(null); fetch(); }
    catch { showToast("error", "Error al eliminar"); }
  };

  const handleSaveLabel = async (id: string) => {
    try { await api.put(`/gallery/${id}`, { label: editValue }); showToast("success", "Etiqueta actualizada"); setEditingLabel(null); fetch(); }
    catch { showToast("error", "Error al actualizar"); }
  };

  const exportData = (type: "csv" | "xls") => {
    const data = images.map(i => ({ ID: i.id, Imagen: i.image, Etiqueta: i.label || "", Creado: i.created_at || "" }));
    if (type === "csv") downloadCSV(data, "galeria"); else downloadExcel(data, "galeria");
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-[var(--mp-text-primary)]">Galería de Imágenes</h1>
          <p className="text-sm text-[var(--mp-text-tertiary)]">Administra las imágenes del sitio web</p>
        </div>
        <button onClick={() => fileRef.current?.click()} className="mp-btn-primary text-sm"><Upload size={15} /> Subir Imagen</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
        <div className="mp-card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[rgba(99,102,241,0.1)] text-[#6366F1]"><ImageIcon size={18} /></div>
          <div><p className="text-xs text-[var(--mp-text-tertiary)]">Total imágenes</p><p className="text-xl font-bold text-[var(--mp-text-primary)]">{images.length}</p></div>
        </div>
        <div className="mp-card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[rgba(16,185,129,0.1)] text-[#10B981]"><Tag size={18} /></div>
          <div><p className="text-xs text-[var(--mp-text-tertiary)]">Con etiqueta</p><p className="text-xl font-bold text-[var(--mp-text-primary)]">{images.filter(i => i.label).length}</p></div>
        </div>
        <div className="mp-card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[rgba(245,158,11,0.1)] text-[#F59E0B]"><Upload size={18} /></div>
          <div><p className="text-xs text-[var(--mp-text-tertiary)]">Sin etiqueta</p><p className="text-xl font-bold text-[var(--mp-text-primary)]">{images.filter(i => !i.label).length}</p></div>
        </div>
      </div>

      <div className={`rounded-2xl p-6 mb-5 border-2 border-dashed transition-all cursor-pointer ${dragOver ? "border-[var(--mp-accent)] bg-[rgba(20,184,166,0.04)]" : "border-[var(--mp-border)] bg-[var(--mp-bg-card)]"}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)} onDrop={handleDrop}
        onClick={() => !preview && !uploading && fileRef.current?.click()}>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleInputChange} disabled={uploading} />
        {!preview && !uploading ? (
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-[rgba(20,184,166,0.1)] text-[var(--mp-accent)]"><Upload size={24} /></div>
            <div className="text-center">
              <p className="text-sm font-semibold text-[var(--mp-text-primary)]">Arrastra una imagen aquí o haz clic para seleccionar</p>
              <p className="text-xs mt-1.5 text-[var(--mp-text-tertiary)]">JPG, PNG, WebP — Max 5MB</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="relative rounded-xl overflow-hidden border border-[var(--mp-border)]">
              <img src={preview!} alt="Preview" className="w-full max-h-56 object-contain bg-[var(--mp-bg-elevated)]" />
              {uploading && <div className="absolute inset-0 flex items-center justify-center bg-black/50"><div className="w-7 h-7 border-2 border-[var(--mp-accent)] border-t-transparent rounded-full animate-spin" /></div>}
              {!uploading && <button onClick={(e) => { e.stopPropagation(); cancelPreview(); }} className="absolute top-3 right-3 w-8 h-8 rounded-lg flex items-center justify-center bg-black/50 text-white/90" type="button"><X size={15} /></button>}
            </div>
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Tag size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--mp-text-tertiary)]" />
                <input className="mp-input pl-9 text-sm" placeholder="Etiqueta de la imagen (opcional)" value={label} onChange={(e) => setLabel(e.target.value)} disabled={uploading} />
              </div>
              {!uploading && <button onClick={(e) => { e.stopPropagation(); handleUpload(); }} className="mp-btn-primary text-sm"><Upload size={14} /> Subir</button>}
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 mb-5">
        <div className="relative flex-1 max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--mp-text-tertiary)]" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por etiqueta..." className="mp-input pl-9 text-sm" />
        </div>
        <div className="flex gap-2 ml-auto">
          <button onClick={() => exportData("csv")} className="mp-btn-ghost text-xs"><Download size={13} /> CSV</button>
          <button onClick={() => exportData("xls")} className="mp-btn-ghost text-xs"><Download size={13} /> Excel</button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">{[1, 2, 3, 4, 5, 6, 7, 8].map((i) => <div key={i} className="mp-card overflow-hidden"><div className="aspect-square bg-[var(--mp-bg-elevated)] animate-pulse" /><div className="p-3"><div className="h-3 bg-[var(--mp-bg-elevated)] rounded animate-pulse w-1/2" /></div></div>)}</div>
      ) : paginated.length === 0 ? (
        <EmptyState icon={ImageIcon} title={search ? "Sin resultados" : "Comienza aquí"}
          description={search ? `No hay imágenes que coincidan con "${search}"` : "Sube imágenes para mostrar tu trabajo."}
          actions={!search ? [{ label: "Subir Imagen", onClick: () => fileRef.current?.click() }] : undefined} />
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {paginated.map((img) => (
              <div key={img.id} className="mp-card overflow-hidden cursor-pointer group hover:-translate-y-0.5 transition-all duration-300" onClick={() => setLightbox(img)}>
                <div className="aspect-square bg-[var(--mp-bg-elevated)] relative">
                  {img.image ? (
                    <img src={optimizeCloudinaryUrl(img.image)} alt={img.label || ""} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                  ) : <div className="w-full h-full flex items-center justify-center text-[var(--mp-text-tertiary)]"><ImageIcon size={24} /></div>}
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(img.id); }}
                      className="w-7 h-7 rounded-lg flex items-center justify-center bg-red-500/80 text-white hover:bg-red-500 backdrop-blur-sm transition-all" type="button" title="Eliminar">
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
                <div className="p-3">
                  {editingLabel === img.id ? (
                    <div className="flex items-center gap-1">
                      <input className="mp-input text-xs h-7 px-2 py-0 flex-1" value={editValue} onChange={(e) => setEditValue(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSaveLabel(img.id)} autoFocus onBlur={() => setEditingLabel(null)} />
                      <button onClick={() => handleSaveLabel(img.id)} className="w-6 h-6 rounded flex items-center justify-center text-[var(--mp-accent)]" type="button"><Check size={12} /></button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <span className="text-xs truncate max-w-[70%] text-[var(--mp-text-secondary)]">{img.label || "Sin etiqueta"}</span>
                      <button onClick={(e) => { e.stopPropagation(); setEditingLabel(img.id); setEditValue(img.label || ""); }}
                        className="w-6 h-6 rounded flex items-center justify-center text-[var(--mp-text-tertiary)] opacity-0 group-hover:opacity-100 hover:text-[var(--mp-accent)] transition-all"
                        type="button" title="Editar etiqueta"><Edit3 size={11} /></button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          {totalPages > 1 && <div className="mt-5"><Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} /></div>}
        </>
      )}

      <Modal open={!!lightbox} onClose={() => setLightbox(null)} title={lightbox?.label || "Vista previa"} size="lg">
        {lightbox && (
          <div className="flex flex-col gap-4">
            <img src={optimizeCloudinaryUrl(lightbox.image)} alt={lightbox.label || ""} className="w-full max-h-[70vh] object-contain rounded-xl bg-[var(--mp-bg-elevated)]" />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-[var(--mp-text-primary)]">{lightbox.label || "Sin etiqueta"}</p>
                <p className="text-xs text-[var(--mp-text-tertiary)]">{lightbox.created_at ? new Date(lightbox.created_at).toLocaleDateString() : ""}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => shareWhatsAppItem(lightbox.label || "Imagen", "Mira esta imagen: " + lightbox.image)} className="mp-btn-ghost text-xs"><Share2 size={13} /> Compartir</button>
                <button onClick={() => window.open(lightbox.image, "_blank")} className="mp-btn-ghost text-xs"><ExternalLink size={13} /> Abrir</button>
                <button onClick={() => handleDelete(lightbox.id)} className="mp-btn-danger text-xs"><Trash2 size={13} /> Eliminar</button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
