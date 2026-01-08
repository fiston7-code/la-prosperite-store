'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft, AlertCircle, RefreshCw } from 'lucide-react';
import { useCartStore } from '@/lib/store/cartStore';
import { useState, useEffect } from 'react';

export default function CartPage() {
  const { 
    items, 
    removeItem, 
    incrementQuantity,
    decrementQuantity,
    clearCart, 
    totalPrice, 
    totalItems,
    refreshStock
  } = useCartStore();

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // ✅ RAFRAÎCHIR LE STOCK AU CHARGEMENT ET QUAND LES ITEMS CHANGENT
  useEffect(() => {
    const loadStock = async () => {
      if (items.length > 0) {
        setIsRefreshing(true);
        try {
          await refreshStock();
        } catch (error) {
          console.error('Erreur lors du rafraîchissement du stock:', error);
        } finally {
          setIsRefreshing(false);
          setIsInitialLoad(false);
        }
      } else {
        setIsInitialLoad(false);
      }
    };
    
    // ✅ Petit délai pour laisser le temps au store de se hydrater
    const timer = setTimeout(() => {
      loadStock();
    }, 100);

    return () => clearTimeout(timer);
  }, [items.length]); // ✅ Se déclenche quand le nombre d'items change

  // ✅ GESTION DE L'INCRÉMENTATION AVEC FEEDBACK
  const handleIncrement = async (id: string, name: string, currentQuantity: number, maxStock: number) => {
    if (currentQuantity >= maxStock) {
      setErrors({ ...errors, [id]: `Stock maximum atteint (${maxStock} unités disponibles)` });
      setTimeout(() => {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[id];
          return newErrors;
        });
      }, 3000);
      return;
    }
    
    await incrementQuantity(id);
  };

  // ✅ RAFRAÎCHISSEMENT MANUEL
  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshStock();
    } catch (error) {
      console.error('Erreur lors du rafraîchissement manuel:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // ✅ LOADING STATE (seulement au premier chargement)
  if (isInitialLoad && items.length > 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-lg text-gray-600">Chargement du panier...</p>
        </div>
      </div>
    );
  }

  // ✅ PANIER VIDE
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="bg-white rounded-2xl shadow-xl p-12 border border-gray-100">
            <div className="inline-flex items-center justify-center w-32 h-32 bg-purple-100 rounded-full mb-6">
              <ShoppingBag className="w-16 h-16 text-purple-600" />
            </div>
            
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Votre panier est vide
            </h1>
            
            <p className="text-lg text-gray-600 mb-8">
              Découvrez nos produits exceptionnels et commencez vos achats !
            </p>
            
            <Link
              href="/boutique"
              className="inline-flex items-center gap-3 px-8 py-4 bg-purple-600 text-white rounded-xl font-bold text-lg hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 shadow-lg"
            >
              <ShoppingBag className="w-6 h-6" />
              Découvrir la boutique
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* EN-TÊTE */}
        <div className="mb-8">
          <Link
            href="/boutique"
            className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 font-semibold mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Continuer mes achats
          </Link>
          
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Mon panier
              </h1>
              <p className="text-gray-600">
                {totalItems()} {totalItems() > 1 ? 'articles' : 'article'}
              </p>
            </div>

            {/* BOUTON RAFRAÎCHIR */}
            <button
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-4 py-2 border-2 border-purple-200 text-purple-600 rounded-lg font-semibold hover:bg-purple-50 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Actualisation...' : 'Actualiser le stock'}
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* LISTE DES PRODUITS */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => {
              const stockPercentage = item.maxStock > 0 ? (item.quantity / item.maxStock) * 100 : 100;
              const isLowStock = stockPercentage >= 70 && item.maxStock > 0;
              const isOutOfStock = item.maxStock === 0;

              return (
                <div 
                  key={item.id} 
                  className={`bg-white rounded-xl shadow-md p-6 border-2 transition-all ${
                    isOutOfStock ? 'border-red-200 bg-red-50' : 'border-transparent hover:shadow-lg'
                  }`}
                >
                  {/* MESSAGE D'ERREUR */}
                  {errors[item.id] && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 animate-pulse">
                      <AlertCircle className="w-5 h-5 flex-shrink-0" />
                      <span className="text-sm font-medium">{errors[item.id]}</span>
                    </div>
                  )}

                  {/* ALERTE RUPTURE DE STOCK */}
                  {isOutOfStock && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-lg flex items-center gap-2 text-red-800">
                      <AlertCircle className="w-5 h-5 flex-shrink-0" />
                      <span className="text-sm font-bold">Ce produit n&apos;est plus disponible</span>
                    </div>
                  )}

                  <div className="flex gap-6 items-center flex-wrap">
                    {/* IMAGE */}
                    <div className="relative w-28 h-28 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100 border-2 border-gray-200">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center w-full h-full text-gray-400">
                          <ShoppingBag className="w-10 h-10" />
                        </div>
                      )}
                    </div>

                    {/* DÉTAILS PRODUIT */}
                    <div className="flex-1 min-w-[200px]">
                      <h3 className="font-bold text-xl text-gray-900 mb-2">
                        {item.name}
                      </h3>
                      <p className="text-purple-600 font-bold text-2xl mb-2">
                        {item.price.toLocaleString('fr-FR', {
                          style: 'currency',
                          currency: 'EUR',
                        })}
                      </p>
                      
                      {/* INDICATEUR DE STOCK */}
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-medium ${
                          isOutOfStock 
                            ? 'text-red-600' 
                            : isLowStock 
                            ? 'text-orange-600' 
                            : 'text-green-600'
                        }`}>
                          {isOutOfStock 
                            ? '❌ Rupture de stock' 
                            : `✓ ${item.maxStock} unités disponibles`
                          }
                        </span>
                      </div>
                    </div>

                    {/* CONTRÔLES QUANTITÉ */}
                    <div className="flex flex-col items-center gap-3">
                      <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-2 border-2 border-gray-200">
                        <button
                          onClick={() => decrementQuantity(item.id)}
                          disabled={isOutOfStock}
                          className="p-2 rounded-lg bg-white border-2 border-gray-300 hover:border-purple-600 hover:text-purple-600 transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <Minus className="w-5 h-5" />
                        </button>
                        
                        <span className="font-bold text-xl w-14 text-center">
                          {item.quantity}
                        </span>
                        
                        <button
                          onClick={() => handleIncrement(item.id, item.name, item.quantity, item.maxStock)}
                          disabled={item.quantity >= item.maxStock || isOutOfStock}
                          className="p-2 rounded-lg bg-white border-2 border-gray-300 hover:border-purple-600 hover:text-purple-600 transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                      </div>
                      
                      {/* BARRE DE PROGRESSION */}
                      {item.maxStock > 0 && (
                        <div className="w-full">
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className={`h-full transition-all duration-500 ${
                                isOutOfStock
                                  ? 'bg-red-500' 
                                  : stockPercentage >= 90 
                                  ? 'bg-red-500' 
                                  : stockPercentage >= 70 
                                  ? 'bg-orange-500' 
                                  : 'bg-green-500'
                              }`}
                              style={{ width: `${Math.min(stockPercentage, 100)}%` }}
                            />
                          </div>
                          <p className="text-xs text-gray-500 text-center mt-1">
                            {Math.round(stockPercentage)}% utilisé
                          </p>
                        </div>
                      )}
                    </div>

                    {/* PRIX TOTAL */}
                    <div className="text-right min-w-[120px]">
                      <p className="text-sm text-gray-500 mb-1">Total</p>
                      <p className="font-bold text-2xl text-gray-900">
                        {(item.price * item.quantity).toLocaleString('fr-FR', {
                          style: 'currency',
                          currency: 'EUR',
                        })}
                      </p>
                    </div>

                    {/* BOUTON SUPPRIMER */}
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-3 text-red-600 hover:bg-red-50 rounded-xl transition-all hover:scale-110 border-2 border-transparent hover:border-red-200"
                      title="Supprimer du panier"
                    >
                      <Trash2 className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              );
            })}

            {/* BOUTON VIDER LE PANIER */}
            <button
              onClick={clearCart}
              className="w-full mt-6 px-6 py-4 border-2 border-red-600 text-red-600 rounded-xl font-bold text-lg hover:bg-red-50 transition-all transform hover:scale-[1.02]"
            >
              <div className="flex items-center justify-center gap-2">
                <Trash2 className="w-5 h-5" />
                Vider le panier
              </div>
            </button>
          </div>

          {/* RÉSUMÉ DE LA COMMANDE */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-8 sticky top-24 border-2 border-purple-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <ShoppingBag className="w-6 h-6 text-purple-600" />
                Résumé
              </h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span className="font-medium">Sous-total</span>
                  <span className="font-bold text-gray-900">
                    {totalPrice().toLocaleString('fr-FR', {
                      style: 'currency',
                      currency: 'EUR',
                    })}
                  </span>
                </div>
                
                <div className="flex justify-between text-gray-600">
                  <span className="font-medium">Livraison</span>
                  <span className="font-bold text-green-600">Gratuite</span>
                </div>

                <div className="flex justify-between text-gray-600">
                  <span className="font-medium">TVA (20%)</span>
                  <span className="font-bold text-gray-900">
                    {(totalPrice() * 0.2).toLocaleString('fr-FR', {
                      style: 'currency',
                      currency: 'EUR',
                    })}
                  </span>
                </div>
                
                <div className="border-t-2 border-gray-200 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold text-gray-900">Total</span>
                    <span className="text-3xl font-bold text-purple-600">
                      {(totalPrice() * 1.2).toLocaleString('fr-FR', {
                        style: 'currency',
                        currency: 'EUR',
                      })}
                    </span>
                  </div>
                </div>
              </div>

              <Link
                href="/checkout"
                className="block w-full px-6 py-4 bg-purple-600  text-white text-center rounded-xl font-bold text-lg hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 shadow-lg mb-4"
              >
                Passer commande
              </Link>

              <div className="flex items-center justify-center gap-2 text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
                <span className="text-2xl">🔒</span>
                <span className="font-medium">Paiement 100% sécurisé</span>
              </div>

              {/* INFORMATIONS SUPPLÉMENTAIRES */}
              <div className="mt-6 pt-6 border-t border-gray-200 space-y-3 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Livraison gratuite</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Retour sous 14 jours</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Garantie 2 ans</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}