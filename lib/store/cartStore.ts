// lib/store/cartStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  maxStock: number;
}

interface CartStore {
  items: CartItem[];
  error: string | null; // ✅ Gestion des erreurs sans alert
  addItem: (item: Omit<CartItem, 'quantity'>) => Promise<boolean>;
  removeItem: (id: string) => void;
  incrementQuantity: (id: string) => Promise<boolean>;
  decrementQuantity: (id: string) => void;
  clearCart: () => void;
  totalPrice: () => number;
  totalItems: () => number;
  getItem: (id: string) => CartItem | undefined;
  refreshStock: () => Promise<void>;
  clearError: () => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      error: null,

      clearError: () => set({ error: null }),

      // ✅ Ajouter un produit (retourne true si succès, false sinon)
      addItem: async (newItem) => {
        try {
          const { data: product, error } = await supabase
            .from('products')
            .select('stock_quantity')
            .eq('id', newItem.id)
            .single();

            console.log('📦 Résultat:', { product, error });

    if (error) {
      console.error('❌ Erreur Supabase:', error.message, error.code);
      set({ error: `Erreur: ${error.message}` });
      return false;
    }

          if (error || !product) {
            set({ error: 'Erreur lors de la vérification du stock' });
            return false;
          }

          if (product.stock_quantity === 0) {
            set({ error: 'Ce produit n\'est plus disponible' });
            return false;
          }

          const { items } = get();
          const existingItem = items.find((item) => item.id === newItem.id);

          if (existingItem) {
            if (existingItem.quantity >= product.stock_quantity) {
              set({ error: `Stock maximum atteint (${product.stock_quantity} unités)` });
              return false;
            }

            set({
              items: items.map((item) =>
                item.id === newItem.id
                  ? { ...item, quantity: item.quantity + 1, maxStock: product.stock_quantity }
                  : item
              ),
              error: null,
            });
          } else {
            set({
              items: [...items, { ...newItem, quantity: 1, maxStock: product.stock_quantity }],
              error: null,
            });
          }

          return true;
        } catch (err) {
          console.error('Erreur addItem:', err);
          set({ error: 'Une erreur est survenue' });
          return false;
        }
      },

      // ✅ Incrémenter (retourne true si succès)
      incrementQuantity: async (id) => {
        try {
          const { data: product } = await supabase
            .from('products')
            .select('stock_quantity')
            .eq('id', id)
            .single();

          if (!product) {
            set({ error: 'Produit introuvable' });
            return false;
          }

          const { items } = get();
          const item = items.find((i) => i.id === id);

          if (item && item.quantity >= product.stock_quantity) {
            set({ error: `Stock maximum atteint (${product.stock_quantity} unités)` });
            return false;
          }

          set({
            items: items.map((item) =>
              item.id === id
                ? { ...item, quantity: item.quantity + 1, maxStock: product.stock_quantity }
                : item
            ),
            error: null,
          });

          return true;
        } catch (err) {
          console.error('Erreur incrementQuantity:', err);
          return false;
        }
      },

      decrementQuantity: (id) =>
        set((state) => ({
          items: state.items
            .map((item) =>
              item.id === id ? { ...item, quantity: item.quantity - 1 } : item
            )
            .filter((item) => item.quantity > 0),
        })),

      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        })),

      clearCart: () => set({ items: [], error: null }),

      totalPrice: () => {
        const { items } = get();
        return items.reduce((total, item) => total + item.price * item.quantity, 0);
      },

      totalItems: () => {
        const { items } = get();
        return items.reduce((total, item) => total + item.quantity, 0);
      },

      getItem: (id) => {
        const { items } = get();
        return items.find((item) => item.id === id);
      },

      refreshStock: async () => {
        const { items } = get();

        if (items.length === 0) return;

        const productIds = items.map((item) => item.id);

        const { data: products } = await supabase
          .from('products')
          .select('id, stock_quantity')
          .in('id', productIds);

        if (!products) return;

        set({
          items: items
            .map((item) => {
              const updatedProduct = products.find((p) => p.id === item.id);
              if (updatedProduct) {
                return {
                  ...item,
                  maxStock: updatedProduct.stock_quantity,
                  quantity: Math.min(item.quantity, updatedProduct.stock_quantity),
                };
              }
              return item;
            })
            .filter((item) => item.maxStock > 0),
        });
      },
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({ items: state.items }), // ✅ Ne persiste que les items, pas l'erreur
    }
  )
);