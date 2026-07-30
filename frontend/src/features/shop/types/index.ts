export interface Product {
  id: string;
  name: string;
  category: string;
  category_id?: string;
  brand: string;
  sku?: string;
  price: number;
  compare_price?: number;
  image: string;
  images?: string[];
  slug: string;
  stock?: number;
  rating?: number;
  review_count?: number;
  warranty?: string;
  quality_label?: string;
  compatibility_text?: string;
  vehicle_brand?: string;
  vehicle_model?: string;
  quantity?: number;
  compatible_with?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
  icon?: string;
  sort_order: number;
}

export interface MotoBrand {
  name: string;
  models: string[];
}
