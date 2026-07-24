import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/providers/AuthProvider";
import { useToast } from "@/providers/ToastProvider";

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
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] bg-surface-primary/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="w-full max-w-md rounded-2xl border border-border-subtle bg-surface-secondary shadow-2xl shadow-black/40 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-interactive-accent to-blue-500 flex items-center justify-center text-text-primary font-bold text-xs">M</div>
                  <span className="font-heading font-bold text-text-primary text-lg">
                    {mode === "login" ? "Iniciar sesión" : "Crear cuenta"}
                  </span>
                </div>
                <button onClick={onClose} className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-tertiary/50 transition-all">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

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
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
