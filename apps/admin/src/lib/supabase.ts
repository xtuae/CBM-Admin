import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl) {
  throw new Error('Missing VITE_SUPABASE_URL environment variable')
}

if (!supabaseAnonKey) {
  throw new Error('Missing VITE_SUPABASE_ANON_KEY environment variable')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Stub for service role client - DO NOT place service key here
export function getServiceRoleClient() {
  throw new Error('Service role client not available in client-side code')
}

// Database types
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          role: 'user' | 'admin'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          role?: 'user' | 'admin'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          role?: 'user' | 'admin'
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          icon_url: string | null
          is_active: boolean
          seo_title: string | null
          seo_description: string | null
          seo_keywords: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          icon_url?: string | null
          is_active?: boolean
          seo_title?: string | null
          seo_description?: string | null
          seo_keywords?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          icon_url?: string | null
          is_active?: boolean
          seo_title?: string | null
          seo_description?: string | null
          seo_keywords?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
      credit_packs: {
        Row: {
          id: string
          name: string
          slug: string | null
          short_description: string | null
          long_description_html: string | null
          credit_amount: number
          price_usd: number
          price_fiat: number | null
          currency: string
          rate_per_credit: number
          is_active: boolean
          is_featured: boolean
          featured_image_url: string | null
          gallery_urls: string[] | null
          seo_title: string | null
          seo_description: string | null
          seo_keywords: string[] | null
          category_ids: string[] | null
          nila_equivalent: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug?: string | null
          short_description?: string | null
          long_description_html?: string | null
          credit_amount: number
          price_usd: number
          price_fiat?: number | null
          currency?: string
          rate_per_credit?: number
          is_active?: boolean
          is_featured?: boolean
          featured_image_url?: string | null
          gallery_urls?: string[] | null
          seo_title?: string | null
          seo_description?: string | null
          seo_keywords?: string[] | null
          category_ids?: string[] | null
          nila_equivalent?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string | null
          short_description?: string | null
          long_description_html?: string | null
          credit_amount?: number
          price_usd?: number
          price_fiat?: number | null
          currency?: string
          rate_per_credit?: number
          is_active?: boolean
          is_featured?: boolean
          featured_image_url?: string | null
          gallery_urls?: string[] | null
          seo_title?: string | null
          seo_description?: string | null
          seo_keywords?: string[] | null
          category_ids?: string[] | null
          nila_equivalent?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      admin_activity_log: {
        Row: {
          id: string
          admin_id: string
          action: string
          source: string
          meta: Record<string, any> | null
          created_at: string
        }
        Insert: {
          id?: string
          admin_id: string
          action: string
          source: string
          meta?: Record<string, any> | null
          created_at?: string
        }
        Update: {
          id?: string
          admin_id?: string
          action?: string
          source?: string
          meta?: Record<string, any> | null
          created_at?: string
        }
      }
    }
  }
}