import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-red-50 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        {/* Illustration 404 */}
        <div className="mb-8">
          <div className="text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 mb-4">
            404
          </div>
          <div className="text-6xl mb-6">🔍❌🛒</div>
        </div>

        {/* Titre */}
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Oups ! Page introuvable
        </h1>

        {/* Description */}
        <p className="text-xl text-gray-600 mb-8 leading-relaxed">
          La page que vous recherchez semble avoir été déplacée, supprimée ou n'a jamais existé.
          Peut-être était-ce un produit en rupture de stock définitive ? 😅
        </p>

        {/* Boutons d'action */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <Link
            href="/"
            className="w-full sm:w-auto px-8 py-4 bg-purple-600 text-white rounded-lg font-bold text-lg hover:bg-purple-700 transition-all hover:shadow-lg transform hover:scale-105"
          >
            🏠 Retour à l'accueil
          </Link>

          <Link
            href="/boutique"
            className="w-full sm:w-auto px-8 py-4 border-2 border-purple-600 text-purple-600 rounded-lg font-bold text-lg hover:bg-purple-50 transition-all transform hover:scale-105"
          >
            🛍️ Découvrir la boutique
          </Link>
        </div>

        {/* Suggestions */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Que faire maintenant ?
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Suggestion 1 */}
            <Link
              href="/boutique"
              className="p-6 border-2 border-gray-200 rounded-lg hover:border-purple-600 hover:shadow-md transition-all group"
            >
              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">
                🛒
              </div>
              <h3 className="font-bold text-gray-900 mb-2">
                Parcourir les produits
              </h3>
              <p className="text-gray-600 text-sm">
                Découvrez notre catalogue complet
              </p>
            </Link>

            {/* Suggestion 2 */}
            <Link
              href="/"
              className="p-6 border-2 border-gray-200 rounded-lg hover:border-purple-600 hover:shadow-md transition-all group"
            >
              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">
                🏷️
              </div>
              <h3 className="font-bold text-gray-900 mb-2">
                Voir les promotions
              </h3>
              <p className="text-gray-600 text-sm">
                Ne ratez pas nos offres spéciales
              </p>
            </Link>

            {/* Suggestion 3 */}
            <Link
              href="/contact"
              className="p-6 border-2 border-gray-200 rounded-lg hover:border-purple-600 hover:shadow-md transition-all group"
            >
              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">
                💬
              </div>
              <h3 className="font-bold text-gray-900 mb-2">
                Besoin d'aide ?
              </h3>
              <p className="text-gray-600 text-sm">
                Contactez notre équipe support
              </p>
            </Link>
          </div>
        </div>

        {/* Message d'erreur technique (optionnel) */}
        <div className="mt-8 text-sm text-gray-500">
          <p>Code d'erreur : 404 - Ressource non trouvée</p>
          <p className="mt-1">
            Si vous pensez qu'il s'agit d'une erreur, veuillez{' '}
            <Link href="/contact" className="text-purple-600 hover:underline">
              nous contacter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}