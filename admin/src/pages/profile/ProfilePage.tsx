import { useState } from "react";
import { api } from "@/api/client";
import { useToast } from "@/components/Toast";
import { Save, Eye, EyeOff } from "lucide-react";

export default function ProfilePage() {
  const user = (() => {
    try { return JSON.parse(localStorage.getItem("user") || "{}"); } catch { return {}; }
  })();

  const [form, setForm] = useState({
    name: user.name || "",
    email: user.email || "",
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [saving, setSaving] = useState(false);
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });
  const { showToast } = useToast();

  const handleChange = (key: string, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  const togglePasswordVisibility = (field: "current" | "new" | "confirm") => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSave = async () => {
    if (form.new_password && form.new_password !== form.confirm_password) {
      showToast("error", "Las contrasenas no coinciden");
      return;
    }
    setSaving(true);
    try {
      const data: Record<string, string> = { name: form.name };
      if (form.current_password) {
        data.current_password = form.current_password;
        if (form.new_password) data.new_password = form.new_password;
      }
      await api.put("/auth/profile", data);
      localStorage.setItem("user", JSON.stringify({ ...user, name: form.name }));
      showToast("success", "Perfil actualizado");
      setForm((prev) => ({ ...prev, current_password: "", new_password: "", confirm_password: "" }));
    } catch (err: unknown) {
      showToast("error", err instanceof Error ? err.message : "Error al actualizar");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#10B981]/10 via-[#D1FAE5]/30 to-[#A7F3D0]/20 p-8 mb-6 border border-[#10B981]/10">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-[#10B981]/15 flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </div>
              <span className="text-sm font-semibold text-[#10B981]">Mi Perfil</span>
            </div>
            <h1 className="text-2xl font-bold text-[var(--mp-text-primary)] mb-1">Informacion de la cuenta</h1>
            <p className="text-sm text-[var(--mp-text-tertiary)]">Manten tus datos personales y contrasena actualizados.</p>
          </div>
          <div className="hidden lg:block">
            <svg width="120" height="100" viewBox="0 0 120 100" fill="none">
              <rect x="20" y="15" width="70" height="80" rx="12" fill="#D1FAE5" stroke="#10B981" strokeWidth="2"/>
              <rect x="30" y="25" width="50" height="12" rx="6" fill="#A7F3D0"/>
              <circle cx="55" cy="55" r="14" fill="#10B981" opacity="0.2"/>
              <circle cx="55" cy="52" r="7" fill="#10B981"/>
              <path d="M42 68c0-7.2 5.8-13 13-13s13 5.8 13 13" fill="#10B981" opacity="0.3"/>
              <circle cx="88" cy="78" r="16" fill="#10B981"/>
              <path d="M82 78l4 4 8-8" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        <div className="mp-card p-5">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#10B981]/15 to-[#10B981]/5 flex items-center justify-center">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
            <div>
              <h3 className="text-sm font-bold text-[var(--mp-text-primary)]">Informacion Personal</h3>
              <p className="text-[11px] text-[var(--mp-text-tertiary)]">Tu nombre y correo electronico</p>
            </div>
          </div>

          <div className="space-y-3 mb-4">
            <div className="flex items-center gap-3 p-4 rounded-xl bg-[var(--mp-bg-elevated)]">
              <div className="w-10 h-10 rounded-xl bg-[#10B981]/10 flex items-center justify-center flex-shrink-0">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-[var(--mp-text-tertiary)] mb-0.5">Nombre completo</p>
                <p className="text-sm font-semibold text-[var(--mp-text-primary)]">{form.name || "Admin"}</p>
              </div>
              <button className="p-2 rounded-lg text-[var(--mp-text-tertiary)] hover:text-[var(--mp-accent)] hover:bg-[var(--mp-accent)]/5 transition-all">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </button>
            </div>
            <div className="p-4 rounded-xl bg-[var(--mp-bg-elevated)]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#3B82F6]/10 flex items-center justify-center flex-shrink-0">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-[var(--mp-text-tertiary)] mb-0.5">Correo electronico</p>
                  <p className="text-sm font-semibold text-[var(--mp-text-primary)]">{form.email || "admin@motopro.com"}</p>
                </div>
                <button className="p-2 rounded-lg text-[var(--mp-text-tertiary)] hover:text-[var(--mp-accent)] hover:bg-[var(--mp-accent)]/5 transition-all">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#3B82F6]/5 border border-[#3B82F6]/10 flex items-start gap-2.5">
            <div className="w-5 h-5 rounded-full bg-[#3B82F6]/15 flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
            </div>
            <p className="text-xs text-[#3B82F6]">El correo electronico no puede modificarse.</p>
          </div>
        </div>

        <div className="mp-card p-5">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#8B5CF6]/15 to-[#8B5CF6]/5 flex items-center justify-center">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            </div>
            <div>
              <h3 className="text-sm font-bold text-[var(--mp-text-primary)]">Cambiar Contrasena</h3>
              <p className="text-[11px] text-[var(--mp-text-tertiary)]">Deja los campos en blanco si no deseas cambiarla</p>
            </div>
          </div>

          <div className="space-y-3 mb-4">
            <div className="p-4 rounded-xl bg-[var(--mp-bg-elevated)]">
              <div className="flex items-center gap-2 mb-2">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--mp-text-tertiary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                <label className="text-xs font-semibold text-[var(--mp-text-primary)]">Contrasena actual</label>
              </div>
              <div className="relative">
                <input
                  type={showPasswords.current ? "text" : "password"}
                  className="mp-input text-sm w-full pr-10"
                  value={form.current_password}
                  onChange={(e) => handleChange("current_password", e.target.value)}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("current")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--mp-text-tertiary)] hover:text-[var(--mp-text-primary)] transition-colors"
                >
                  {showPasswords.current ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[var(--mp-bg-elevated)]">
              <div className="flex items-center gap-2 mb-2">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--mp-text-tertiary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                <label className="text-xs font-semibold text-[var(--mp-text-primary)]">Nueva contrasena</label>
              </div>
              <div className="relative">
                <input
                  type={showPasswords.new ? "text" : "password"}
                  className="mp-input text-sm w-full pr-10"
                  value={form.new_password}
                  onChange={(e) => handleChange("new_password", e.target.value)}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("new")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--mp-text-tertiary)] hover:text-[var(--mp-text-primary)] transition-colors"
                >
                  {showPasswords.new ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[var(--mp-bg-elevated)]">
              <div className="flex items-center gap-2 mb-2">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--mp-text-tertiary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                <label className="text-xs font-semibold text-[var(--mp-text-primary)]">Confirmar contrasena</label>
              </div>
              <div className="relative">
                <input
                  type={showPasswords.confirm ? "text" : "password"}
                  className="mp-input text-sm w-full pr-10"
                  value={form.confirm_password}
                  onChange={(e) => handleChange("confirm_password", e.target.value)}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("confirm")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--mp-text-tertiary)] hover:text-[var(--mp-text-primary)] transition-colors"
                >
                  {showPasswords.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#F59E0B]/5 border border-[#F59E0B]/10 flex items-start gap-2.5">
            <div className="w-5 h-5 rounded-full bg-[#F59E0B]/15 flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a7 7 0 0 1 7 7c0 2.38-1.19 4.47-3 5.74V17a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 0 1 7-7z"/><line x1="9" y1="21" x2="15" y2="21"/></svg>
            </div>
            <p className="text-xs text-[#F59E0B]">Usa al menos 8 caracteres con numeros y simbolos para mayor seguridad.</p>
          </div>
        </div>
      </div>

      <div className="mp-card p-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#10B981] to-[#059669] flex items-center justify-center shadow-lg">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>
          </div>
          <div>
            <h4 className="text-sm font-bold text-[var(--mp-text-primary)]">Tu cuenta esta protegida</h4>
            <p className="text-[11px] text-[var(--mp-text-tertiary)]">Ultimo acceso: Hoy, 08:45 a. m. desde Bogota, Colombia</p>
          </div>
        </div>
        <button onClick={handleSave} disabled={saving} className="mp-btn-primary text-sm">
          {saving ? (
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
          ) : (
            <><Save size={15} /> Guardar cambios</>
          )}
        </button>
      </div>
    </div>
  );
}
