import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { SEO } from "@/components/SEO";

export function EmptyCart() {
  return (
    <>
      <SEO title="Carrito de compras" />
      <main className="pt-20 min-h-screen bg-surface-primary flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-md">
          <div className="mx-auto mb-6 w-24 h-24 rounded-3xl bg-interactive-accent/10 flex items-center justify-center">
            <svg className="w-12 h-12 text-interactive-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-text-primary">Tu carrito está vacío</h1>
          <p className="mt-2 text-text-secondary">Explora nuestra tienda y encuentra los repuestos que necesitas</p>
          <Link to="/tienda"
            className="inline-flex items-center gap-2 mt-6 rounded-lg bg-gradient-to-r bg-interactive-accent px-7 py-3 font-semibold text-black hover:bg-interactive-accent-hover transition-all"
          >
            Ir a la tienda
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </motion.div>
      </main>
    </>
  );
}
