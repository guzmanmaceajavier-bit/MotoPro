import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { api } from '@/api/client';

interface HomepageSection {
  section_key: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  button_text: string;
  button_link: string;
  is_visible: number;
  sort_order: number;
  settings_json: string;
}

interface NavbarItem {
  id: string;
  label: string;
  link: string;
  icon: string;
  sort_order: number;
  is_visible: number;
}

interface FooterColumn {
  column_number: number;
  section_title: string;
  items_json: string;
}

interface SiteConfig {
  site_name: string;
  site_description: string;
  site_slogan: string;
  site_logo: string;
  site_email: string;
  site_phone: string;
  site_address: string;
  site_hours: string;
  site_accent: string;
  site_url: string;
  site_og_image: string;
  site_city: string;
  site_schema_hours: string;
  site_price_range: string;
  site_social_links: string;
  social_facebook: string;
  social_instagram: string;
  social_whatsapp: string;
  [key: string]: string;
}

interface Brand { id: string; name: string; image?: string; vehicle_count?: number; [key: string]: any; }
interface Category { id: string; name: string; slug: string; image?: string; [key: string]: any; }
interface ServiceItem { id: string; title: string; name: string; description: string; icon: string; [key: string]: any; }
interface Testimonial { id: string; name: string; content: string; rating: number; [key: string]: any; }
interface HeroSlide { id: string; image: string; title: string; subtitle: string; description: string; cta_text: string; cta_link: string; is_active: number; [key: string]: any; }
interface ValueItem { id: string; title: string; description: string; icon: string; [key: string]: any; }
interface FAQItem { id: string; question: string; answer: string; is_active?: number; [key: string]: any; }
interface TeamMember { id: string; name: string; role: string; image?: string; [key: string]: any; }
interface GalleryImage { id: string; label: string; image: string; size?: string; category?: string; [key: string]: any; }
interface BeforeAfterItem { id: string; title: string; before_image: string; after_image: string; [key: string]: any; }
interface OfferSlide { id: string; title: string; image: string; link?: string; is_active?: number; [key: string]: any; }
interface TrustItem { id: string; title: string; description: string; icon: string; page?: string; [key: string]: any; }
interface BlogCategory { id: string; name: string; slug: string; [key: string]: any; }
interface BlogPost { id: string; title: string; slug: string; excerpt: string; image: string; [key: string]: any; }

interface CMSContextType {
  sections: HomepageSection[];
  navbar: NavbarItem[];
  footer: FooterColumn[];
  config: SiteConfig;
  loading: boolean;
  brands: Brand[];
  categories: Category[];
  services: ServiceItem[];
  testimonials: Testimonial[];
  heroSlides: HeroSlide[];
  values: ValueItem[];
  faqs: FAQItem[];
  team: TeamMember[];
  gallery: GalleryImage[];
  beforeAfter: BeforeAfterItem[];
  offers: OfferSlide[];
  trustItems: TrustItem[];
  blogCategories: BlogCategory[];
  blogPosts: BlogPost[];
  getSection: (key: string) => HomepageSection | undefined;
  getTrustItemsByPage: (page: string) => TrustItem[];
}

const defaultConfig: SiteConfig = {
  site_name: 'MotoPro Taller',
  site_description: 'Taller especializado en motocicletas',
  site_slogan: 'Tu moto en las mejores manos',
  site_logo: '',
  site_email: 'info@motopro.com',
  site_phone: '+52 555 123 4567',
  site_address: 'Av. Revolución 1234, CDMX',
  site_hours: 'Lun - Vie: 8:00 - 18:00',
  site_accent: '#0D9488',
  site_url: 'https://tallermotos.com',
  site_og_image: '',
  site_city: 'Bogotá',
  site_schema_hours: '',
  site_price_range: '$$',
  site_social_links: '',
  social_facebook: '#',
  social_instagram: '#',
  social_whatsapp: '525551234567',
};

const initialContext = {
  sections: [], navbar: [], footer: [], config: defaultConfig, loading: true,
  brands: [], categories: [], services: [], testimonials: [], heroSlides: [], values: [], faqs: [],
  team: [], gallery: [], beforeAfter: [], offers: [], trustItems: [], blogCategories: [], blogPosts: [],
  getSection: () => undefined as HomepageSection | undefined,
  getTrustItemsByPage: () => [] as TrustItem[],
};

const CMSContext = createContext<CMSContextType>(initialContext as CMSContextType);

