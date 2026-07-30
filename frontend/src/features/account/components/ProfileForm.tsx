import { useState } from "react";
import { useToast } from "@/providers/ToastProvider";
import { api } from "@/api/client";

interface ProfileFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
}

export function ProfileForm({ form, onChange, onSave }: { form: ProfileFormData; onChange: (f: ProfileFormData) => void; onSave: () => void }) {
  const { addToast } = useToast();
  const [passwordFields, setPasswordFields] = useState({ newPassword: "", confirmPassword: "" });
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const handlePasswordChange = async () => {
    setPasswordError("");
    if (!passwordFields.newPassword) { setPasswordError("Ingresa una contraseña"); return; }
    if (passwordFields.newPassword.length < 6) { setPasswordError("Mínimo 6 caracteres"); return; }
    if (passwordFields.newPassword !== passwordFields.confirmPassword) { setPasswordError("Las contraseñas no coinciden"); return; }
    setSavingPassword(true);
    try {
      await api.put("/customer-auth/profile", { password: passwordFields.newPassword });
      addToast("Contraseña actualizada", "success");
      setPasswordFields({ newPassword: "", confirmPassword: "" });
    } catch { setPasswordError("Error al actualizar contraseña"); }
    finally { setSavingPassword(false); }
  };

  return (
    <div className="bg-surface-secondary border border-border rounded-lg p-8 max-w-lg">
      <h2 className="text-xl font-semibold text-text-primary mb-6">Información Personal</h2>
      <div className="space-y-5">
        {(['name', 'email', 'phone', 'address'] as const).map((field) => (
          <div key={field}>
            <label className="block text-sm font-semibold text-text-secondary mb-1.5 capitalize">
              {field === 'name' ? 'Nombre' : field === 'email' ? 'Correo Electrónico' : field === 'phone' ? 'Teléfono' : 'Dirección'}
            </label>
            <input
              type={field === 'email' ? 'email' : field === 'phone' ? 'tel' : 'text'}
              value={form[field]}
              onChange={(e) => onChange({ ...form, [field]: e.target.value })}
              className="w-full bg-surface-tertiary border border-border rounded-lg px-4 py-2.5 text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-interactive-accent transition-colors"
            />
          </div>
        ))}
        <button onClick={onSave}
          className="w-full bg-interactive-accent text-black font-semibold py-2.5 rounded-lg hover:bg-interactive-accent/90 transition-colors"
        >
          Guardar Cambios
        </button>
      </div>

      <div className="border-t border-border pt-6 mt-6">
        <h3 className="text-md font-bold text-text-primary mb-4">Cambiar contraseña</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-semibold text-text-secondary mb-1.5">Nueva contraseña</label>
            <input type="password" value={passwordFields.newPassword} onChange={e => setPasswordFields(p => ({ ...p, newPassword: e.target.value }))}
              className="w-full rounded-lg border border-border bg-surface-tertiary px-4 py-2.5 text-sm text-text-primary outline-none focus:border-border-accent" placeholder="••••••••" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-text-secondary mb-1.5">Confirmar contraseña</label>
            <input type="password" value={passwordFields.confirmPassword} onChange={e => setPasswordFields(p => ({ ...p, confirmPassword: e.target.value }))}
              className="w-full rounded-lg border border-border bg-surface-tertiary px-4 py-2.5 text-sm text-text-primary outline-none focus:border-border-accent" placeholder="••••••••" />
          </div>
        </div>
        {passwordError && <p className="text-xs text-red-500 mt-2">{passwordError}</p>}
        <button onClick={handlePasswordChange} disabled={savingPassword}
          className="mt-4 rounded-lg border border-interactive-accent px-5 py-2 text-sm font-semibold text-interactive-accent hover:bg-interactive-accent/10 transition-colors disabled:opacity-50">
          {savingPassword ? "Guardando..." : "Actualizar contraseña"}
        </button>
      </div>
    </div>
  );
}
