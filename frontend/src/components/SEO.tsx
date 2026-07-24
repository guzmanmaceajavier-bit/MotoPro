import { Helmet } from "react-helmet-async";

interface CMSSEO {
  meta_title?: string;
  meta_description?: string;
  keywords?: string;
  og_title?: string;
  og_description?: string;
  og_image?: string;
  canonical_url?: string;
  robots?: string;
  schema_json?: Record<string, any>;
}

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
  pageSEO?: CMSSEO;
  structuredData?: Record<string, any>;
}

export function SEO({ title, description, image, url, type = "website", pageSEO, structuredData }: SEOProps) {
  const site = "MotoPro Taller";
  const siteUrl = "https://tallermotos.com";
  const pageTitle = pageSEO?.meta_title || title;
  const fullTitle = pageTitle ? `${pageTitle} | ${site}` : site;
  const desc = pageSEO?.meta_description || description || "Taller especializado en mantenimiento, reparación y personalización de motocicletas.";
  const ogTitleFinal = pageSEO?.og_title || fullTitle;
  const ogDescFinal = pageSEO?.og_description || desc;
  const ogImageFinal = pageSEO?.og_image || image || `${siteUrl}/og-default.jpg`;
  const canonical = pageSEO?.canonical_url || url ? `${siteUrl}${pageSEO?.canonical_url || url}` : undefined;

  const defaultSchema = {
    "@context": "https://schema.org",
    "@type": "AutoRepair",
    name: site,
    description: desc,
    url: siteUrl,
    telephone: "+57 300 123 4567",
    address: { "@type": "PostalAddress", addressLocality: "Bogotá", addressCountry: "CO" },
    openingHoursSpecification: [
      { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday","Tuesday","Wednesday","Thursday","Friday"], opens: "08:00", closes: "18:00" },
      { "@type": "OpeningHoursSpecification", dayOfWeek: "Saturday", opens: "08:00", closes: "13:00" },
    ],
    priceRange: "$$",
    sameAs: [],
  };

  const schema = structuredData || pageSEO?.schema_json || defaultSchema;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      {pageSEO?.keywords && <meta name="keywords" content={pageSEO.keywords} />}
      <meta name="robots" content={pageSEO?.robots || "index, follow"} />
      {canonical && <link rel="canonical" href={canonical} />}

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={ogTitleFinal} />
      <meta property="og:description" content={ogDescFinal} />
      <meta property="og:image" content={ogImageFinal} />
      <meta property="og:url" content={canonical || siteUrl} />
      <meta property="og:site_name" content={site} />
      <meta property="og:locale" content="es_CO" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={ogDescFinal} />
      <meta name="twitter:image" content={ogImageFinal} />

      {/* Structured Data */}
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
}


export function serviceSchema(service: { name: string; description: string; price?: number; image?: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.name,
    description: service.description,
    provider: { "@type": "AutoRepair", name: "MotoPro" },
    ...(service.price ? { offers: { "@type": "Offer", price: service.price, priceCurrency: "COP" } } : {}),
    ...(service.image ? { image: service.image } : {}),
  };
}


export function productSchema(product: { name: string; description: string; price: number; image?: string; sku?: string; rating?: number; reviews?: number }) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    sku: product.sku,
    ...(product.image ? { image: product.image } : {}),
    offers: { "@type": "Offer", price: product.price, priceCurrency: "COP", availability: "https://schema.org/InStock" },
    ...(product.rating ? { aggregateRating: { "@type": "AggregateRating", ratingValue: product.rating, reviewCount: product.reviews || 1 } } : {}),
  };
}


export function breadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `https://tallermotos.com${item.url}`,
    })),
  };
}


export function faqSchema(faqs: Array<{ question: string; answer: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map(f => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
}
