import { useState, useEffect, useRef } from "react";

import { api } from "@/api/client";
import { SEO } from "@/components/SEO";
import { useCMS } from "@/providers/CMSProvider";
import { useAuth } from "@/providers/AuthProvider";
import { Upload, X } from "lucide-react";

export default function SolicitarServicio() {
  const { config } = useCMS();
  const { user } = useAuth();
  const [services, setServices] = useState<any[]>([]);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: user?.name || "", phone: user?.phone || "", email: user?.email || "", brand_model: "", service_type: "", plate: "", description: "" });
  const [photos, setPhotos] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api.get("/services").then((data) => setServices(data || [])).catch(() => setServices([]));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const msg = `*Nueva solicitud de servicio - MotoPro*\n\n*Nombre:* ${form.name}\n*Teléfono:* ${form.phone}\n*Email:* ${form.email}\n*Marca/Modelo:* ${form.brand_model}\n*Placa:* ${form.plate || "N/A"}\n*Servicio:* ${form.service_type}\n*Descripción:* ${form.description}`;
    const whatsapp = (config.social_whatsapp || "525551234567").replace(/[^0-9]/g, "");
    window.open(`https://wa.me/${whatsapp}?text=${encodeURIComponent(msg)}`, "_blank");
    try { await api.post("/service-requests", form); } catch {}
    setSent(true);
    setLoading(false);
  };

  const fields = [
    { key: "name", label: "Nombre *", type: "text", placeholder: "Tu nombre", required: true },
    { key: "phone", label: "Teléfono *", type: "tel", placeholder: "+57 300 000 0000", required: true },
    { key: "email", label: "Email *", type: "email", placeholder: "email@ejemplo.com", required: true },
    { key: "brand_model", label: "Marca / Modelo *", type: "text", placeholder: "Ej: Yamaha MT-07", required: true },
    { key: "plate", label: "Placa", type: "text", placeholder: "ABC-123" },
  ];

  if (sent) {
    return (
      <>
        <SEO title="Solicitud enviada" description="Tu solicitud de servicio ha sido enviada exitosamente" />
        <main className="flex flex-1 items-center justify-center px-4 min-h-screen pt-20">
          <div className="text-center max-w-md mx-auto">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-500/10">
              <svg className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <h1 className="text-3xl font-heading font-bold text-text-primary">¡Solicitud enviada!</h1>
            <p className="mt-2 text-text-secondary">Te contactaremos en las próximas 24 horas para confirmar tu cita.</p>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <SEO title="Solicitar servicio" description="Agenda una cita en nuestro taller especializado" />
        <main className="pt-20">
        <section className="relative overflow-hidden bg-surface-primary py-16">
          <div className="mx-auto max-w-4xl px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-heading font-bold text-text-primary">Solicitar <span className="text-transparent bg-clip-text bg-gradient-to-r from-interactive-accent to-blue-400">servicio</span></h1>
            <p className="mt-4 text-lg text-text-secondary">Agenda una cita en nuestro taller</p>
          </div>
        </section>
        <section className="py-16 md:py-20 bg-surface-primary">
          <div className="mx-auto max-w-2xl px-4">
            <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-border bg-surface-secondary p-6 md:p-8">
              <div className="grid gap-4 sm:grid-cols-2">
                {fields.map((f) => (
                  <div key={f.key}>
                    <label className="mb-1 block text-sm font-semibold text-text-secondary">{f.label}</label>
                    <input type={f.type} required={f.required}
                      value={(form as any)[f.key]} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                      className="w-full rounded-lg border border-border bg-surface-tertiary/50 px-4 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary outline-none focus:border-interactive-accent/50"
                      placeholder={f.placeholder}
                    />
                  </div>
                ))}
                <div>
                  <label className="mb-1 block text-sm font-semibold text-text-secondary">Tipo de servicio</label>
                  <select value={form.service_type} onChange={(e) => setForm({ ...form, service_type: e.target.value })}
                    className="w-full rounded-lg border border-border bg-surface-tertiary/50 px-4 py-2.5 text-sm text-text-primary outline-none focus:border-interactive-accent/50"
                  >
                    <option value="" className="bg-surface-secondary">Selecciona...</option>
                    {services.map((s) => (<option key={s.id} value={s.title} className="bg-surface-secondary">{s.title}</option>))}
                    <option value="Otro" className="bg-surface-secondary">Otro</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-text-secondary">Descripción del problema *</label>
                <textarea required rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full rounded-lg border border-border bg-surface-tertiary/50 px-4 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary outline-none focus:border-interactive-accent/50 resize-none"
                    placeholder="Describe el problema o servicio que necesitas..." />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-text-secondary">Fotos del vehículo (opcional, máx. 5)</label>
                  <div className="flex flex-wrap gap-3 mb-3">
                    {photos.map((file, i) => (
                      <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-border bg-surface-tertiary">
                        <img src={URL.createObjectURL(file)} alt={`Foto ${i + 1}`} loading="lazy" className="w-full h-full object-cover" />
                        <button type="button" onClick={() => setPhotos(photos.filter((_, j) => j !== i))}
                          className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center"
                        >
                          <X className="w-3 h-3 text-white" />
                        </button>
                      </div>
                    ))}
                    {photos.length < 5 && (
                      <button type="button" onClick={() => fileInputRef.current?.click()}
                        className="w-20 h-20 rounded-lg border-2 border-dashed border-border bg-surface-tertiary/30 flex flex-col items-center justify-center gap-1 hover:border-interactive-accent/50 transition-colors cursor-pointer"
                      >
                        <Upload className="w-5 h-5 text-text-tertiary" />
                        <span className="text-[10px] text-text-tertiary">Subir foto</span>
                      </button>
                    )}
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    setPhotos(prev => [...prev, ...files].slice(0, 5));
                    e.target.value = "";
                  }} />
                  <p className="text-[10px] text-text-tertiary">Arrastra tus fotos o haz clic para seleccionar.</p>
                </div>
                <button type="submit" disabled={loading}
                className="w-full rounded-lg bg-gradient-to-r from-interactive-accent-hover to-interactive-accent py-3 font-semibold text-white shadow-lg shadow-interactive-accent/25 hover:shadow-interactive-accent/40 transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                ) : (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                )}
                {loading ? "Enviando..." : "Contactar por WhatsApp"}
              </button>
            </form>
          </div>
        </section>
      </main>
    </>
  );
}
