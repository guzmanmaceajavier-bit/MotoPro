import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { UserPlus, Bike, Mail, Lock, User, Eye, EyeOff, ArrowLeft } from "lucide-react";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    setLoading(true);
    try {
      await register(name, email, password);
      navigate("/");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al registrarse");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: "var(--bg)" }}>
      <div className="hidden lg:flex lg:w-1/2 relative flex-col items-center justify-center p-12 overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0D9488 0%, #0F766E 50%, #0B5E57 100%)" }}>
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
        <div className="relative z-10 text-center">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-2xl"
            style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(12px)" }}>
            <Bike size={40} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-3 tracking-tight">MotoPro</h1>
          <p className="text-white/70 text-sm max-w-sm mx-auto leading-relaxed">
            Crea tu cuenta y accede a todos los servicios del taller.
          </p>
        </div>
        <a href="/" className="absolute bottom-8 left-8 z-10 inline-flex items-center gap-2 text-white/50 hover:text-white/90 text-xs transition-colors">
          <ArrowLeft size={12} /> Volver al sitio
        </a>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="lg:hidden text-center mb-8">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
              style={{ background: "var(--accent)" }}>
              <Bike size={28} className="text-white" />
            </div>
            <h1 className="text-xl font-bold" style={{ color: "var(--text)" }}>Crear Cuenta</h1>
            <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>Regístrate en MotoPro</p>
          </div>

          <div className="p-8 rounded-2xl shadow-sm" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
            <div className="hidden lg:block text-center mb-6">
              <h1 className="text-xl font-bold" style={{ color: "var(--text)" }}>Crear Cuenta</h1>
              <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>Regístrate en MotoPro</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="flex items-start gap-2.5 p-3 rounded-xl text-sm"
                  style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#EF4444" }}>
                  <div className="w-1 h-1 rounded-full bg-[#EF4444] mt-1.5 shrink-0" />
                  {error}
                </div>
              )}

              <div>
                <label className="form-label">Nombre completo</label>
                <div className="relative">
                  <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--text-tertiary)" }} />
                  <input type="text" className="input pl-10" value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Tu nombre" required />
                </div>
              </div>

              <div>
                <label className="form-label">Correo electrónico</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--text-tertiary)" }} />
                  <input type="email" className="input pl-10" value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@correo.com" required />
                </div>
              </div>

              <div>
                <label className="form-label">Contraseña</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--text-tertiary)" }} />
                  <input type={showPassword ? "text" : "password"} className="input pl-10 pr-10" value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres" required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 hover:opacity-70 transition-opacity"
                    style={{ color: "var(--text-tertiary)" }}>
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="form-label">Confirmar contraseña</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--text-tertiary)" }} />
                  <input type={showPassword ? "text" : "password"} className="input pl-10" value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repite la contraseña" required />
                </div>
              </div>

              <button type="submit" disabled={loading}
                className="btn btn-primary w-full py-3 rounded-xl shadow-lg transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
                style={{ boxShadow: "0 4px 14px rgba(13,148,136,0.3)" }}>
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    Registrando...
                  </span>
                ) : (
                  <><UserPlus size={16} /> Crear cuenta</>
                )}
              </button>
            </form>
          </div>

          <p className="text-xs text-center mt-6" style={{ color: "var(--text-tertiary)" }}>
            ¿Ya tienes cuenta?{" "}
            <Link to="/login" className="font-medium hover:underline" style={{ color: "var(--accent)" }}>
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
