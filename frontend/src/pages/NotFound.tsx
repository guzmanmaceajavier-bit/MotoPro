import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";

export default function NotFound() {
  return (
    <>
      <SEO title="Página no encontrada" description="La página que buscas no existe." />
      <main className="flex flex-1 items-center justify-center px-4 pt-16">
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-2xl bg-interactive-accent/10">
            <svg className="h-12 w-12 text-interactive-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <h1 className="mb-2 text-6xl font-heading font-bold text-text-primary">404</h1>
          <p className="mb-8 text-lg text-text-secondary">Página no encontrada</p>
          <Link to="/" className="inline-block rounded-lg bg-interactive-accent px-8 py-3 font-semibold text-white hover:bg-interactive-accent-hover transition-colors">
            Volver al inicio
          </Link>
        </div>
      </main>
    </>
  );
}
