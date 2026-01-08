'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log l'erreur dans la console (ou service comme Sentry)
    console.error('❌ Erreur détectée:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        {/* Illustration erreur */}
        <div className="mb-8">
          <div className="text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 mb-4">
            500
          </div>
          <div className="text-6xl mb-6">⚠️💥🔧</div>
        </div>

        {/* Titre */}
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Oups ! Quelque chose s'est mal passé
        </h1>

        {/* Description */}
        <p className="text-xl text-gray-600 mb-8 leading-relaxed">
          Une erreur inattendue est survenue. Notre équipe a été notifiée et
          travaille déjà sur le problème ! 🛠️
        </p>

        {/* Message d'erreur (mode dev) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-8 p-4 bg-red-100 border-2 border-red-300 rounded-lg text-left">
            <p className="font-mono text-sm text-red-800 break-all">
              <strong>Erreur :</strong> {error.message}
            </p>
            {error.digest && (
              <p className="font-mono text-xs text-red-600 mt-2">
                Digest: {error.digest}
              </p>
            )}
          </div>
        )}

        {/* Boutons d'action */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <button
            onClick={reset}
            className="w-full sm:w-auto px-8 py-4 bg-orange-600 text-white rounded-lg font-bold text-lg hover:bg-orange-700 transition-all hover:shadow-lg transform hover:scale-105"
          >
            🔄 Réessayer
          </button>

          <Link
            href="/"
            className="w-full sm:w-auto px-8 py-4 border-2 border-orange-600 text-orange-600 rounded-lg font-bold text-lg hover:bg-orange-50 transition-all transform hover:scale-105"
          >
            🏠 Retour à l'accueil
          </Link>
        </div>

        {/* Informations complémentaires */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Que s'est-il passé ?
          </h2>
          <p className="text-gray-600 mb-6">
            Une erreur technique empêche l'affichage de cette page.
            Cela peut être dû à :
          </p>

          <div className="grid md:grid-cols-3 gap-4 text-left">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl mb-2">🌐</div>
              <h3 className="font-semibold text-gray-900 mb-1">
                Problème réseau
              </h3>
              <p className="text-sm text-gray-600">
                Vérifiez votre connexion internet
              </p>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl mb-2">⚙️</div>
              <h3 className="font-semibold text-gray-900 mb-1">
                Maintenance
              </h3>
              <p className="text-sm text-gray-600">
                Nous mettons peut-être à jour le site
              </p>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl mb-2">🐛</div>
              <h3 className="font-semibold text-gray-900 mb-1">
                Bug technique
              </h3>
              <p className="text-sm text-gray-600">
                Notre équipe va corriger ça rapidement
              </p>
            </div>
          </div>
        </div>

        {/* Contact support */}
        <div className="mt-8 text-sm text-gray-500">
          <p>
            Le problème persiste ?{' '}
            <Link href="/contact" className="text-orange-600 hover:underline font-semibold">
              Contactez notre support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}