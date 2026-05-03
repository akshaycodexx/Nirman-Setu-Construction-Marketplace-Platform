import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import AdminLayout, { StatusBadge } from '../../components/AdminLayout';
import {
  Package, Clock, Truck, CheckCircle, XCircle,
  ArrowRight, IndianRupee, Users, FileText, TrendingUp
} from 'lucide-react';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/admin/dashboard')
      .then(r => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const s = data?.stats || {};
  const r = data?.revenue || {};

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Nirman Setu — Overview</p>
      </div>

      {/* Revenue cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <RevenueCard
          loading={loading}
          label="Advance Collected"
          value={r.advanceCollected ? `₹${r.advanceCollected.toLocaleString('en-IN')}` : '₹0'}
          icon={IndianRupee}
          color="bg-green-500"
          sub="Payments received"
        />
        <RevenueCard
          loading={loading}
          label="Total Quoted Value"
          value={r.totalQuotedValue ? `₹${r.totalQuotedValue.toLocaleString('en-IN')}` : '₹0'}
          icon={TrendingUp}
          color="bg-orange-500"
          sub="All quotes combined"
        />
        <RevenueCard
          loading={loading}
          label="Total Orders"
          value={s.total ?? 0}
          icon={Package}
          color="bg-gray-800"
          sub={`${s.pending ?? 0} pending action`}
        />
        <RevenueCard
          loading={loading}
          label="Customers"
          value={s.totalCustomers ?? 0}
          icon={Users}
          color="bg-blue-500"
          sub="Registered accounts"
        />
      </div>

      {/* Status grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {[
          { key: 'pending', label: 'Pending', icon: Clock, cls: 'bg-yellow-50 text-yellow-700 border-yellow-100' },
          { key: 'quoted', label: 'Quoted', icon: FileText, cls: 'bg-blue-50 text-blue-700 border-blue-100' },
          { key: 'confirmed', label: 'Confirmed', icon: CheckCircle, cls: 'bg-indigo-50 text-indigo-700 border-indigo-100' },
          { key: 'dispatched', label: 'Dispatched', icon: Truck, cls: 'bg-orange-50 text-orange-700 border-orange-100' },
          { key: 'delivered', label: 'Delivered', icon: CheckCircle, cls: 'bg-green-50 text-green-700 border-green-100' },
          { key: 'cancelled', label: 'Cancelled', icon: XCircle, cls: 'bg-red-50 text-red-700 border-red-100' },
        ].map(card => (
          <Link key={card.key} to={`/admin/orders?status=${card.key}`}
            className={`rounded-2xl p-4 border ${card.cls} hover:opacity-80 transition-opacity`}>
            <card.icon className="w-4 h-4 mb-2 opacity-70" />
            <p className="text-2xl font-black">{loading ? '—' : (s[card.key] ?? 0)}</p>
            <p className="text-xs font-medium opacity-70 mt-0.5">{card.label}</p>
          </Link>
        ))}
      </div>

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
        ) : !data?.recent?.length ? (
          <div className="px-5 py-12 text-center text-gray-400">
            <Package className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p>Koi order nahi abhi</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {data.recent.map(order => (
              <Link key={order._id} to={`/admin/orders/${order.orderId}`}
                className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 transition-colors group">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <span className="font-mono text-sm font-bold text-gray-900">{order.orderId}</span>
                    <StatusBadge status={order.status} />
                    {order.quote?.amount && (
                      <span className="text-xs text-gray-500 font-medium">
                        ₹{order.quote.amount.toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 truncate">
                    {order.customer?.name} &bull; {order.delivery?.city} &bull;{' '}
                    <span className="capitalize">{order.category}</span>
                  </p>
                </div>
                <div className="text-right shrink-0">
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

function RevenueCard({ loading, label, value, icon: Icon, color, sub }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <span className="text-gray-500 text-xs font-medium">{label}</span>
        <div className={`${color} p-1.5 rounded-lg`}>
          <Icon className="w-3.5 h-3.5 text-white" />
        </div>
      </div>
      <p className="text-2xl font-black text-gray-900">{loading ? '—' : value}</p>
      <p className="text-xs text-gray-400 mt-1">{sub}</p>
    </div>
  );
}
