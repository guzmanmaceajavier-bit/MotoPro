import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { BackToTop } from "@/components/layout/BackToTop";
import { WhatsAppFloat } from "@/components/layout/WhatsAppFloat";
import { SEO } from "@/components/SEO";
import { ServiceInquiry } from "@/features/consulta/ServiceInquiry";

export default function Consulta() {

  return (
    <>
      <SEO title="Consultar servicio" description="Consulta el estado de tu servicio en nuestro taller" />
      <Navbar />
      <main className="flex-1 pt-20">
        <div className="relative overflow-hidden bg-surface-primary py-16">
          <div className="mx-auto max-w-4xl px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-heading font-bold text-text-primary">Consultar servicio</h1>
            <p className="mt-4 text-lg text-text-secondary">Busca el estado de tu servicio por orden, placa o cédula</p>
          </div>
        </div>
        <ServiceInquiry />
      </main>
      <Footer /><BackToTop /><WhatsAppFloat />
    </>
  );
}
