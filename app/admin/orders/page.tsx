// app/admin/orders/page.tsx
'use client';

import { useState } from 'react';
import { Search, Eye, Download } from 'lucide-react';

const MOCK_ORDERS = [
  {
    id: '#12345',
    customer: 'Marie Dubois',
    email: 'marie@example.com',
    date: '2026-01-06',
    total: '149.99€',
    status: 'Livrée',
    items: 2,
  },
  {
    id: '#12344',
    customer: 'Jean Martin',
    email: 'jean@example.com',
    date: '2026-01-05',
    total: '89.99€',
    status: 'En cours',
    items: 1,
  },
  {
    id: '#12343',
    customer: 'Sophie Bernard',
    email: 'sophie@example.com',
    date: '2026-01-05',
    total: '249.99€',
    status: 'En préparation',
    items: 3,
  },
  {
    id: '#12342',
    customer: 'Pierre Durand',
    email: 'pierre@example.com',
    date: '2026-01-04',
    total: '34.99€',
    status: 'Livrée',
    items: 1,
  },
  {
    id: '#12341',
    customer: 'Lucie Petit',
    email: 'lucie@example.com',
    date: '2026-01-04',
    total: '119.99€',
    status: 'Annulée',
    items: 2,
  },
];

export default function OrdersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Tous');

  const filteredOrders = MOCK_ORDERS.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'Tous' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Livrée':
        return 'bg-green-100 text-green-700';
      case 'En cours':
        return 'bg-blue-100 text-blue-700';
      case 'En préparation':
        return 'bg-yellow-100 text-yellow-700';
      case 'Annulée':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Commandes</h1>
          <p className="text-gray-600">Gérez toutes vos commandes</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors">
          <Download className="h-5 w-5" />
          Exporter
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher par N° ou client..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
          >
            <option>Tous</option>
            <option>En préparation</option>
            <option>En cours</option>
            <option>Livrée</option>
            <option>Annulée</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Commande
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-semibold">{order.id}</p>
                      <p className="text-sm text-gray-500">{order.items} article(s)</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium">{order.customer}</p>
                      <p className="text-sm text-gray-500">{order.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-700">
                      {new Date(order.date).toLocaleDateString('fr-FR')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-semibold">{order.total}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <Eye className="h-4 w-4 text-gray-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}