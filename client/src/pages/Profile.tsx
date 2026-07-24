import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { User, Mail, Phone, Shield, Lock, Bell, Save, MapPin } from "lucide-react";

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const [profile, setProfile] = useState({ name: "", email: "", phone: "", address: "", nit: "" });
  const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (user) {
      setProfile({ name: user.name || "", email: user.email || "", phone: user.phone || "", address: (user as any).address || "", nit: (user as any).nit || "" });
    }
  }, [user]);

  const handleProfileSave = async () => {
    setSaving(true); setMsg("");
    try {
      await updateProfile(profile);
      setMsg("Perfil actualizado");
    } catch (err: any) { setMsg(err.message || "Error al actualizar"); }
    finally { setSaving(false); }
  };

  const handlePasswordChange = async () => {
    if (passwords.new !== passwords.confirm) return alert("Las contraseñas no coinciden");
    setSaving(true); setMsg("");
    try {
      await updateProfile({ currentPassword: passwords.current, newPassword: passwords.new } as any);
      setMsg("Contraseña actualizada");
      setPasswords({ current: "", new: "", confirm: "" });
    } catch (err: any) { setMsg(err.message || "Error al cambiar contraseña"); }
    finally { setSaving(false); }
  };

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <div className="mb-8">
        <h1 className="text-h3 text-text-primary tracking-tight">Mi Perfil</h1>
        <p className="text-body-sm text-text-tertiary mt-1">Gestiona tu información personal</p>
      </div>

      {msg && (
        <div className="mb-6 rounded-sm border px-4 py-3 text-body-sm"
          style={{ background: msg.includes("Error") ? "rgba(239,68,68,0.08)" : "rgba(34,197,94,0.08)", color: msg.includes("Error") ? "#EF4444" : "#22C55E", borderColor: msg.includes("Error") ? "rgba(239,68,68,0.2)" : "rgba(34,197,94,0.2)" }}>
          {msg}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-lg border border-border bg-surface-secondary">
          <div className="border-b border-border px-6 py-4">
            <h2 className="text-caption font-semibold text-text-primary">Información Personal</h2>
          </div>
          <div className="p-6 space-y-5">
            <div className="flex items-center justify-center mb-6">
              <div className="relative">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-surface-tertiary">
                  <User size={32} className="text-text-tertiary" />
                </div>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="form-label">Nombre completo</label>
                <input type="text" value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} className="input" />
              </div>
              <div>
                <label className="form-label">Email</label>
                <input type="email" value={profile.email} disabled className="input opacity-60" />
              </div>
              <div>
                <label className="form-label">Teléfono</label>
                <input type="tel" value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} className="input" placeholder="+57 300 123 4567" />
              </div>
              <div>
                <label className="form-label">NIT / Cédula</label>
                <input type="text" value={profile.nit} onChange={e => setProfile(p => ({ ...p, nit: e.target.value }))} className="input" placeholder="Opcional" />
              </div>
              <div className="sm:col-span-2">
                <label className="form-label">Dirección</label>
                <input type="text" value={profile.address} onChange={e => setProfile(p => ({ ...p, address: e.target.value }))} className="input" placeholder="Tu dirección" />
              </div>
            </div>
            <button onClick={handleProfileSave} disabled={saving}
              className="w-full rounded-sm bg-interactive-accent px-4 py-2.5 text-body-sm font-semibold text-text-inverse transition-all duration-base hover:bg-interactive-accent-hover active:scale-[0.98] disabled:opacity-40">
              <Save size={16} className="inline mr-2" /> {saving ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-lg border border-border bg-surface-secondary">
            <div className="border-b border-border px-6 py-4">
              <h2 className="text-caption font-semibold text-text-primary">Cambiar Contraseña</h2>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="form-label">Contraseña actual</label>
                <input type="password" value={passwords.current} onChange={e => setPasswords(p => ({ ...p, current: e.target.value }))} className="input" />
              </div>
              <div>
                <label className="form-label">Nueva contraseña</label>
                <input type="password" value={passwords.new} onChange={e => setPasswords(p => ({ ...p, new: e.target.value }))} className="input" />
              </div>
              <div>
                <label className="form-label">Confirmar contraseña</label>
                <input type="password" value={passwords.confirm} onChange={e => setPasswords(p => ({ ...p, confirm: e.target.value }))} className="input" />
              </div>
              <button onClick={handlePasswordChange} disabled={saving || !passwords.current || !passwords.new || passwords.new !== passwords.confirm}
                className="w-full rounded-sm bg-surface-tertiary px-4 py-2.5 text-body-sm font-semibold text-text-secondary transition-all duration-base hover:bg-surface-muted disabled:opacity-40 disabled:cursor-not-allowed">
                Cambiar contraseña
              </button>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-surface-secondary p-5">
            <h3 className="text-caption font-semibold text-text-primary mb-3">Cuenta</h3>
            <div className="space-y-2 text-sm" style={{ color: "var(--text-secondary)" }}>
              <p><span style={{ color: "var(--text-tertiary)" }}>Miembro desde:</span> {user?.created_at ? new Date(user.created_at).toLocaleDateString("es-ES") : "N/A"}</p>
              <p><span style={{ color: "var(--text-tertiary)" }}>Servicios totales:</span> {user?.total_services || 0}</p>
              <p><span style={{ color: "var(--text-tertiary)" }}>Total gastado:</span> ${(user?.total_spent || 0).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
