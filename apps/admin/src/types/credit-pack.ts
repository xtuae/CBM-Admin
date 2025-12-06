export interface CreditPack {
  id?: string;
  name: string;
  slug?: string;
  short_description: string;
  long_description_html?: string;
  credit_amount: number;
  price_usd: number;
  price_fiat: number;
  currency: string;
  rate_per_credit: number;
  is_active: boolean;
  is_featured: boolean;
  featured_image_url?: string;
  gallery_urls?: string[];
  category_ids?: string[];
  nila_equivalent?: number;
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface CreditPackFormData {
  name: string;
  short_description: string;
  long_description_html: string;
  credit_amount: number;
  price_usd: number;
  rate_per_credit: number;
  is_active: boolean;
  is_featured: boolean;
  featured_image_url?: string;
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string;
}