import Link from 'next/link';

type ProductCardProps = {
  id: string;
  name: string;
  price: number;
  category: string;
  stock_quantity: number;
  image_url?: string;
  description?: string;
  oldPrice?: number;
  badge?: string;
};

export default function ProductCard({
  id,
  name,
  price,
  category,
  stock_quantity,
  image_url,
  description,
  oldPrice,
  badge,
}: ProductCardProps) {
  // 🎯 Emoji selon la catégorie
  const getCategoryEmoji = (cat: string) => {
    const emojis: Record<string, string> = {
      audio: '🎧',
      informatique: '💻',
      gaming: '🎮',
      smartphone: '📱',
      montres: '⌚',
      accessoires: '🔌',
    };
    return emojis[cat.toLowerCase()] || '📦';
  };

  // 🎯 Couleur du badge de stock
  const getStockColor = () => {
    if (stock_quantity === 0) return 'bg-red-100 text-red-800';
    if (stock_quantity < 5) return 'bg-orange-100 text-orange-800';
    return 'bg-green-100 text-green-800';
  };

  // 🎯 Texte du badge de stock
  const getStockText = () => {
    if (stock_quantity === 0) return '❌ Rupture';
    if (stock_quantity < 5) return `⚠️ ${stock_quantity} restant${stock_quantity > 1 ? 's' : ''}`;
    return '✓ En stock';
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      {/* Image / Icône */}
      <div className="relative h-48 bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 flex items-center justify-center">
        {image_url ? (
          <img
            src={image_url}
            alt={name}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-7xl">
            {getCategoryEmoji(category)}
          </span>
        )}

        {/* Badge promotionnel */}
        {badge && (
          <div className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">
            {badge}
          </div>
        )}

        {/* Badge stock */}
        <div className={`absolute bottom-2 left-2 ${getStockColor()} px-3 py-1 rounded-full text-xs font-semibold`}>
          {getStockText()}
        </div>
      </div>

      {/* Contenu */}
      <div className="p-4">
        {/* Catégorie */}
        <div className="inline-block bg-purple-100 text-purple-800 text-xs px-3 py-1 rounded-full mb-2">
          {category}
        </div>

        {/* Nom */}
        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1">
          {name}
        </h3>

        {/* Description */}
        {description && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-2 h-10">
            {description}
          </p>
        )}

        {/* Prix */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl font-bold text-gray-900">
            {price.toFixed(2)}€
          </span>
          {oldPrice && (
            <span className="text-lg text-gray-400 line-through">
              {oldPrice.toFixed(2)}€
            </span>
          )}
        </div>

        {/* Boutons */}
        <div className="flex gap-2">
          {/* Bouton "Voir" */}
          <Link
            href={`/boutique/${id}`}
            className="flex-1 text-center px-4 py-2 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors font-semibold"
          >
            👁️ Voir
          </Link>

          {/* Bouton "Panier" */}
          {stock_quantity > 0 ? (
            <Link
              href="/cart"
              className="flex-1 text-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold"
            >
              🛒 Panier
            </Link>
          ) : (
            <button
              disabled
              className="flex-1 px-4 py-2 rounded-lg font-semibold bg-gray-300 text-gray-500 cursor-not-allowed"
            >
              ❌ Indisponible
            </button>
          )}
        </div>
      </div>
    </div>
  );
}