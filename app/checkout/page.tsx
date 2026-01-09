'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { useCartStore } from '@/lib/store/cartStore';
import Image from 'next/image';

interface CheckoutFormData {
  email: string;
  name: string;
  phone: string;
  ville: string;
  commune: string;
  quartier: string;
  avenue: string;
  numero_parcelle: string;
  reference: string;
  preferred_delivery_day: string;
  createAccount: boolean;
  password: string;
  confirmPassword: string;
  deliveryType: 'standard' | 'express';
}

const DELIVERY_DAYS = [
  { value: '', label: '-- Sélectionner --' },
  { value: 'monday', label: 'Lundi' },
  { value: 'tuesday', label: 'Mardi' },
  { value: 'wednesday', label: 'Mercredi' },
  { value: 'thursday', label: 'Jeudi' },
  { value: 'friday', label: 'Vendredi' },
  { value: 'saturday', label: 'Samedi' },
  { value: 'sunday', label: 'Dimanche' },
];

const SHIPPING_COSTS = {
  standard: 3000,
  express: 5000,
};

export default function CheckoutPage() {
  const router = useRouter();
  
  const [isHydrated, setIsHydrated] = useState(false);
  
  // ✅ Zustand - Utilisation correcte des méthodes
  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);
  const refreshStock = useCartStore((state) => state.refreshStock);
  const totalPrice = useCartStore((state) => state.totalPrice);
  const totalItems = useCartStore((state) => state.totalItems);
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [user, setUser] = useState<any>(null);
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [useExistingAddress, setUseExistingAddress] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  
  const [formData, setFormData] = useState<CheckoutFormData>({
    email: '',
    name: '',
    phone: '',
    ville: '',
    commune: '',
    quartier: '',
    avenue: '',
    numero_parcelle: '',
    reference: '',
    preferred_delivery_day: '',
    createAccount: false,
    password: '',
    confirmPassword: '',
    deliveryType: 'standard',
  });
  
  useEffect(() => {
    setIsHydrated(true);
  }, []);
  
  useEffect(() => {
    if (isHydrated) {
      loadCheckoutData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHydrated]);
  
  const loadCheckoutData = async () => {
    try {
      // ✅ Rafraîchir le stock
      await refreshStock();
      
      // ✅ Vérifier si le panier est vide (après rafraîchissement)
      const currentItems = useCartStore.getState().items;
      
      if (currentItems.length === 0) {
        router.push('/cart');
        return;
      }
      
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      setUser(currentUser);
      
      if (currentUser) {
        const { data: customer } = await supabase
          .from('customers')
          .select('*')
          .eq('id', currentUser.id)
          .single();
        
        if (customer) {
          setFormData(prev => ({
            ...prev,
            email: currentUser.email || '',
            name: customer.name || '',
            phone: customer.phone || '',
          }));
        }
        
        const { data: addresses } = await supabase
          .from('addresses')
          .select('*')
          .eq('customer_id', currentUser.id)
          .order('is_default', { ascending: false });
        
        if (addresses && addresses.length > 0) {
          setSavedAddresses(addresses);
          const defaultAddress = addresses.find(a => a.is_default) || addresses[0];
          setSelectedAddressId(defaultAddress.id);
          handleAddressSelect(defaultAddress.id, addresses);
        }
      }
      
    } catch (err) {
      console.error('Error loading checkout:', err);
      setError('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };
  
  const handleAddressSelect = (addressId: string, addresses?: any[]) => {
    setSelectedAddressId(addressId);
    const addressList = addresses || savedAddresses;
    const address = addressList.find(a => a.id === addressId);
    
    if (address) {
      setFormData(prev => ({
        ...prev,
        ville: address.ville,
        commune: address.commune || '',
        quartier: address.quartier,
        avenue: address.avenue,
        numero_parcelle: address.numero_parcelle || '',
        reference: address.reference || '',
        preferred_delivery_day: address.preferred_delivery_day || '',
      }));
    }
  };
  
  // ✅ Calcul des totaux - Utiliser les fonctions du store
  const subtotal = isHydrated ? totalPrice() : 0;
  const cartItemsCount = isHydrated ? totalItems() : 0;
  const shippingCost = SHIPPING_COSTS[formData.deliveryType];
  const total = subtotal + shippingCost;
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    
    try {
      if (formData.createAccount) {
        if (formData.password.length < 6) {
          throw new Error('Le mot de passe doit contenir au moins 6 caractères');
        }
        if (formData.password !== formData.confirmPassword) {
          throw new Error('Les mots de passe ne correspondent pas');
        }
      }
      
      const currentItems = useCartStore.getState().items;
      
      const checkoutData = {
        email: formData.email,
        name: formData.name,
        phone: formData.phone,
        address: {
          ville: formData.ville,
          commune: formData.commune,
          quartier: formData.quartier,
          avenue: formData.avenue,
          numero_parcelle: formData.numero_parcelle,
          reference: formData.reference,
          preferred_delivery_day: formData.preferred_delivery_day,
        },
        createAccount: formData.createAccount,
        password: formData.password,
      };
      
      const endpoint = user 
        ? '/api/checkout/registered' 
        : '/api/checkout/guest';
      
      const payload = user
        ? {
            addressId: useExistingAddress ? selectedAddressId : null,
            newAddress: !useExistingAddress ? checkoutData.address : null,
            deliveryType: formData.deliveryType,
            // ✅ Adapter les items au format attendu par l'API
            cartItems: currentItems.map(item => ({
              productId: item.id,
              productName: item.name,
              quantity: item.quantity,
              unitPrice: item.price,
              subtotal: item.price * item.quantity,
            })),
          }
        : {
            // ✅ Adapter les items pour les invités
            cartItems: currentItems.map(item => ({
              productId: item.id,
              productName: item.name,
              quantity: item.quantity,
              unitPrice: item.price,
              subtotal: item.price * item.quantity,
            })),
            checkoutData,
            deliveryType: formData.deliveryType,
          };
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Erreur lors de la commande');
      }
      
      clearCart();
      router.push(`/order-confirmation?orderId=${result.orderId}`);
      
    } catch (err: any) {
      setError(err.message);
      setSubmitting(false);
    }
  };
  
  if (!isHydrated || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  if (cartItemsCount === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-gray-600">Votre panier est vide</p>
        <button
          onClick={() => router.push('/products')}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
        >
          Continuer mes achats
        </button>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <h1 className="text-3xl font-bold mb-8">Finaliser la commande</h1>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Informations Client */}
              <section className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-bold mb-4">Informations personnelles</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      required
                      disabled={!!user}
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full p-3 border rounded-lg disabled:bg-gray-100"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nom complet *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full p-3 border rounded-lg"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Téléphone *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+243 XXX XXX XXX"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full p-3 border rounded-lg"
                    />
                  </div>
                </div>
              </section>
              
              {/* Adresse de livraison */}
              <section className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-bold mb-4">Adresse de livraison</h2>
                
                {user && savedAddresses.length > 0 && (
                  <div className="mb-4 space-y-3">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={useExistingAddress}
                        onChange={(e) => setUseExistingAddress(e.target.checked)}
                        className="w-4 h-4"
                      />
                      <span className="text-sm font-medium">Utiliser une adresse existante</span>
                    </label>
                    
                    {useExistingAddress && (
                      <select
                        value={selectedAddressId}
                        onChange={(e) => handleAddressSelect(e.target.value)}
                        className="w-full p-3 border rounded-lg"
                      >
                        {savedAddresses.map(addr => (
                          <option key={addr.id} value={addr.id}>
                            {addr.quartier}, {addr.avenue} - {addr.ville}
                            {addr.is_default && ' (Par défaut)'}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                )}
                
                {(!user || !useExistingAddress) && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Ville *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.ville}
                          onChange={(e) => setFormData(prev => ({ ...prev, ville: e.target.value }))}
                          className="w-full p-3 border rounded-lg"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Commune
                        </label>
                        <input
                          type="text"
                          value={formData.commune}
                          onChange={(e) => setFormData(prev => ({ ...prev, commune: e.target.value }))}
                          className="w-full p-3 border rounded-lg"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Quartier *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.quartier}
                        onChange={(e) => setFormData(prev => ({ ...prev, quartier: e.target.value }))}
                        className="w-full p-3 border rounded-lg"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Avenue/Rue *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.avenue}
                        onChange={(e) => setFormData(prev => ({ ...prev, avenue: e.target.value }))}
                        className="w-full p-3 border rounded-lg"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Numéro de parcelle
                      </label>
                      <input
                        type="text"
                        value={formData.numero_parcelle}
                        onChange={(e) => setFormData(prev => ({ ...prev, numero_parcelle: e.target.value }))}
                        className="w-full p-3 border rounded-lg"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Point de référence
                      </label>
                      <textarea
                        rows={2}
                        placeholder="Ex: À côté de la pharmacie centrale"
                        value={formData.reference}
                        onChange={(e) => setFormData(prev => ({ ...prev, reference: e.target.value }))}
                        className="w-full p-3 border rounded-lg resize-none"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Jour préféré de livraison
                      </label>
                      <select
                        value={formData.preferred_delivery_day}
                        onChange={(e) => setFormData(prev => ({ ...prev, preferred_delivery_day: e.target.value }))}
                        className="w-full p-3 border rounded-lg bg-white"
                      >
                        {DELIVERY_DAYS.map(day => (
                          <option key={day.value} value={day.value}>
                            {day.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </section>
              
              {/* Type de livraison */}
              <section className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-bold mb-4">Mode de livraison</h2>
                
                <div className="space-y-3">
                  <label className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition ${formData.deliveryType === 'standard' ? 'border-blue-500 bg-blue-50' : ''}`}>
                    <input
                      type="radio"
                      name="deliveryType"
                      value="standard"
                      checked={formData.deliveryType === 'standard'}
                      onChange={() => setFormData(prev => ({ ...prev, deliveryType: 'standard' }))}
                      className="w-5 h-5 text-blue-600"
                    />
                    <div className="flex-1">
                      <div className="font-semibold">Livraison standard</div>
                      <div className="text-sm text-gray-600">3-5 jours ouvrables</div>
                    </div>
                    <div className="font-bold text-blue-600">{SHIPPING_COSTS.standard.toLocaleString()} FC</div>
                  </label>
                  
                  <label className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition ${formData.deliveryType === 'express' ? 'border-blue-500 bg-blue-50' : ''}`}>
                    <input
                      type="radio"
                      name="deliveryType"
                      value="express"
                      checked={formData.deliveryType === 'express'}
                      onChange={() => setFormData(prev => ({ ...prev, deliveryType: 'express' }))}
                      className="w-5 h-5 text-blue-600"
                    />
                    <div className="flex-1">
                      <div className="font-semibold">Livraison express</div>
                      <div className="text-sm text-gray-600">1-2 jours ouvrables</div>
                    </div>
                    <div className="font-bold text-blue-600">{SHIPPING_COSTS.express.toLocaleString()} FC</div>
                  </label>
                </div>
              </section>
              
              {/* Créer un compte */}
              {!user && (
                <section className="bg-white p-6 rounded-lg shadow">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.createAccount}
                      onChange={(e) => setFormData(prev => ({ ...prev, createAccount: e.target.checked }))}
                      className="w-5 h-5 mt-1"
                    />
                    <div>
                      <div className="font-semibold">Créer un compte</div>
                      <div className="text-sm text-gray-600">
                        Suivez vos commandes et profitez d'avantages exclusifs
                      </div>
                    </div>
                  </label>
                  
                  {formData.createAccount && (
                    <div className="mt-4 space-y-4 pl-8">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Mot de passe *
                        </label>
                        <input
                          type="password"
                          required={formData.createAccount}
                          minLength={6}
                          value={formData.password}
                          onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                          className="w-full p-3 border rounded-lg"
                        />
                        <p className="text-xs text-gray-500 mt-1">Minimum 6 caractères</p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Confirmer le mot de passe *
                        </label>
                        <input
                          type="password"
                          required={formData.createAccount}
                          minLength={6}
                          value={formData.confirmPassword}
                          onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                          className="w-full p-3 border rounded-lg"
                        />
                      </div>
                    </div>
                  )}
                </section>
              )}
              
              {/* Bouton mobile */}
              <div className="lg:hidden">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                      Traitement en cours...
                    </>
                  ) : (
                    `Confirmer la commande • ${total.toLocaleString()} FC`
                  )}
                </button>
              </div>
            </form>
          </div>
          
          {/* ✅ Récapitulatif - Adapté au nouveau store */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow sticky top-4">
              <h2 className="text-xl font-bold mb-4">
                Récapitulatif ({cartItemsCount} article{cartItemsCount > 1 ? 's' : ''})
              </h2>
              
              <div className="space-y-3 mb-4 max-h-80 overflow-y-auto">
                {items.map(item => (
                  <div key={item.id} className="flex gap-3 pb-3 border-b last:border-0">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={60}
                        height={60}
                        className="rounded object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-15 h-15 bg-gray-200 rounded flex items-center justify-center flex-shrink-0">
                        <span className="text-gray-400 text-xs">No img</span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{item.name}</div>
                      <div className="text-sm text-gray-600">
                        {item.quantity} × {item.price.toLocaleString()} FC
                      </div>
                    </div>
                    <div className="font-semibold text-sm whitespace-nowrap">
                      {(item.price * item.quantity).toLocaleString()} FC
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>Sous-total</span>
                  <span className="font-semibold">{subtotal.toLocaleString()} FC</span>
                </div>
                
                <div className="flex justify-between text-gray-600">
                  <span>Livraison ({formData.deliveryType === 'express' ? 'Express' : 'Standard'})</span>
                  <span className="font-semibold">{shippingCost.toLocaleString()} FC</span>
                </div>
                
                <div className="flex justify-between text-xl font-bold border-t pt-3 mt-2">
                  <span>Total</span>
                  <span className="text-blue-600">{total.toLocaleString()} FC</span>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-green-50 rounded-lg text-sm text-green-800 flex items-center gap-2">
                <span className="text-lg">💳</span>
                <span>Paiement à la livraison</span>
              </div>
              
              {/* Bouton desktop */}
        
              <button
                type="submit"
                // onClick={handleSubmit}
                disabled={submitting}
                className="hidden lg:flex w-full mt-4 bg-blue-600 text-white py-4 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                    Traitement...
                  </>
                ) : (
                  'Confirmer la commande'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}