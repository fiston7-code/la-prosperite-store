// lib/supabase/queries.ts
import { supabase } from './client';

// ==================== PRODUCTS ====================

export const getAllProducts = async (filters?: {
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
}) => {
  try {
    let query = supabase
      .from('products')
      .select('*')
      .eq('is_active', true);

    if (filters?.category && filters.category !== 'all') {
      query = query.eq('category', filters.category);
    }

    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    if (filters?.minPrice) {
      query = query.gte('price', filters.minPrice);
    }

    if (filters?.maxPrice) {
      query = query.lte('price', filters.maxPrice);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) throw error;
    return { products: data, error: null };
  } catch (error: any) {
    console.error('Erreur getAllProducts:', error);
    return { products: null, error: error.message };
  }
};

export const getProductById = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return { product: data, error: null };
  } catch (error: any) {
    console.error('Erreur getProductById:', error);
    return { product: null, error: error.message };
  }
};

export const getProductsByCategory = async (category: string) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('category', category)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { products: data, error: null };
  } catch (error: any) {
    console.error('Erreur getProductsByCategory:', error);
    return { products: null, error: error.message };
  }
};

// ==================== CATEGORIES ====================

export const getAllCategories = async () => {
  try {
    const { data: products, error } = await supabase
      .from('products')
      .select('category')
      .eq('is_active', true);

    if (error) throw error;

    // Extraire catégories uniques
    const categories = [...new Set(products.map(p => p.category))].filter(Boolean);

    // Compter produits par catégorie
    const categoriesWithCount = await Promise.all(
      categories.map(async (category) => {
        const { count } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true })
          .eq('category', category)
          .eq('is_active', true);

        return {
          name: category,
          slug: category.toLowerCase().replace(/\s+/g, '-'),
          count: count || 0
        };
      })
    );

    return { categories: categoriesWithCount, error: null };
  } catch (error: any) {
    console.error('Erreur getAllCategories:', error);
    return { categories: null, error: error.message };
  }
};

// ==================== ORDERS ====================

export const createOrder = async (orderData: {
  items: Array<{ id: string; quantity: number; price: number }>;
  total: number;
  userId?: string;
}) => {
  try {
    const { items, total, userId } = orderData;

    // Créer la commande
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([{
        user_id: userId || null,
        total: parseFloat(total.toString()),
        status: 'pending'
      }])
      .select()
      .single();

    if (orderError) throw orderError;

    // Créer les items de commande
    const orderItems = items.map((item) => ({
      order_id: order.id,
      product_id: item.id,
      quantity: item.quantity,
      price: item.price
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      // Rollback la commande
      await supabase.from('orders').delete().eq('id', order.id);
      throw itemsError;
    }

    // Mettre à jour le stock
    for (const item of items) {
      const { data: product } = await supabase
        .from('products')
        .select('stock')
        .eq('id', item.id)
        .single();

      if (product && product.stock >= item.quantity) {
        await supabase
          .from('products')
          .update({ stock: product.stock - item.quantity })
          .eq('id', item.id);
      }
    }

    return { order, error: null };
  } catch (error: any) {
    console.error('Erreur createOrder:', error);
    return { order: null, error: error.message };
  }
};

export const getOrderById = async (orderId: string) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          products (*)
        )
      `)
      .eq('id', orderId)
      .single();

    if (error) throw error;
    return { order: data, error: null };
  } catch (error: any) {
    console.error('Erreur getOrderById:', error);
    return { order: null, error: error.message };
  }
};

export const getUserOrders = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          products (*)
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { orders: data, error: null };
  } catch (error: any) {
    console.error('Erreur getUserOrders:', error);
    return { orders: null, error: error.message };
  }
};