import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { SEO } from "@/components/SEO";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { BackToTop } from "@/components/layout/BackToTop";
import { WhatsAppFloat } from "@/components/layout/WhatsAppFloat";
import { useAuth } from "@/providers/AuthProvider";
import { useToast } from "@/providers/ToastProvider";

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Login form
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register form
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirm, setRegConfirm] = useState("");

  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) { addToast("Completa todos los campos", "error"); return; }
    setLoading(true);
    try {
      await login(loginEmail, loginPassword);
      addToast("Inicio de sesión exitoso", "success");
      navigate("/perfil");
    } catch {
      addToast("Credenciales inválidas", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regEmail || !regPassword) { addToast("Completa los campos obligatorios", "error"); return; }
    if (regPassword.length < 6) { addToast("Mínimo 6 caracteres", "error"); return; }
    if (regPassword !== regConfirm) { addToast("Las contraseñas no coinciden", "error"); return; }
    setLoading(true);
    try {
      await register(regName, regEmail, regPassword, regPhone);
      addToast("Registro exitoso", "success");
      navigate("/perfil");
    } catch {
      addToast("Error al registrarse", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEO title="Iniciar Sesión | MotoPro" description="Accede a tu espacio personal para gestionar tus servicios, citas y facturas." />
      <Navbar />
      <main className="bg-surface-primary min-h-screen pt-16">
        {/* Hero Section */}
        <section className="relative pt-20 overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img
              src="https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=1920&h=1080&fit=crop"
              alt="Moto"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-surface-primary/80" />
          </div>

          <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8 py-12 lg:py-20">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Content */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="inline-flex items-center gap-2 bg-interactive-accent/10 border border-interactive-accent/30 text-interactive-accent text-xs font-semibold px-4 py-2 rounded-full mb-6">
                  <span className="w-2 h-2 bg-interactive-accent rounded-full" />
                  TU MOTO, NUESTRA PASIÓN
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-text-primary leading-tight mb-6">
                  Accede a tu{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r bg-interactive-accent">
                    espacio personal
                  </span>
                </h1>
                <p className="text-lg text-text-secondary mb-8 max-w-lg">
                  Regístrate o inicia sesión para ver tu historial de servicios, citas, facturas y mucho más.
                </p>

                {/* Features */}
                <div className="space-y-4 mb-8">
                  {[
                    { icon: "📋", title: "Historial completo", desc: "Consulta todos los servicios realizados a tu moto." },
                    { icon: "📅", title: "Citas y recordatorios", desc: "Revisa tus citas próximas y recibe recordatorios." },
                    { icon: "📄", title: "Facturas y pagos", desc: "Descarga tus facturas y lleva el control de tus pagos." },
                  ].map((feature) => (
                    <div key={feature.title} className="flex items-start gap-4 p-4 rounded-lg bg-surface-secondary/80 border border-border">
                      <span className="w-10 h-10 rounded-lg bg-interactive-accent/10 flex items-center justify-center text-lg shrink-0">
                        {feature.icon}
                      </span>
                      <div>
                        <h3 className="text-sm font-bold text-text-primary">{feature.title}</h3>
                        <p className="text-xs text-text-secondary mt-0.5">{feature.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Help */}
                <div className="flex items-center justify-between p-4 rounded-lg bg-surface-secondary/80 border border-border">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🎧</span>
                    <div>
                      <p className="text-sm font-bold text-text-primary">¿Necesitas ayuda?</p>
                      <p className="text-xs text-text-secondary">Estamos listos para asistirte</p>
                    </div>
                  </div>
                  <Link
                    to="/contacto"
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-interactive-accent text-interactive-accent text-xs font-semibold hover:bg-interactive-accent/10 transition-all"
                  >
                    Contactar soporte
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
                    </svg>
                  </Link>
                </div>
              </motion.div>

              {/* Right Form */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="bg-surface-secondary border border-border rounded-2xl p-6 md:p-8">
                  {/* Tabs */}
                  <div className="grid grid-cols-2 gap-2 mb-8 bg-surface-tertiary rounded-lg p-1">
                    <button
                      onClick={() => setActiveTab("login")}
                      className={`flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold transition-all duration-300 ${
                        activeTab === "login"
                          ? "bg-interactive-accent text-black"
                          : "text-text-secondary hover:text-text-primary"
                      }`}
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                      </svg>
                      Iniciar sesión
                    </button>
                    <button
                      onClick={() => setActiveTab("register")}
                      className={`flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold transition-all duration-300 ${
                        activeTab === "register"
                          ? "bg-interactive-accent text-black"
                          : "text-text-secondary hover:text-text-primary"
                      }`}
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
                      </svg>
                      Crear cuenta
                    </button>
                  </div>

                  {/* Login Form */}
                  {activeTab === "login" && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                      <div className="text-center mb-6">
                        <h2 className="text-xl font-bold text-text-primary">¡Bienvenido de vuelta!</h2>
                        <p className="text-sm text-text-secondary mt-1">Ingresa tus datos para acceder a tu cuenta</p>
                      </div>

                      <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold text-text-secondary mb-1.5">Correo electrónico</label>
                          <div className="relative">
                            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                            </svg>
                            <input
                              type="email"
                              value={loginEmail}
                              onChange={(e) => setLoginEmail(e.target.value)}
                              placeholder="tu@email.com"
                              required
                              className="w-full rounded-lg border border-border bg-surface-tertiary pl-10 pr-4 py-3 text-sm text-text-primary placeholder:text-text-tertiary outline-none focus:border-border-accent transition-colors"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-text-secondary mb-1.5">Contraseña</label>
                          <div className="relative">
                            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                            </svg>
                            <input
                              type={showPassword ? "text" : "password"}
                              value={loginPassword}
                              onChange={(e) => setLoginPassword(e.target.value)}
                              placeholder="Ingresa tu contraseña"
                              required
                              className="w-full rounded-lg border border-border bg-surface-tertiary pl-10 pr-12 py-3 text-sm text-text-primary placeholder:text-text-tertiary outline-none focus:border-border-accent transition-colors"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                {showPassword ? (
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                ) : (
                                  <>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  </>
                                )}
                              </svg>
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={rememberMe}
                              onChange={(e) => setRememberMe(e.target.checked)}
                              className="w-4 h-4 rounded border-border bg-surface-tertiary text-interactive-accent focus:ring-interactive-accent/50"
                            />
                            <span className="text-sm text-text-secondary">Recordarme</span>
                          </label>
                          <a href="#" className="text-sm text-interactive-accent hover:text-interactive-accent-hover transition-colors">
                            ¿Olvidaste tu contraseña?
                          </a>
                        </div>

                        <button
                          type="submit"
                          disabled={loading}
                          className="w-full flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r bg-interactive-accent py-3.5 font-bold text-black hover:bg-interactive-accent-hover transition-all duration-300 shadow-elevation-2 disabled:opacity-50"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                          </svg>
                          {loading ? "Entrando..." : "Iniciar sesión"}
                        </button>
                      </form>

                      <div className="flex items-center gap-4 my-6">
                        <div className="flex-1 h-px bg-surface-tertiary" />
                        <span className="text-xs text-text-tertiary">o continúa con</span>
                        <div className="flex-1 h-px bg-surface-tertiary" />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <button className="flex items-center justify-center gap-2 py-3 rounded-lg border border-border bg-surface-tertiary text-sm font-medium text-text-primary hover:border-border-accent transition-all">
                          <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                          </svg>
                          Google
                        </button>
                        <button className="flex items-center justify-center gap-2 py-3 rounded-lg border border-border bg-surface-tertiary text-sm font-medium text-text-primary hover:border-border-accent transition-all">
                          <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                          </svg>
                          Facebook
                        </button>
                      </div>

                      <p className="mt-6 text-center text-sm text-text-secondary">
                        ¿No tienes una cuenta?{" "}
                        <button onClick={() => setActiveTab("register")} className="font-semibold text-interactive-accent hover:text-interactive-accent-hover transition-colors">
                          Crear cuenta
                        </button>
                      </p>
                    </motion.div>
                  )}

                  {/* Register Form */}
                  {activeTab === "register" && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                      <div className="text-center mb-6">
                        <h2 className="text-xl font-bold text-text-primary">¡Crea tu cuenta!</h2>
                        <p className="text-sm text-text-secondary mt-1">Regístrate para acceder a todos nuestros servicios</p>
                      </div>

                      <form onSubmit={handleRegister} className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold text-text-secondary mb-1.5">Nombre completo</label>
                          <div className="relative">
                            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                            </svg>
                            <input
                              type="text"
                              value={regName}
                              onChange={(e) => setRegName(e.target.value)}
                              placeholder="Tu nombre"
                              required
                              className="w-full rounded-lg border border-border bg-surface-tertiary pl-10 pr-4 py-3 text-sm text-text-primary placeholder:text-text-tertiary outline-none focus:border-border-accent transition-colors"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-text-secondary mb-1.5">Correo electrónico</label>
                          <div className="relative">
                            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                            </svg>
                            <input
                              type="email"
                              value={regEmail}
                              onChange={(e) => setRegEmail(e.target.value)}
                              placeholder="tu@email.com"
                              required
                              className="w-full rounded-lg border border-border bg-surface-tertiary pl-10 pr-4 py-3 text-sm text-text-primary placeholder:text-text-tertiary outline-none focus:border-border-accent transition-colors"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-text-secondary mb-1.5">Teléfono</label>
                          <div className="relative">
                            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                            </svg>
                            <input
                              type="tel"
                              value={regPhone}
                              onChange={(e) => setRegPhone(e.target.value)}
                              placeholder="+52 555 123 4567"
                              className="w-full rounded-lg border border-border bg-surface-tertiary pl-10 pr-4 py-3 text-sm text-text-primary placeholder:text-text-tertiary outline-none focus:border-border-accent transition-colors"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-text-secondary mb-1.5">Contraseña</label>
                          <div className="relative">
                            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                            </svg>
                            <input
                              type={showPassword ? "text" : "password"}
                              value={regPassword}
                              onChange={(e) => setRegPassword(e.target.value)}
                              placeholder="Mínimo 6 caracteres"
                              required
                              className="w-full rounded-lg border border-border bg-surface-tertiary pl-10 pr-12 py-3 text-sm text-text-primary placeholder:text-text-tertiary outline-none focus:border-border-accent transition-colors"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                {showPassword ? (
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                ) : (
                                  <>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  </>
                                )}
                              </svg>
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-text-secondary mb-1.5">Confirmar contraseña</label>
                          <div className="relative">
                            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                            </svg>
                            <input
                              type={showPassword ? "text" : "password"}
                              value={regConfirm}
                              onChange={(e) => setRegConfirm(e.target.value)}
                              placeholder="Repite tu contraseña"
                              required
                              className="w-full rounded-lg border border-border bg-surface-tertiary pl-10 pr-12 py-3 text-sm text-text-primary placeholder:text-text-tertiary outline-none focus:border-border-accent transition-colors"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                {showPassword ? (
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                ) : (
                                  <>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  </>
                                )}
                              </svg>
                            </button>
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={loading}
                          className="w-full flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r bg-interactive-accent py-3.5 font-bold text-black hover:bg-interactive-accent-hover transition-all duration-300 shadow-elevation-2 disabled:opacity-50"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
                          </svg>
                          {loading ? "Creando cuenta..." : "Crear cuenta"}
                        </button>
                      </form>

                      <div className="flex items-center gap-4 my-6">
                        <div className="flex-1 h-px bg-surface-tertiary" />
                        <span className="text-xs text-text-tertiary">o regístrate con</span>
                        <div className="flex-1 h-px bg-surface-tertiary" />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <button className="flex items-center justify-center gap-2 py-3 rounded-lg border border-border bg-surface-tertiary text-sm font-medium text-text-primary hover:border-border-accent transition-all">
                          <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                          </svg>
                          Google
                        </button>
                        <button className="flex items-center justify-center gap-2 py-3 rounded-lg border border-border bg-surface-tertiary text-sm font-medium text-text-primary hover:border-border-accent transition-all">
                          <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                          </svg>
                          Facebook
                        </button>
                      </div>

                      <p className="mt-6 text-center text-sm text-text-secondary">
                        ¿Ya tienes una cuenta?{" "}
                        <button onClick={() => setActiveTab("login")} className="font-semibold text-interactive-accent hover:text-interactive-accent-hover transition-colors">
                          Iniciar sesión
                        </button>
                      </p>
                    </motion.div>
                  )}
                </div>
              </motion.div>

              {/* Consultar sin registro */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="mt-8 mx-auto w-full max-w-md"
              >
                <div className="rounded-2xl border border-border bg-surface-secondary/80 p-6 text-center">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-interactive-accent/10 text-interactive-accent mb-3">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                  </div>
                  <p className="text-sm font-semibold text-text-primary mb-1">Solo quieres consultar tu servicio?</p>
                  <p className="text-xs text-text-secondary mb-4">Puedes verificar el estado de tu moto sin necesidad de crear cuenta.</p>
                  <Link
                    to="/estado-servicio"
                    className="inline-flex items-center gap-2 rounded-lg border border-interactive-accent/30 bg-interactive-accent/10 px-5 py-2.5 text-sm font-semibold text-interactive-accent hover:bg-interactive-accent/20 transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                    </svg>
                    Consultar por ID
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Trust Badges */}
        <section className="py-12 border-t border-border">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { icon: "🛡️", title: "Datos protegidos", desc: "Tu información está segura con nosotros." },
                { icon: "⚡", title: "Acceso rápido", desc: "Todo lo que necesitas, en un solo lugar." },
                { icon: "🎁", title: "Ofertas exclusivas", desc: "Descuentos y promociones especiales para ti." },
                { icon: "⭐", title: "Atención personalizada", desc: "Te conocemos y te ofrecemos el mejor servicio." },
              ].map((badge) => (
                <div key={badge.title} className="flex items-start gap-3">
                  <span className="text-2xl">{badge.icon}</span>
                  <div>
                    <p className="text-sm font-bold text-text-primary">{badge.title}</p>
                    <p className="text-xs text-text-tertiary mt-0.5">{badge.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <BackToTop />
      <WhatsAppFloat />
    </>
  );
}
