import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { SEO } from "@/components/SEO";
import { Input } from "@/components/ui/Input";
import { loginSchema, registerSchema, type LoginFormData, type RegisterFormData } from "@/lib/schemas";
import { useAuth } from "@/providers/AuthProvider";
import { useToast } from "@/providers/ToastProvider";
import { Clock, Award, Package, Shield } from "lucide-react";

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const { login, register } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const loginForm = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) });
  const registerForm = useForm<RegisterFormData>({ resolver: zodResolver(registerSchema) });

  useEffect(() => {
    const saved = localStorage.getItem("customer_remember_email");
    if (saved) {
      loginForm.setValue("email", saved);
      setRememberMe(true);
    }
  }, [loginForm]);

  const handleLogin = async (data: LoginFormData) => {
    try {
      await login(data.email, data.password);
      if (rememberMe) localStorage.setItem("customer_remember_email", data.email);
      else localStorage.removeItem("customer_remember_email");
      addToast("Inicio de sesión exitoso", "success");
      navigate("/perfil");
    } catch {
      addToast("Credenciales inválidas", "error");
    }
  };

  const handleRegister = async (data: RegisterFormData) => {
    try {
      await register(data.name, data.email, data.password, data.phone);
      addToast("Registro exitoso", "success");
      navigate("/perfil");
    } catch {
      addToast("Error al registrarse", "error");
    }
  };

  return (
    <>
      <SEO title="Iniciar Sesión | MotoPro" description="Accede a tu espacio personal para gestionar tus servicios, citas y facturas." />
      <main className="bg-surface-primary min-h-screen pt-16 relative">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=1920&h=1080&fit=crop"
            alt="Moto" loading="lazy"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/80" />
        </div>

        <div className="relative z-10">
          <section className="py-20 lg:py-28 min-h-[400px] flex items-center">
            <div className="mx-auto max-w-7xl px-6 lg:px-8 w-full">
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
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
                    Accede a tu{" "}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r bg-interactive-accent">
                      espacio personal
                    </span>
                  </h1>
                  <p className="text-lg text-white/70 mb-8 max-w-lg">
                    Regístrate o inicia sesión para ver tu historial de servicios, citas, facturas y mucho más.
                  </p>

                  {/* Features */}
                  <div className="space-y-4 mb-8">
                    {[
                      { icon: Clock, title: "Historial completo", desc: "Consulta todos los servicios realizados a tu moto." },
                      { icon: Award, title: "Citas y recordatorios", desc: "Revisa tus citas próximas y recibe recordatorios." },
                      { icon: Package, title: "Facturas y pagos", desc: "Descarga tus facturas y lleva el control de tus pagos." },
                    ].map((feature) => (
                      <div key={feature.title} className="flex items-start gap-4 p-4 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10">
                        <span className="w-10 h-10 rounded-lg bg-interactive-accent/20 flex items-center justify-center shrink-0">
                          <feature.icon className="w-5 h-5 text-interactive-accent" />
                        </span>
                        <div>
                          <h3 className="text-sm font-bold text-white">{feature.title}</h3>
                          <p className="text-xs text-white/60 mt-0.5">{feature.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Help */}
                  <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10">
                    <div className="flex items-center gap-3">
                      <span className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                        <Shield className="w-5 h-5 text-white/70" />
                      </span>
                      <div>
                        <p className="text-sm font-bold text-white">¿Necesitas ayuda?</p>
                        <p className="text-xs text-white/60">Estamos listos para asistirte</p>
                      </div>
                    </div>
                    <Link
                      to="/contacto"
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-interactive-accent text-interactive-accent text-xs font-semibold hover:bg-interactive-accent/20 transition-all"
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
                  <div className="bg-surface-secondary border border-border rounded-2xl p-6 md:p-8">{/* Tabs */}
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

                        <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                          <Input label="Correo electrónico" placeholder="tu@email.com"
                            error={loginForm.formState.errors.email?.message}
                            icon={<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>}
                            {...loginForm.register("email")}
                          />
                          <Input label="Contraseña"
                            type={showPassword ? "text" : "password"}
                            placeholder="Ingresa tu contraseña"
                            error={loginForm.formState.errors.password?.message}
                            icon={<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg>}
                            rightElement={
                              <button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"} className="text-text-tertiary hover:text-text-primary transition-colors">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  {showPassword ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                  ) : (
                                    <><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></>
                                  )}
                                </svg>
                              </button>
                            }
                            {...loginForm.register("password")}
                          />

                          <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)}
                                className="w-4 h-4 rounded border-border bg-surface-tertiary text-interactive-accent focus:ring-interactive-accent/50"
                              />
                              <span className="text-sm text-text-secondary">Recordarme</span>
                            </label>
                            <Link to="/contacto" className="text-sm text-interactive-accent hover:text-interactive-accent-hover transition-colors">
                              ¿Olvidaste tu contraseña?
                            </Link>
                          </div>

                          <button type="submit" disabled={loginForm.formState.isSubmitting}
                            className="w-full flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r bg-interactive-accent py-3.5 font-bold text-black hover:bg-interactive-accent-hover transition-all duration-300 shadow-elevation-2 disabled:opacity-50"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" /></svg>
                            {loginForm.formState.isSubmitting ? "Entrando..." : "Iniciar sesión"}
                          </button>
                        </form>

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

                        <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-4">
                          <Input label="Nombre completo" placeholder="Tu nombre"
                            error={registerForm.formState.errors.name?.message}
                            icon={<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>}
                            {...registerForm.register("name")}
                          />
                          <Input label="Correo electrónico" placeholder="tu@email.com"
                            error={registerForm.formState.errors.email?.message}
                            icon={<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>}
                            {...registerForm.register("email")}
                          />
                          <Input label="Teléfono" placeholder="+52 555 123 4567"
                            error={registerForm.formState.errors.phone?.message}
                            icon={<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" /></svg>}
                            {...registerForm.register("phone")}
                          />
                          <Input label="Contraseña" type={showPassword ? "text" : "password"} placeholder="Mínimo 6 caracteres"
                            error={registerForm.formState.errors.password?.message}
                            icon={<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg>}
                            {...registerForm.register("password")}
                          />
                          <Input label="Confirmar contraseña" type={showPassword ? "text" : "password"} placeholder="Repite tu contraseña"
                            error={registerForm.formState.errors.confirmPassword?.message}
                            icon={<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg>}
                            {...registerForm.register("confirmPassword")}
                          />
                          <button type="submit" disabled={registerForm.formState.isSubmitting}
                            className="w-full flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r bg-interactive-accent py-3.5 font-bold text-black hover:bg-interactive-accent-hover transition-all duration-300 shadow-elevation-2 disabled:opacity-50"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" /></svg>
                            {registerForm.formState.isSubmitting ? "Creando cuenta..." : "Crear cuenta"}
                          </button>
                        </form>

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
              </div>

              {/* Consultar sin registro */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="mt-8 mx-auto w-full max-w-md"
              >
                <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 text-center">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-interactive-accent/20 text-interactive-accent mb-3">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                  </div>
                  <p className="text-sm font-semibold text-white mb-1">Solo quieres consultar tu servicio?</p>
                  <p className="text-xs text-white/60 mb-4">Puedes verificar el estado de tu moto sin necesidad de crear cuenta.</p>
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
          </section>

          {/* Trust Badges */}
          <section className="py-12 border-t border-white/10">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  { icon: Shield, title: "Datos protegidos", desc: "Tu información está segura con nosotros." },
                  { icon: Clock, title: "Acceso rápido", desc: "Todo lo que necesitas, en un solo lugar." },
                  { icon: Award, title: "Ofertas exclusivas", desc: "Descuentos y promociones especiales para ti." },
                  { icon: Package, title: "Atención personalizada", desc: "Te conocemos y te ofrecemos el mejor servicio." },
                ].map((badge) => (
                  <div key={badge.title} className="flex items-start gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-interactive-accent shrink-0">
                      <badge.icon size={18} />
                    </span>
                    <div>
                      <p className="text-sm font-bold text-white">{badge.title}</p>
                      <p className="text-xs text-white/50 mt-0.5">{badge.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
