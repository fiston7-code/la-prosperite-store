'use client';

import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { useCartStore } from '@/lib/store/cartStore';
import { useEffect, useState } from 'react';

export default function CartButton() {
  const { totalItems } = useCartStore();
  const [isClient, setIsClient] = useState(false);

  // ✅ S'exécute uniquement côté client après l'hydratation
  useEffect(() => {
    setIsClient(true);
  }, []);

  const itemCount = isClient ? totalItems() : 0;

  return (
    <Link
      href="/cart"
      className="relative p-2 hover:bg-muted rounded-full transition-colors group"
    >
      <ShoppingCart className="w-5 h-5 text-foreground group-hover:text-primary transition-colors" />
      
      {/* Badge du nombre d'articles - Affiché uniquement après hydratation */}
      {itemCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-purple-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg animate-in zoom-in-50 duration-200">
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      )}
    </Link>
  );
}