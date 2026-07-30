import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/");
    } catch {
      setError("Credenciales inválidas");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-surface-primary">
      <div className="hidden lg:flex lg:w-1/2 relative flex-col items-center justify-center p-12 overflow-hidden bg-[rgba(255,107,0,0.04)]">
        <div className="absolute inset-0 bg-grid-subtle" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-interactive-accent/5 blur-[120px]" />
        <div className="relative z-10 text-center">
          <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-2xl bg-interactive-accent/10 backdrop-blur-lg">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-interactive-accent">
              <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
            </svg>
          </div>
          <h2 className="text-h2 text-text-primary tracking-tight">MotoPro</h2>
          <p className="mt-3 text-body text-text-tertiary max-w-sm">
            Panel de administración. Gestiona productos, servicios, clientes y más.
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-interactive-accent">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
              </svg>
            </div>
            <span className="text-h5 font-heading text-text-primary">MotoPro</span>
          </div>

          <h1 className="text-h3 text-text-primary tracking-tight">Admin</h1>
          <p className="mt-2 text-body-sm text-text-tertiary">Acceso al panel de administración</p>

          {error && (
            <div className="mt-6 rounded-sm border border-status-error/30 bg-status-error-bg px-4 py-3 text-body-sm text-status-error">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label className="block text-caption font-medium text-text-secondary mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="h-11 w-full rounded-sm border border-border bg-surface-secondary px-3.5 text-body-sm text-text-primary placeholder:text-text-tertiary transition-all duration-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive-focus focus-visible:border-transparent"
                placeholder="admin@motopro.com"
                required
              />
            </div>
            <div>
              <label className="block text-caption font-medium text-text-secondary mb-1.5">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="h-11 w-full rounded-sm border border-border bg-surface-secondary px-3.5 text-body-sm text-text-primary placeholder:text-text-tertiary transition-all duration-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive-focus focus-visible:border-transparent"
                placeholder="••••••••"
                required
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="h-4 w-4 rounded-sm border-border accent-interactive-accent" />
                <span className="text-tiny text-text-tertiary">Recordarme</span>
              </label>
              <a href="#" className="text-tiny font-medium text-interactive-accent hover:underline">¿Olvidaste tu contraseña?</a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-sm bg-interactive-accent px-6 py-3 text-body-sm font-semibold text-text-inverse transition-all duration-base hover:bg-interactive-accent-hover active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                "Ingresar"
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
