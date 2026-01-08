// services/products.ts
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database'

type Product = Database['public']['Tables']['products']['Row']
type ProductInsert = Database['public']['Tables']['products']['Insert']

interface ProductFilters {
  category?: string
  minPrice?: number
  maxPrice?: number
  search?: string
  sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'popular'
  limit?: number
  offset?: number
}

export const productService = {
  async getAll(filters: ProductFilters = {}) {
    const supabase = createClient()
    let query = supabase
      .from('products')
      .select('*, categories(name, slug)', { count: 'exact' })
      .eq('is_active', true)

    if (filters.category) {
      query = query.eq('category_slug', filters.category)
    }

    if (filters.minPrice) {
      query = query.gte('price', filters.minPrice)
    }

    if (filters.maxPrice) {
      query = query.lte('price', filters.maxPrice)
    }

    if (filters.search) {
      query = query.ilike('name', `%${filters.search}%`)
    }

    // Tri
    switch (filters.sortBy) {
      case 'price_asc':
        query = query.order('price', { ascending: true })
        break
      case 'price_desc':
        query = query.order('price', { ascending: false })
        break
      case 'newest':
        query = query.order('created_at', { ascending: false })
        break
      case 'popular':
        query = query.order('sales_count', { ascending: false })
        break
      default:
        query = query.order('created_at', { ascending: false })
    }

    // Pagination
    const limit = filters.limit || 12
    const offset = filters.offset || 0
    query = query.range(offset, offset + limit - 1)

    const { data, error, count } = await query

    if (error) throw error

    return { products: data, total: count }
  },

  async getById(id: string) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('products')
      .select('*, categories(name, slug), product_images(*), product_variants(*)')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  async getBySlug(slug: string) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('products')
      .select('*, categories(name, slug), product_images(*), product_variants(*)')
      .eq('slug', slug)
      .single()

    if (error) throw error
    return data
  },
}