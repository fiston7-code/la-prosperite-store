// app/admin/page.tsx
'use client';

import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
} from 'lucide-react';

const STATS = [
  {
    label: 'Revenus du mois',
    value: '12 458€',
    change: '+12.5%',
    trend: 'up',
    icon: DollarSign,
    color: 'bg-green-500',
  },
  {
    label: 'Commandes',
    value: '243',
    change: '+8.2%',
    trend: 'up',
    icon: ShoppingCart,
    color: 'bg-blue-500',
  },
  {
    label: 'Nouveaux clients',
    value: '89',
    change: '-3.1%',
    trend: 'down',
    icon: Users,
    color: 'bg-purple-500',
  },
  {
    label: 'Produits actifs',
    value: '156',
    change: '+5.4%',
    trend: 'up',
    icon: Package,
    color: 'bg-orange-500',
  },
];

const RECENT_ORDERS = [
  { id: '#12345', customer: 'Marie Dubois', amount: '149.99€', status: 'Livrée' },
  { id: '#12344', customer: 'Jean Martin', amount: '89.99€', status: 'En cours' },
  { id: '#12343', customer: 'Sophie Bernard', amount: '249.99€', status: 'En préparation' },
  { id: '#12342', customer: 'Pierre Durand', amount: '34.99€', status: 'Livrée' },
  { id: '#12341', customer: 'Lucie Petit', amount: '119.99€', status: 'Annulée' },
];

const TOP_PRODUCTS = [
  { name: 'Casque Audio Premium', sales: 87, revenue: '13 049€' },
  { name: 'Montre Connectée Sport', sales: 65, revenue: '16 249€' },
  { name: 'Écouteurs Sans Fil Pro', sales: 54, revenue: '4 859€' },
  { name: 'Powerbank 20000mAh', sales: 43, revenue: '2 146€' },
];

export default function AdminDashboard() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Tableau de bord</h1>
        <p className="text-gray-600">Vue d'ensemble de votre boutique</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {STATS.map((stat) => {
          const Icon = stat.icon;
          const TrendIcon = stat.trend === 'up' ? TrendingUp : TrendingDown;

          return (
            <div key={stat.label} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 ${stat.color} rounded-lg`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div
                  className={`flex items-center gap-1 text-sm font-semibold ${
                    stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  <TrendIcon className="h-4 w-4" />
                  {stat.change}
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold mb-4">Commandes récentes</h2>
          <div className="space-y-4">
            {RECENT_ORDERS.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between py-3 border-b last:border-0"
              >
                <div>
                  <p className="font-semibold">{order.id}</p>
                  <p className="text-sm text-gray-600">{order.customer}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{order.amount}</p>
                  <span
                    className={`inline-block px-2 py-1 text-xs rounded-full ${
                      order.status === 'Livrée'
                        ? 'bg-green-100 text-green-700'
                        : order.status === 'Annulée'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <button className="mt-4 w-full py-2 text-purple-600 font-semibold hover:bg-purple-50 rounded-lg transition-colors">
            Voir toutes les commandes
          </button>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold mb-4">Produits populaires</h2>
          <div className="space-y-4">
            {TOP_PRODUCTS.map((product, index) => (
              <div key={product.name} className="flex items-center gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-bold">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="font-semibold">{product.name}</p>
                  <p className="text-sm text-gray-600">{product.sales} ventes</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-purple-600">{product.revenue}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}