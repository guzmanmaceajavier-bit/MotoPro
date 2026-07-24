import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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
  social_facebook: string;
  social_instagram: string;
  social_whatsapp: string;
  [key: string]: string;
}

interface CMSContextType {
  sections: HomepageSection[];
  navbar: NavbarItem[];
  footer: FooterColumn[];
  config: SiteConfig;
  loading: boolean;
  getSection: (key: string) => HomepageSection | undefined;
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
  social_facebook: '#',
  social_instagram: '#',
  social_whatsapp: '525551234567',
};

const CMSContext = createContext<CMSContextType>({
  sections: [], navbar: [], footer: [], config: defaultConfig, loading: true,
  getSection: () => undefined,
});

export function CMSProvider({ children }: { children: ReactNode }) {
  const [sections, setSections] = useState<HomepageSection[]>([]);
  const [navbar, setNavbar] = useState<NavbarItem[]>([]);
  const [footer, setFooter] = useState<FooterColumn[]>([]);
  const [config, setConfig] = useState<SiteConfig>(defaultConfig);
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
    ]).finally(() => setLoading(false));
  }, [loadAttempted]);

  const getSection = (key: string) => sections.find(s => s.section_key === key && s.is_visible !== 0);

  return (
    <CMSContext.Provider value={{ sections, navbar, footer, config, loading, getSection }}>
      {children}
    </CMSContext.Provider>
  );
}

export function useCMS() {
  return useContext(CMSContext);
}
