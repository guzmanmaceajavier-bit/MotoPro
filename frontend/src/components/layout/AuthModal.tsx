import { useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { useToast } from "@/providers/ToastProvider";
import { Modal } from "@/components/ui";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
}

export function AuthModal({ open, onClose }: AuthModalProps) {
  const { login, register } = useAuth();
  const { addToast } = useToast();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "" });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (mode === "register") {
        await register(form.name, form.email, form.password, form.phone);
        addToast("Cuenta creada con éxito", "success");
      } else {
        await login(form.email, form.password);
        addToast("Inicio de sesión exitoso", "success");
      }
      onClose();
      setForm({ name: "", email: "", password: "", phone: "" });
    } catch (err: any) {
      addToast(err.message || "Error", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={open} onClose={onClose} title={mode === "login" ? "Iniciar sesión" : "Crear cuenta"}>
      <form onSubmit={handleSubmit} className="space-y-3">
        {mode === "register" && (
          <input type="text" placeholder="Nombre completo" value={form.name} required
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full rounded-lg border border-border-subtle bg-surface-tertiary/50 px-4 py-3 text-sm text-text-primary placeholder:text-text-tertiary outline-none focus:border-interactive-accent/50"
          />
        )}
        <input type="email" placeholder="Correo electrónico" value={form.email} required
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="w-full rounded-lg border border-border-subtle bg-surface-tertiary/50 px-4 py-3 text-sm text-text-primary placeholder:text-text-tertiary outline-none focus:border-interactive-accent/50"
        />
        <input type="password" placeholder="Contraseña" value={form.password} required minLength={6}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="w-full rounded-lg border border-border-subtle bg-surface-tertiary/50 px-4 py-3 text-sm text-text-primary placeholder:text-text-tertiary outline-none focus:border-interactive-accent/50"
        />
        {mode === "register" && (
          <input type="tel" placeholder="Teléfono (opcional)" value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="w-full rounded-lg border border-border-subtle bg-surface-tertiary/50 px-4 py-3 text-sm text-text-primary placeholder:text-text-tertiary outline-none focus:border-interactive-accent/50"
          />
        )}

        <button type="submit" disabled={submitting}
          className="w-full rounded-lg bg-gradient-to-r from-interactive-accent-hover to-interactive-accent py-3 font-semibold text-white shadow-lg shadow-interactive-accent/25 hover:shadow-interactive-accent/50 transition-all disabled:opacity-60"
        >
          {submitting ? "Procesando..." : mode === "login" ? "Iniciar sesión" : "Crear cuenta"}
        </button>
      </form>

      <div className="mt-4 text-center">
        <button onClick={() => setMode(mode === "login" ? "register" : "login")}
          className="text-xs text-interactive-accent hover:text-interactive-accent-hover transition-colors"
        >
          {mode === "login" ? "¿No tienes cuenta? Regístrate" : "¿Ya tienes cuenta? Inicia sesión"}
        </button>
      </div>
    </Modal>
  );
}
