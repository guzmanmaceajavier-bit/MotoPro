import { useState, useEffect } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import { motion } from "framer-motion";

import { api } from "@/api/client";
import { sanitizeHtml } from "@/lib/sanitize";

const FALLBACK_CONTENT: Record<string, { title: string; content: string }> = {
  privacidad: {
    title: "Política de Privacidad",
    content: `
<h2>1. Información que recopilamos</h2>
<p>En MotoPro recopilamos los datos personales que nos proporcionas voluntariamente al contactarnos, agendar un servicio o realizar una compra, como tu nombre, teléfono, correo electrónico y dirección.</p>
<h2>2. Uso de la información</h2>
<p>Utilizamos tus datos únicamente para atender tus solicitudes, procesar pedidos y servicios, y mantenerte informado sobre el estado de los mismos. No compartimos tu información con terceros sin tu consentimiento.</p>
<h2>3. Protección de datos</h2>
<p>Implementamos medidas técnicas y organizativas para proteger tu información personal contra accesos no autorizados, alteración o pérdida.</p>
<h2>4. Tus derechos</h2>
<p>Puedes solicitar en cualquier momento el acceso, corrección o eliminación de tus datos personales escribiéndonos a nuestro correo o usando el formulario de contacto.</p>
<h2>5. Contacto</h2>
<p>Si tienes dudas sobre esta política, contáctanos a través de nuestro centro de ayuda o formulario de contacto.</p>
`,
  },
  terminos: {
    title: "Términos y Condiciones",
    content: `
<h2>1. Aceptación de los términos</h2>
<p>Al utilizar el sitio web de MotoPro aceptas los presentes términos y condiciones. Si no estás de acuerdo con ellos, te pedimos no utilizar nuestros servicios.</p>
<h2>2. Servicios</h2>
<p>MotoPro ofrece servicios de mantenimiento, reparación y personalización de motocicletas, así como la venta de repuestos y accesorios a través de nuestra tienda en línea.</p>
<h2>3. Reservas y pagos</h2>
<p>Las citas de servicio deben ser agendadas previamente. Los pagos de productos se procesan de forma segura y los precios están sujetos a cambios sin previo aviso.</p>
<h2>4. Garantías</h2>
<p>Los servicios y productos cuentan con las garantías establecidas por la ley y por el fabricante, siempre que se cumplan las condiciones de uso y mantenimiento.</p>
<h2>5. Limitación de responsabilidad</h2>
<p>MotoPro no será responsable por daños derivados del mal uso de los productos o servicios, o por causas fuera de nuestro control.</p>
`,
  },
  cookies: {
    title: "Política de Cookies",
    content: `
<h2>1. ¿Qué son las cookies?</h2>
<p>Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo cuando visitas nuestro sitio web y nos permiten mejorar tu experiencia de navegación.</p>
<h2>2. Tipos de cookies que utilizamos</h2>
<p>Usamos cookies técnicas, necesarias para el funcionamiento del sitio, y cookies de preferencia, que recuerdan tus selecciones como el idioma o el tema visual.</p>
<h2>3. Gestión de cookies</h2>
<p>Puedes configurar tu navegador para bloquear o eliminar las cookies en cualquier momento. Al deshabilitarlas, algunas funciones del sitio podrían no funcionar correctamente.</p>
<h2>4. Contacto</h2>
<p>Para más información sobre el uso de cookies, escríbenos a través de nuestro formulario de contacto.</p>
`,
  },
};

export default function LegalPage() {
  const params = useParams();
  const location = useLocation();
  const slug = params.slug || location.pathname.replace(/^\//, "");
  const [page, setPage] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) { setLoading(false); return; }
    api.get(`/legal/slug/${slug}`).then((data) => {
      setPage(data?.data || data || null);
    }).catch(() => setPage(null)).finally(() => setLoading(false));
  }, [slug]);

  const fallback = FALLBACK_CONTENT[slug] || null;
  const displayPage = page || fallback;

  return (
      <main className="pt-16">
        <section className="relative overflow-hidden bg-surface-primary pt-28 pb-16">
          <div className="absolute inset-0 bg-gradient-to-b from-interactive-accent/5 via-transparent to-transparent" />
          <div className="mx-auto max-w-3xl px-6 lg:px-8 relative">
            <Link to="/" className="inline-flex items-center gap-2 text-body-sm text-text-tertiary hover:text-text-secondary transition-colors mb-6">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6" /></svg>
              Volver al inicio
            </Link>

            {loading ? (
              <div className="space-y-4 animate-pulse">
                <div className="h-10 w-64 bg-surface-tertiary rounded-lg" />
                <div className="h-4 w-full bg-surface-tertiary rounded-lg" />
                <div className="h-4 w-3/4 bg-surface-tertiary rounded-lg" />
                <div className="h-4 w-5/6 bg-surface-tertiary rounded-lg" />
              </div>
            ) : displayPage ? (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-h2 lg:text-h1 text-text-primary tracking-tight mb-6">{displayPage.title}</h1>
                <div
                  className="prose prose-invert max-w-none text-text-secondary leading-relaxed space-y-4 [&_h2]:text-h4 [&_h2]:text-text-primary [&_h2]:mt-8 [&_h2]:mb-3 [&_h3]:text-h5 [&_h3]:text-text-primary [&_h3]:mt-6 [&_h3]:mb-2 [&_p]:text-body [&_p]:leading-relaxed [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1 [&_li]:text-body [&_a]:text-interactive-accent [&_a]:hover:underline"
                  dangerouslySetInnerHTML={{ __html: sanitizeHtml(displayPage.content) }}
                />
              </motion.div>
            ) : (
              <div className="text-center py-16">
                <p className="text-body text-text-tertiary">Página no encontrada</p>
                <Link to="/" className="text-interactive-accent hover:underline mt-4 inline-block">Volver al inicio</Link>
              </div>
            )}
          </div>
        </section>
      </main>
  );
}
