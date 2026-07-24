export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface Brand {
  id: string;
  name: string;
  image?: string;
  models: string[];
  vehicle_count?: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
  subcategories?: Subcategory[];
}

export interface Subcategory {
  id: string;
  category_id: string;
  name: string;
  count: number;
  sort_order: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  category_id: string;
  subcategory_id?: string;
  brand_id?: string;
  category_name?: string;
  brand_name?: string;
  purchase_price: number;
  price: number;
  stock: number;
  description: string;
  image?: string;
  is_active: number;
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: string;
  title: string;
  slug: string;
  description: string;
  features: string[];
  icon: string;
  price?: number;
  duration?: string;
  is_active: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  image?: string;
  gradient: string;
  is_published: number;
  created_at: string;
  updated_at: string;
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  is_read: number;
  created_at: string;
}

export interface ServiceRequest {
  id: string;
  name: string;
  phone: string;
  email: string;
  brand_model: string;
  service_type: string;
  plate: string;
  description: string;
  status: string;
  total?: number;
  assigned_to?: string;
  created_at: string;
  updated_at: string;
}

export interface GalleryImage {
  id: string;
  label: string;
  image: string;
  size: string;
  sort_order: number;
  created_at: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  content: string;
  rating: number;
  image?: string;
  is_active: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  specialty: string;
  experience: string;
  description: string;
  image?: string;
  phone?: string;
  email?: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface CompanyValue {
  id: string;
  title: string;
  description: string;
  icon: string;
  image?: string;
  sort_order: number;
  is_active: number;
  created_at: string;
  updated_at: string;
}

export interface DashboardStats {
  products: number;
  services: number;
  orders: number;
  contacts: number;
  blog: number;
  gallery: number;
}

export interface MediaItem {
  id: string;
  name: string;
  url: string;
  cloudinary_id?: string;
  size: number;
  width: number;
  height: number;
  mime_type: string;
  folder: string;
  tags: string[];
  alt: string;
  usage_count: number;
  created_at: string;
  updated_at: string;
}

export interface MediaUsage {
  id: string;
  media_id: string;
  entity_type: string;
  entity_id: string;
  field_name: string;
}

export interface HomepageSection {
  id: string;
  section_key: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  button_text: string;
  button_link: string;
  sort_order: number;
  is_visible: number;
  settings_json: string;
  created_at: string;
  updated_at: string;
}

export interface NavbarItem {
  id: string;
  label: string;
  link: string;
  icon: string;
  sort_order: number;
  is_visible: number;
  is_mega_menu: number;
  parent_id: string;
  children?: NavbarItem[];
}

export interface FooterColumn {
  id: string;
  column_number: number;
  section_title: string;
  items_json: string;
  sort_order: number;
}

export interface SeoConfig {
  id: string;
  page: string;
  meta_title: string;
  meta_description: string;
  keywords: string;
  og_image: string;
  og_title: string;
  og_description: string;
  canonical_url: string;
  robots: string;
  schema_json: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  avatar?: string;
  total_orders: number;
  total_spent: number;
  created_at: string;
  updated_at: string;
}

export interface Vehicle {
  id: string;
  customer_id: string;
  customer_name?: string;
  brand: string;
  model: string;
  year: string;
  plate: string;
  vin: string;
  color: string;
  mileage: number;
  observations: string;
  created_at: string;
  updated_at: string;
}
