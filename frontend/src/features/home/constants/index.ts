import type { HeroSlide, Brand, FeaturedProduct, ValueItem } from "../types";

export const FALLBACK_SLIDES: HeroSlide[] = [
  { image: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=1600&q=80", title: "Expertos en motocicletas", subtitle: "", description: "", cta_text: "Agendar Servicio", cta_link: "/solicitar-servicio" },
  { image: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=1600&q=80", title: "Repuestos originales", subtitle: "", description: "", cta_text: "Ver Tienda", cta_link: "/tienda" },
  { image: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=1600&q=80", title: "Diagnóstico profesional", subtitle: "", description: "", cta_text: "Agendar Servicio", cta_link: "/solicitar-servicio" },
  { image: "https://images.unsplash.com/photo-1626668893632-6f3a4466d22d?w=1600&q=80", title: "Personalización única", subtitle: "", description: "", cta_text: "Ver Tienda", cta_link: "/tienda" },
];

export const STAT_ICONS = {
  star: "M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z",
  users: "M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z",
  package: "M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0l-3-3m3 3l3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z",
  flag: "M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z",
  shield: "M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
};

export const BRAND_GRADIENTS = [
  "from-red-600 to-red-700", "from-blue-600 to-blue-700", "from-red-500 to-red-600",
  "from-green-600 to-green-700", "from-red-700 to-red-800", "from-blue-500 to-cyan-500",
  "from-orange-600 to-orange-700", "from-blue-600 to-blue-700", "from-gray-500 to-gray-600",
  "from-yellow-600 to-yellow-700", "from-green-500 to-green-600", "from-teal-500 to-teal-600",
];

export const MARQUEE_GRADIENTS = [
  "from-red-500 to-yellow-500", "from-blue-500 to-cyan-500", "from-green-500 to-teal-500",
  "from-teal-500 to-pink-500", "from-orange-500 to-red-500", "from-indigo-500 to-teal-500",
  "from-yellow-500 to-orange-500", "from-pink-500 to-rose-500", "from-cyan-500 to-blue-500",
  "from-teal-500 to-green-500", "from-rose-500 to-pink-500", "from-violet-500 to-indigo-500",
  "from-amber-500 to-orange-500", "from-lime-500 to-green-500", "from-emerald-500 to-teal-500",
  "from-sky-500 to-indigo-500", "from-fuchsia-500 to-teal-500", "from-red-500 to-rose-500",
  "from-blue-500 to-violet-500", "from-green-500 to-lime-500", "from-yellow-500 to-amber-500",
  "from-cyan-500 to-sky-500", "from-indigo-500 to-fuchsia-500",
];

export const BG_GRADIENTS: Record<string, string> = {
  tire: "from-blue-500/10 to-cyan-500/10", chain: "from-orange-500/10 to-red-500/10",
  brake: "from-red-500/10 to-rose-500/10", filter: "from-green-500/10 to-emerald-500/10",
  battery: "from-yellow-500/10 to-amber-500/10", engine: "from-gray-500/10 to-slate-500/10",
  oil: "from-amber-500/10 to-yellow-500/10", helmet: "from-interactive-accent/10 to-pink-500/10",
  lights: "from-cyan-500/10 to-blue-500/10", gloves: "from-rose-500/10 to-red-500/10",
  jacket: "from-indigo-500/10 to-interactive-accent/10", paint: "from-fuchsia-500/10 to-interactive-accent/10",
};

export const PRODUCT_ICONS: Record<string, string> = {
  tire: "\u{1F535}", chain: "\u26D3\uFE0F", brake: "\u{1F6DF}", filter: "\u{1F527}", battery: "\u{1F50B}",
  engine: "\u2699\uFE0F", oil: "\u{1F6E2}\uFE0F", helmet: "\u{1FA96}", lights: "\u{1F4A1}", gloves: "\u{1F9E4}", jacket: "\u{1F9E5}", paint: "\u{1F3A8}",
};

export const FALLBACK_BRANDS: Brand[] = [
  { id: "fb1", name: "Yamaha", image: "", vehicle_count: 15 },
  { id: "fb2", name: "Honda", image: "", vehicle_count: 12 },
  { id: "fb3", name: "Suzuki", image: "", vehicle_count: 10 },
  { id: "fb4", name: "Kawasaki", image: "", vehicle_count: 8 },
  { id: "fb5", name: "AKT", image: "", vehicle_count: 20 },
  { id: "fb6", name: "Bajaj", image: "", vehicle_count: 14 },
  { id: "fb7", name: "Victory", image: "", vehicle_count: 6 },
  { id: "fb8", name: "Hero", image: "", vehicle_count: 18 },
  { id: "fb9", name: "TVS", image: "", vehicle_count: 9 },
  { id: "fb10", name: "KTM", image: "", vehicle_count: 7 },
  { id: "fb11", name: "BMW", image: "", vehicle_count: 5 },
  { id: "fb12", name: "Ducati", image: "", vehicle_count: 4 },
];

export const FALLBACK_PRODUCTS: FeaturedProduct[] = [
  { id: "fb1", name: "Aceite Sint\u00E9tico 10W40", price: 45000, image: "oil", categoryName: "Lubricantes", is_active: 1 },
  { id: "fb2", name: "Kit de Arrastre Reforzado", price: 120000, image: "chain", categoryName: "Transmisi\u00F3n", is_active: 1 },
  { id: "fb3", name: "Pastillas de Freno Cer\u00E1micas", price: 35000, image: "brake", categoryName: "Frenos", is_active: 1 },
  { id: "fb4", name: "Bater\u00EDa Libre de Mantenimiento", price: 98000, image: "battery", categoryName: "El\u00E9ctrico", is_active: 1 },
  { id: "fb5", name: "Filtro de Aire Deportivo", price: 28000, image: "filter", categoryName: "Admisi\u00F3n", is_active: 1 },
  { id: "fb6", name: "Casco Integral Deportivo", price: 180000, image: "helmet", categoryName: "Accesorios", is_active: 1 },
  { id: "fb7", name: "Guantes de Protecci\u00F3n", price: 65000, image: "gloves", categoryName: "Accesorios", is_active: 1 },
  { id: "fb8", name: "Chaqueta Impermeable", price: 250000, image: "jacket", categoryName: "Accesorios", is_active: 1 },
];

export const FALLBACK_VALUES: ValueItem[] = [
  { id: "fb1", title: "Experiencia y Confianza", description: "M\u00E1s de 10 a\u00F1os de experiencia en mantenimiento y reparaci\u00F3n de motocicletas de todas las marcas.", icon: "award", sort_order: 1 },
  { id: "fb2", title: "Repuestos Originales", description: "Solo trabajamos con repuestos originales y de la m\u00E1s alta calidad para garantizar el mejor rendimiento.", icon: "check", sort_order: 2 },
  { id: "fb3", title: "Diagn\u00F3stico Preciso", description: "Utilizamos equipo de diagn\u00F3stico especializado para identificar fallas con precisi\u00F3n y rapidez.", icon: "search", sort_order: 3 },
  { id: "fb4", title: "Garant\u00EDa en Todos los Trabajos", description: "Todos nuestros servicios y repuestos cuentan con garant\u00EDa por escrito. Tu tranquilidad es lo primero.", icon: "shield", sort_order: 4 },
  { id: "fb5", title: "Atenci\u00F3n Personalizada", description: "Te asesoramos de principio a fin, explicando cada detalle del trabajo a realizar en tu moto.", icon: "messageCircle", sort_order: 5 },
  { id: "fb6", title: "Entrega a Tiempo", description: "Cumplimos con los tiempos acordados para que vuelvas a rodar lo antes posible.", icon: "clock", sort_order: 6 },
];

export const formatPrice = (p: number) => "$" + p.toLocaleString();
