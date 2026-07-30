export interface HeroSlide {
  image: string;
  title: string;
  subtitle: string;
  description: string;
  cta_text: string;
  cta_link: string;
}

export interface HeroStats {
  products: number;
  brands: number;
  reviews: number;
  testimonials: number;
}

export interface Brand {
  id: string;
  name: string;
  image: string;
  vehicle_count: number;
}

export interface FeaturedProduct {
  id: string;
  name: string;
  price: number;
  image: string;
  categoryName: string;
  is_active: number;
}

export interface ValueItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  image?: string;
  sort_order: number;
}
