'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import Link from 'next/link';

export default function OrderConfirmationPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('orderId');
  
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) {
      router.push('/');
      return;
    }

    const fetchOrderDetails = async () => {
      // On récupère la commande et les items
      // Note: Ici on utilise le client public, assure-toi que le RLS permet la lecture 
      // ou crée une route API dédiée si c'est un invité.
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .eq('id', orderId)
        .single();

      if (!error && data) {
        setOrder(data);
      }
      setLoading(false);
    };

    fetchOrderDetails();
  }, [orderId, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-red-600">Commande introuvable</h1>
        <Link href="/" className="mt-4 text-blue-600 hover:underline font-medium">
          Retour à l'accueil
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 text-center">
        {/* Icône de succès */}
        <div className="mb-6 inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full">
          <span className="text-4xl text-green-600">✓</span>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Merci pour votre commande !
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Votre commande <span className="font-bold text-gray-900">#{order.order_number}</span> a été enregistrée avec succès.
        </p>

        <div className="bg-white rounded-xl shadow-sm border p-6 mb-8 text-left">
          <h2 className="text-lg font-bold border-b pb-4 mb-4">Résumé du reçu</h2>
          
          <div className="space-y-4">
            {order.order_items.map((item: any) => (
              <div key={item.id} className="flex justify-between items-center text-sm">
                <span>{item.quantity}x {item.product_name}</span>
                <span className="font-medium">{(item.subtotal).toLocaleString()} FC</span>
              </div>
            ))}
            
            <div className="border-t pt-4 mt-4 space-y-2">
              <div className="flex justify-between text-gray-600">
                <span>Livraison ({order.delivery_type})</span>
                <span>{order.shipping_cost.toLocaleString()} FC</span>
              </div>
              <div className="flex justify-between text-xl font-bold text-blue-600">
                <span>Total à payer</span>
                <span>{order.total_amount.toLocaleString()} FC</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-8">
          <p className="text-blue-800 text-sm">
            <strong>Prochaine étape :</strong> Notre équipe va vous appeler au numéro fourni pour confirmer l' heure de livraison. Prévoyez le montant exact en espèces pour le coursier.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button 
            onClick={() => window.print()}
            className="px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition"
          >
            Imprimer le reçu
          </button>
          <Link 
            href="/products"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
          >
            Continuer mes achats
          </Link>
        </div>
      </div>
    </div>
  );
}