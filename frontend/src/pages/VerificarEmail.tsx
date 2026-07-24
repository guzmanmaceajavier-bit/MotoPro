import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { SEO } from "@/components/SEO";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { BackToTop } from "@/components/layout/BackToTop";
import { WhatsAppFloat } from "@/components/layout/WhatsAppFloat";
import { api } from "@/api/client";

export default function VerificarEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) { setStatus("error"); setMessage("Token no válido"); return; }
    api.post("/customer-auth/verify-email", { token }).then((r: any) => {
      setStatus("success");
      setMessage(r?.message || "Email verificado correctamente");
    }).catch((err) => {
      setStatus("error");
      setMessage(err?.message || "Error al verificar email");
    });
  }, [token]);

  return (
    <>
      <SEO title="Verificar Email" />
      <Navbar />
      <main className="min-h-[60vh] flex items-center justify-center bg-surface-primary pt-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="max-w-md mx-auto px-4 text-center"
        >
          {status === "loading" && (
            <div className="animate-spin w-12 h-12 border-2 border-interactive-accent border-t-transparent rounded-full mx-auto mb-4" />
          )}
          {status === "success" && (
            <>
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-text-primary mb-2">¡Email verificado!</h1>
              <p className="text-text-secondary mb-6">{message}</p>
              <Link to="/perfil" className="inline-flex rounded-lg bg-gradient-to-r from-interactive-accent-hover to-interactive-accent px-6 py-3 text-sm font-semibold text-text-primary">Ir a mi perfil</Link>
            </>
          )}
          {status === "error" && (
            <>
              <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-text-primary mb-2">Error de verificación</h1>
              <p className="text-text-secondary mb-6">{message}</p>
              <Link to="/" className="inline-flex rounded-lg bg-gradient-to-r from-interactive-accent-hover to-interactive-accent px-6 py-3 text-sm font-semibold text-text-primary">Volver al inicio</Link>
            </>
          )}
        </motion.div>
      </main>
      <Footer /><BackToTop /><WhatsAppFloat />
    </>
  );
}
