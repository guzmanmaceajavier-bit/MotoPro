import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { SEO } from "@/components/SEO";
import { useAuth } from "@/providers/AuthProvider";
import { useToast } from "@/providers/ToastProvider";

export default function RegisterPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "", phone: "" });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) { addToast("Completa los campos obligatorios", "error"); return; }
    if (form.password.length < 6) { addToast("Mínimo 6 caracteres", "error"); return; }
    if (form.password !== form.confirm) { addToast("Las contraseñas no coinciden", "error"); return; }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password, form.phone);
      addToast("Registro exitoso", "success");
      navigate("/perfil");
    } catch (err: any) {
      addToast(err?.message || "Error al registrarse", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-surface-primary">
      <SEO title="Crear Cuenta" />
      <div className="hidden lg:flex lg:w-1/2 relative flex-col items-center justify-center p-12 overflow-hidden bg-surface-secondary">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, var(--interactive-accent, #FF6B00) 1px, transparent 0)", backgroundSize: "40px 40px" }} />
        <div className="relative text-center max-w-md">
          <div className="mx-auto mb-6 w-20 h-20 rounded-3xl flex items-center justify-center text-3xl bg-interactive-accent/10 text-interactive-accent">🏍️</div>
          <h2 className="text-2xl font-bold text-text-primary">Únete a MotoPro</h2>
          <p className="mt-2 text-sm text-text-tertiary">Regístrate y gestiona tus vehículos, servicios y compras.</p>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
          <div className="lg:hidden text-center mb-8">
            <div className="mx-auto mb-4 w-16 h-16 rounded-2xl flex items-center justify-center text-2xl bg-interactive-accent/10 text-interactive-accent">🏍️</div>
            <h1 className="text-xl font-bold text-text-primary">Crear Cuenta</h1>
            <p className="text-sm mt-1 text-text-tertiary">Regístrate gratuitamente</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-text-secondary">Nombre *</label>
              <input type="text" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} required
                className="mt-1 w-full rounded-lg px-4 py-3 text-sm outline-none transition-all border border-border bg-surface-tertiary text-text-primary"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-text-secondary">Email *</label>
              <input type="email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} required
                className="mt-1 w-full rounded-lg px-4 py-3 text-sm outline-none transition-all border border-border bg-surface-tertiary text-text-primary"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-text-secondary">Teléfono</label>
              <input type="tel" value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})}
                className="mt-1 w-full rounded-lg px-4 py-3 text-sm outline-none transition-all border border-border bg-surface-tertiary text-text-primary"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-text-secondary">Contraseña *</label>
              <input type="password" value={form.password} onChange={(e) => setForm({...form, password: e.target.value})} required
                className="mt-1 w-full rounded-lg px-4 py-3 text-sm outline-none transition-all border border-border bg-surface-tertiary text-text-primary"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-text-secondary">Confirmar Contraseña *</label>
              <input type="password" value={form.confirm} onChange={(e) => setForm({...form, confirm: e.target.value})} required
                className="mt-1 w-full rounded-lg px-4 py-3 text-sm outline-none transition-all border border-border bg-surface-tertiary text-text-primary"
              />
            </div>
            <button type="submit" disabled={loading}
              className="w-full rounded-lg py-3 font-semibold text-white shadow-lg transition-all disabled:opacity-50 bg-gradient-to-r from-interactive-accent to-interactive-accent-hover"
            >
              {loading ? "Registrando..." : "Crear Cuenta"}
            </button>
          </form>
          <p className="mt-6 text-center text-xs text-text-tertiary">
            ¿Ya tienes cuenta?{" "}
            <Link to="/login" className="font-medium text-interactive-accent">Inicia sesión</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
