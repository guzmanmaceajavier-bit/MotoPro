import { Helmet } from "react-helmet-async";
import { useConfig } from "@/providers/CMSProvider";

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
  const config = useConfig();
  const site = config.site_name || "MotoPro Taller";
  const siteUrl = config.site_url || "https://tallermotos.com";
  const pageTitle = pageSEO?.meta_title || title;
  const fullTitle = pageTitle ? `${pageTitle} | ${site}` : site;
  const desc = pageSEO?.meta_description || description || config.site_description || "Taller especializado en mantenimiento, reparación y personalización de motocicletas.";
  const ogTitleFinal = pageSEO?.og_title || fullTitle;
  const ogDescFinal = pageSEO?.og_description || desc;
  const ogImageFinal = pageSEO?.og_image || image || config.site_og_image || `${siteUrl}/og-default.jpg`;
  const canonical = pageSEO?.canonical_url || url ? `${siteUrl}${pageSEO?.canonical_url || url}` : undefined;

  const defaultSchema = {
    "@context": "https://schema.org",
    "@type": "AutoRepair",
    name: site,
    description: desc,
    url: siteUrl,
    telephone: config.site_phone || "+57 300 123 4567",
    address: { "@type": "PostalAddress", addressLocality: config.site_city || "Bogotá", addressCountry: "CO" },
    openingHoursSpecification: (config.site_schema_hours ? JSON.parse(config.site_schema_hours) : null) || [
      { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday","Tuesday","Wednesday","Thursday","Friday"], opens: "08:00", closes: "18:00" },
      { "@type": "OpeningHoursSpecification", dayOfWeek: "Saturday", opens: "08:00", closes: "13:00" },
    ],
    priceRange: config.site_price_range || "$$",
    sameAs: (config.site_social_links ? JSON.parse(config.site_social_links) : null) || [],
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

export function blogPostSchema(post: { title: string; description: string; author?: string; datePublished?: string; image?: string; url?: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    ...(post.author ? { author: { "@type": "Person", name: post.author } } : {}),
    ...(post.datePublished ? { datePublished: post.datePublished } : {}),
    ...(post.image ? { image: post.image } : {}),
    ...(post.url ? { url: post.url } : {}),
    publisher: { "@type": "Organization", name: "MotoPro Taller" },
  };
}

export function articleSchema(article: { title: string; description: string; author?: string; datePublished?: string; image?: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    ...(article.author ? { author: { "@type": "Person", name: article.author } } : {}),
    ...(article.datePublished ? { datePublished: article.datePublished } : {}),
    ...(article.image ? { image: article.image } : {}),
    publisher: { "@type": "Organization", name: "MotoPro Taller" },
  };
}

export function localBusinessSchema(data: { name?: string; description?: string; telephone?: string; image?: string; url?: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "AutoRepair",
    name: data.name || "MotoPro Taller",
    description: data.description || "Taller especializado en mantenimiento, reparación y personalización de motocicletas.",
    ...(data.telephone ? { telephone: data.telephone } : {}),
    ...(data.image ? { image: data.image } : {}),
    ...(data.url ? { url: data.url } : {}),
    address: { "@type": "PostalAddress", addressLocality: "Bogotá", addressCountry: "CO" },
  };
}