export function CMSProvider({ children }: { children: ReactNode }) {
  const [sections, setSections] = useState<HomepageSection[]>([]);
  const [navbar, setNavbar] = useState<NavbarItem[]>([]);
  const [footer, setFooter] = useState<FooterColumn[]>([]);
  const [config, setConfig] = useState<SiteConfig>(defaultConfig);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
  const [values, setValues] = useState<ValueItem[]>([]);
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [gallery, setGallery] = useState<GalleryImage[]>([]);
  const [beforeAfter, setBeforeAfter] = useState<BeforeAfterItem[]>([]);
  const [offers, setOffers] = useState<OfferSlide[]>([]);
  const [trustItems, setTrustItems] = useState<TrustItem[]>([]);
  const [blogCategories, setBlogCategories] = useState<BlogCategory[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadAttempted, setLoadAttempted] = useState(false);

  useEffect(() => {
    if (loadAttempted) return;
    setLoadAttempted(true);
    Promise.allSettled([
      api.get('/cms/homepage').then(r => { if (Array.isArray(r)) setSections(r); }).catch(() => {}),
      api.get('/cms/navbar').then(r => { if (Array.isArray(r)) setNavbar(r); }).catch(() => {}),
      api.get('/cms/footer').then(r => { if (Array.isArray(r)) setFooter(r); }).catch(() => {}),
      api.get('/config').then(r => { if (r) setConfig(prev => ({ ...prev, ...r })); }).catch(() => {}),
      api.get('/brands').then(r => { if (Array.isArray(r)) setBrands(r); }).catch(() => {}),
      api.get('/categories').then(r => { if (Array.isArray(r)) setCategories(r); }).catch(() => {}),
      api.get('/services').then(r => { if (Array.isArray(r)) setServices(r); }).catch(() => {}),
      api.get('/testimonials').then(r => { if (Array.isArray(r)) setTestimonials(r); }).catch(() => {}),
      api.get('/hero').then(r => { if (Array.isArray(r)) setHeroSlides(r.filter((h: any) => h.is_active !== 0)); }).catch(() => {}),
      api.get('/values').then(r => { if (Array.isArray(r)) setValues(r); }).catch(() => {}),
      api.get('/faqs').then(r => { if (Array.isArray(r)) setFaqs(r.filter((f: any) => f.is_active !== false)); }).catch(() => {}),
      api.get('/team').then(r => { if (Array.isArray(r)) setTeam(r); }).catch(() => {}),
      api.get('/gallery').then(r => { if (Array.isArray(r)) setGallery(r); }).catch(() => {}),
      api.get('/before-after').then(r => { if (Array.isArray(r)) setBeforeAfter(r); }).catch(() => {}),
      api.get('/offers').then(r => { if (Array.isArray(r)) setOffers(r); }).catch(() => {}),
      api.get('/trust-items').then(r => { if (Array.isArray(r)) setTrustItems(r); }).catch(() => {}),
      api.get('/blog-categories').then(r => { if (Array.isArray(r)) setBlogCategories(r); }).catch(() => {}),
      api.get('/blog').then(r => { if (Array.isArray(r)) setBlogPosts(r); }).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, [loadAttempted]);

  const getSection = useCallback((key: string) => sections.find(s => s.section_key === key && s.is_visible !== 0), [sections]);
  const getTrustItemsByPage = useCallback((page: string) => trustItems.filter(t => !t.page || t.page === page), [trustItems]);

  return (
    <CMSContext.Provider value={{
      sections, navbar, footer, config, loading,
      brands, categories, services, testimonials, heroSlides, values, faqs,
      team, gallery, beforeAfter, offers, trustItems, blogCategories, blogPosts,
      getSection, getTrustItemsByPage,
    }}>
      {children}
    </CMSContext.Provider>
  );
}

export function useCMS() { return useContext(CMSContext); }
export function useBrands() { const { brands, loading } = useContext(CMSContext); return { brands, loading }; }
export function useCategories() { const { categories, loading } = useContext(CMSContext); return { categories, loading }; }
export function useServices() { const { services, loading } = useContext(CMSContext); return { services, loading }; }
export function useTestimonials() { const { testimonials, loading } = useContext(CMSContext); return { testimonials, loading }; }
export function useCMSHeroSlides() { const { heroSlides, loading } = useContext(CMSContext); return { heroSlides, loading }; }
export function useValues() { const { values, loading } = useContext(CMSContext); return { values, loading }; }
export function useConfig() { const { config } = useContext(CMSContext); return config; }
export function useTeam() { const { team, loading } = useContext(CMSContext); return { team, loading }; }
export function useGallery() { const { gallery, loading } = useContext(CMSContext); return { gallery, loading }; }
export function useBeforeAfter() { const { beforeAfter, loading } = useContext(CMSContext); return { beforeAfter, loading }; }
export function useOffers() { const { offers, loading } = useContext(CMSContext); return { offers, loading }; }
