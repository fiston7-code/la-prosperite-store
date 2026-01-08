'use client';

import { useEffect, useState } from 'react';
import ProductCard from '../../components/ui/ProductCard';
import { SlidersHorizontal, X } from 'lucide-react';

// 🎯 TYPE du produit (correspondant exactement à Supabase)
type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url: string;
  stock_quantity: number;
  created_at: string;
};

// 🎯 FILTRES de prix
const PRICE_RANGES = [
  { label: 'Tous les prix', min: 0, max: Infinity },
  { label: 'Moins de 50€', min: 0, max: 50 },
  { label: '50€ - 100€', min: 50, max: 100 },
  { label: '100€ - 200€', min: 100, max: 200 },
  { label: 'Plus de 200€', min: 200, max: Infinity },
];

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>(['Tous']);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('Tous');
  const [selectedPriceRange, setSelectedPriceRange] = useState(PRICE_RANGES[0]);
  const [sortBy, setSortBy] = useState('default');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/products');
      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setProducts(data.products);

      const uniqueCategories = Array.from(
        new Set(data.products.map((p: Product) => p.category))
      );
      setCategories(['Tous', ...uniqueCategories]);

    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des produits');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // FILTRAGE et TRI
  let filteredProducts = products.filter((product) => {
    const categoryMatch = selectedCategory === 'Tous' || product.category === selectedCategory;
    const priceMatch = product.price >= selectedPriceRange.min && product.price <= selectedPriceRange.max;
    return categoryMatch && priceMatch;
  });

  if (sortBy === 'price-asc') {
    filteredProducts = [...filteredProducts].sort((a, b) => a.price - b.price);
  } else if (sortBy === 'price-desc') {
    filteredProducts = [...filteredProducts].sort((a, b) => b.price - a.price);
  } else if (sortBy === 'name') {
    filteredProducts = [...filteredProducts].sort((a, b) => a.name.localeCompare(b.name));
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold mb-2">🛍️ Boutique</h1>
          {loading ? (
            <p className="text-gray-600">Chargement des produits...</p>
          ) : error ? (
            <p className="text-red-600">❌ {error}</p>
          ) : (
            <p className="text-gray-600">
              {filteredProducts.length} produit{filteredProducts.length > 1 ? 's' : ''} disponible{filteredProducts.length > 1 ? 's' : ''}
            </p>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* FILTRES DESKTOP */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              <h2 className="text-lg font-bold mb-4">🔍 Filtres</h2>

              <div className="mb-6">
                <h3 className="font-semibold mb-3">Catégorie</h3>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`block w-full text-left px-3 py-2 rounded-lg transition-colors ${
                        selectedCategory === category
                          ? 'bg-purple-600 text-white'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">💰 Prix</h3>
                <div className="space-y-2">
                  {PRICE_RANGES.map((range) => (
                    <button
                      key={range.label}
                      onClick={() => setSelectedPriceRange(range)}
                      className={`block w-full text-left px-3 py-2 rounded-lg transition-colors ${
                        selectedPriceRange.label === range.label
                          ? 'bg-purple-600 text-white'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* PRODUITS */}
          <div className="flex-1">
            {/* Barre d'outils */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <button
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className="lg:hidden flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 w-full sm:w-auto justify-center"
              >
                <SlidersHorizontal className="h-5 w-5" />
                Filtres
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                  Trier par:
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="flex-1 sm:flex-initial px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                >
                  <option value="default">Par défaut</option>
                  <option value="name">Nom (A-Z)</option>
                  <option value="price-asc">Prix croissant ↑</option>
                  <option value="price-desc">Prix décroissant ↓</option>
                </select>
              </div>
            </div>

            {/* FILTRES MOBILE */}
            {showMobileFilters && (
              <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center justify-center p-4">
                <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-md max-h-[80vh] overflow-y-auto">
                  <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
                    <h2 className="text-lg font-bold">🔍 Filtres</h2>
                    <button onClick={() => setShowMobileFilters(false)}>
                      <X className="h-6 w-6" />
                    </button>
                  </div>

                  <div className="p-6">
                    <div className="mb-6">
                      <h3 className="font-semibold mb-3">Catégorie</h3>
                      <div className="space-y-2">
                        {categories.map((category) => (
                          <button
                            key={category}
                            onClick={() => {
                              setSelectedCategory(category);
                              setShowMobileFilters(false);
                            }}
                            className={`block w-full text-left px-3 py-2 rounded-lg transition-colors ${
                              selectedCategory === category
                                ? 'bg-purple-600 text-white'
                                : 'hover:bg-gray-100'
                            }`}
                          >
                            {category}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-3">💰 Prix</h3>
                      <div className="space-y-2">
                        {PRICE_RANGES.map((range) => (
                          <button
                            key={range.label}
                            onClick={() => {
                              setSelectedPriceRange(range);
                              setShowMobileFilters(false);
                            }}
                            className={`block w-full text-left px-3 py-2 rounded-lg transition-colors ${
                              selectedPriceRange.label === range.label
                                ? 'bg-purple-600 text-white'
                                : 'hover:bg-gray-100'
                            }`}
                          >
                            {range.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* CONTENU */}
            {loading && (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
                  <p className="text-gray-600">Chargement des produits...</p>
                </div>
              </div>
            )}

            {error && !loading && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">❌</span>
                  <div>
                    <h3 className="text-lg font-semibold text-red-900">Erreur</h3>
                    <p className="text-red-700">{error}</p>
                  </div>
                </div>
                <button
                  onClick={fetchProducts}
                  className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  🔄 Réessayer
                </button>
              </div>
            )}

            {/* ✅ GRILLE DE PRODUITS - Utilise stock_quantity */}
            {!loading && !error && (
              <>
                {filteredProducts.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredProducts.map((product) => (
                      <ProductCard
                        key={product.id} 
                        id={product.id}
                        name={product.name}
                        price={product.price}
                        category={product.category}
                        stock_quantity={product.stock_quantity}
                        image_url={product.image_url}
                        description={product.description}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <span className="text-6xl mb-4 block">😕</span>
                    <p className="text-gray-500 text-lg mb-4">Aucun produit trouvé</p>
                    <button
                      onClick={() => {
                        setSelectedCategory('Tous');
                        setSelectedPriceRange(PRICE_RANGES[0]);
                      }}
                      className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                    >
                      Réinitialiser les filtres
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}