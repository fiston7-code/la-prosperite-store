export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      products: {
        Row: {
          id: string
          name: string
          description: string | null
          price: number
          category: 'smartphones' | 'laptops' | 'accessories' | 'tablets'
          brand: string | null
          specifications: Json | null
          image_url: string | null
          stock_quantity: number
          stock_threshold: number
          is_available: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['products']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['products']['Insert']>
      }
      customers: {
        Row: {
          id: string
          customer_type: 'individual' | 'business'
          company_name: string | null
          company_siret: string | null
          phone: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['customers']['Row'], 'created_at'>
        Update: Partial<Database['public']['Tables']['customers']['Insert']>
      }
      addresses: {
        Row: {
          id: string
          customer_id: string
          full_name: string
          phone: string
          address_line1: string
          address_line2: string | null
          city: string
          postal_code: string
          country: string
          is_default: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['addresses']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['addresses']['Insert']>
      }
      orders: {
        Row: {
          id: string
          order_number: string
          customer_id: string
          address_id: string
          status: 'pending' | 'confirmed' | 'preparing' | 'shipped' | 'delivered' | 'cancelled'
          subtotal: number
          shipping_cost: number
          total: number
          payment_method: string
          delivery_type: 'standard' | 'express'
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['orders']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['orders']['Insert']>
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string
          product_name: string
          quantity: number
          unit_price: number
          total_price: number
        }
        Insert: Omit<Database['public']['Tables']['order_items']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['order_items']['Insert']>
      }
    }
  }
}