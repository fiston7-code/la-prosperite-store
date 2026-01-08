import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import AddToCartButton from '@/components/ui/AddToCartButton';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  brand?: string;
  image_url: string;
  stock_quantity: number;
  specifications?: Record<string, any>;
}

// Next.js 15 : params est une Promise
export default async function ProductDetail({  params }: { 
  params: Promise<{ id: string }> 
}) {
  // 1. On attend la résolution des paramètres
  const { id } = await params;

  // 2. Récupération du produit avec l'ID résolu
  const { data: product, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single<Product>();

  // 3. Si le produit n'existe pas ou erreur, on renvoie vers la page 404
  if (error || !product) {
    notFound();
  }

  const isOutOfStock = product.stock_quantity === 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <nav className="flex items-center gap-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-gray-900">Accueil</Link>
            <span>/</span>
            <Link href="/products" className="hover:text-gray-900">Produits</Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="grid md:grid-cols-2 gap-8 p-8">
            
            {/* IMAGE */}
            <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
              <Image
                src={product.image_url || '/placeholder.jpg'}
                alt={product.name}
                fill
                className={`object-cover transition-all ${isOutOfStock ? 'opacity-40 grayscale' : ''}`}
                priority
              />
              
              {/* ✅ Badge "SOLD OUT" centré si rupture de stock */}
              {isOutOfStock && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-red-600 text-white px-8 py-4 rounded-lg text-2xl font-bold shadow-xl transform -rotate-12">
                    SOLD OUT
                  </div>
                </div>
              )}

              {/* Badge coin supérieur droit */}
              {product.stock_quantity > 0 ? (
                <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  {product.stock_quantity > 10 ? 'En stock' : `Plus que ${product.stock_quantity} en stock`}
                </div>
              ) : (
                <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  Rupture de stock
                </div>
              )}
            </div>

            {/* INFORMATIONS */}
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm text-gray-500 uppercase tracking-wide">{product.category}</span>
                {product.brand && (
                  <>
                    <span className="text-gray-300">•</span>
                    <span className="text-sm text-gray-700 font-medium">{product.brand}</span>
                  </>
                )}
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>

              <div className="mb-6">
                <div className="text-4xl font-bold text-gray-900">{product.price.toFixed(2)} €</div>
                <p className="text-sm text-gray-500 mt-1">TVA incluse</p>
              </div>

              {/* ✅ Affichage du stock */}
              <div className="mb-6">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">Disponibilité :</span>
                  {product.stock_quantity > 0 ? (
                    <span className="text-sm text-green-600 font-semibold">
                      {product.stock_quantity} unité{product.stock_quantity > 1 ? 's' : ''} disponible{product.stock_quantity > 1 ? 's' : ''}
                    </span>
                  ) : (
                    <span className="text-sm text-red-600 font-semibold">
                      Rupture de stock
                    </span>
                  )}
                </div>
              </div>

              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-2">Description</h2>
                <p className="text-gray-700 leading-relaxed">{product.description}</p>
              </div>

              {/* Spécifications dynamique */}
              {product.specifications && Object.keys(product.specifications).length > 0 && (
                <div className="mb-6">
                  <h2 className="text-lg font-semibold mb-3">Caractéristiques</h2>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    {Object.entries(product.specifications).map(([key, value]) => (
                      <div key={key} className="flex justify-between border-b border-gray-200 pb-2 last:border-0">
                        <span className="text-gray-600 capitalize">{key.replace(/_/g, ' ')}</span>
                        <span className="font-medium text-gray-900">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-auto space-y-3">
                {/* ✅ Bouton désactivé si rupture de stock */}
                {isOutOfStock ? (
                  <button 
                    disabled 
                    className="w-full bg-gray-300 text-gray-500 py-3 rounded-lg font-semibold cursor-not-allowed"
                  >
                    Produit indisponible
                  </button>
                ) : (
                  <AddToCartButton product={product} />
                )}
                
                <button 
                  className="w-full border-2 border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isOutOfStock}
                >
                  Ajouter aux favoris
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Métadonnées adaptées Next.js 15
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const { data: product } = await supabase
    .from('products')
    .select('name, description, price, image_url')
    .eq('id', id)
    .single();

  if (!product) return { title: 'Produit non trouvé' };

  return {
    title: `${product.name} - Boutique`,
    description: product.description,
    openGraph: { images: [product.image_url] },
  };
}