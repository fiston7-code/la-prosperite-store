'use client';

import { useCartStore } from '@/lib/store/cartStore';
import { ShoppingCart } from 'lucide-react';
import { useState, useEffect } from 'react';

interface AddToCartButtonProps {
  product: {
    id: string;
    name: string;
    price: number;
    image_url: string;
    stock_quantity: number;
  };
}

export default function AddToCartButton({ product }: AddToCartButtonProps) {
  const { addItem, getItem, error, clearError } = useCartStore();
  const [isAdding, setIsAdding] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const cartItem = getItem(product.id);

  // ✅ Effacer l'erreur après 3 secondes
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => clearError(), 3000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  const handleAddToCart = async () => {
    setIsAdding(true);
    clearError();

    const success = await addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image_url,
      maxStock: product.stock_quantity,
    });

    if (success) {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    }

    setIsAdding(false);
  };

  const isOutOfStock = product.stock_quantity === 0;
  const isMaxReached = cartItem && cartItem.quantity >= product.stock_quantity;

  return (
    <div className="space-y-2">
      <button
        onClick={handleAddToCart}
        disabled={isAdding || isOutOfStock || isMaxReached}
        className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
          showSuccess
            ? 'bg-green-600 text-white'
            : 'bg-purple-600 text-white hover:bg-purple-700'
        }`}
      >
        <ShoppingCart className="w-5 h-5" />
        {isAdding
          ? 'Ajout...'
          : showSuccess
          ? '✓ Ajouté !'
          : isOutOfStock
          ? 'Rupture de stock'
          : isMaxReached
          ? 'Maximum atteint'
          : 'Ajouter au panier'}
      </button>

      {/* ✅ Affichage de l'erreur */}
      {error && (
        <p className="text-red-600 text-sm text-center animate-pulse">{error}</p>
      )}
    </div>
  );
}