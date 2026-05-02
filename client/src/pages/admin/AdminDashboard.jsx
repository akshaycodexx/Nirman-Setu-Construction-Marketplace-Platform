import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import AdminLayout, { StatusBadge } from '../../components/AdminLayout';
import { Package, Clock, Truck, CheckCircle, XCircle, LayoutDashboard, ArrowRight } from 'lucide-react';

const STAT_CARDS = [
  { key: 'total', label: 'Total Orders', icon: Package, color: 'bg-gray-900 text-white' },
  { key: 'pending', label: 'Pending', icon: Clock, color: 'bg-yellow-50 text-yellow-700' },
  { key: 'confirmed', label: 'Confirmed', icon: CheckCircle, color: 'bg-indigo-50 text-indigo-700' },
  { key: 'dispatched', label: 'Dispatched', icon: Truck, color: 'bg-orange-50 text-orange-700' },
  { key: 'delivered', label: 'Delivered', icon: CheckCircle, color: 'bg-green-50 text-green-700' },
  { key: 'cancelled', label: 'Cancelled', icon: XCircle, color: 'bg-red-50 text-red-700' },
];

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/admin/dashboard')
      .then(r => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <LayoutDashboard className="w-6 h-6 text-orange-500" /> Dashboard
        </h1>
        <p className="text-gray-500 text-sm mt-1">Nirman Setu — Order Overview</p>
      </div>

      {/* Stats */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 h-24 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {STAT_CARDS.map(card => (
            <div key={card.key} className={`rounded-2xl p-4 ${card.color} border border-gray-100`}>
              <card.icon className="w-5 h-5 mb-2 opacity-70" />
              <p className="text-2xl font-black">{data?.stats?.[card.key] ?? 0}</p>
              <p className="text-xs font-medium opacity-70 mt-0.5">{card.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Recent Orders */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Recent Orders</h2>
          <Link to="/admin/orders" className="text-sm text-orange-500 hover:text-orange-600 flex items-center gap-1 font-medium">
            All Orders <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="divide-y divide-gray-50">
            {[...Array(5)].map((_, i) => <div key={i} className="px-5 py-4 h-16 animate-pulse bg-gray-50" />)}
          </div>
        ) : data?.recent?.length === 0 ? (
          <div className="px-5 py-12 text-center text-gray-400">
            <Package className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p>Koi order nahi abhi</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {data?.recent?.map(order => (
              <Link
                key={order._id}
                to={`/admin/orders/${order.orderId}`}
                className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 transition-colors group"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-mono text-sm font-bold text-gray-900">{order.orderId}</span>
                    <StatusBadge status={order.status} />
                  </div>
                  <p className="text-sm text-gray-500 truncate">
                    {order.customer?.name} &bull; {order.delivery?.city} &bull; <span className="capitalize">{order.category}</span>
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs text-gray-400">
                    {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </p>
                  <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-orange-400 transition-colors ml-auto mt-1" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
