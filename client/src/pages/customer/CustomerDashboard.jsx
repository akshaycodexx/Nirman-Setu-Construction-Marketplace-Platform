import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useCustomer } from '../../context/CustomerContext';
import CustomerLayout, { StatusBadge, PaymentBadge } from '../../components/CustomerLayout';
import { ClipboardList, Plus, Package, TrendingUp, CheckCircle, Clock } from 'lucide-react';

export default function CustomerDashboard() {
  const { customer, authHeader } = useCustomer();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/customer/orders', { headers: authHeader() })
      .then(r => setOrders(r.data))
      .finally(() => setLoading(false));
  }, []);

  const stats = {
    total: orders.length,
    active: orders.filter(o => !['delivered', 'cancelled'].includes(o.status)).length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    pending: orders.filter(o => o.status === 'pending').length,
  };

  const recent = orders.slice(0, 5);

  return (
    <CustomerLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Welcome */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-2xl p-5 text-white">
          <h1 className="text-xl font-bold">Welcome back, {customer?.name}!</h1>
          <p className="text-blue-100 text-sm mt-0.5">Track your construction orders here.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Orders', value: stats.total, icon: ClipboardList, color: 'text-blue-600' },
            { label: 'Active', value: stats.active, icon: TrendingUp, color: 'text-orange-500' },
            { label: 'Delivered', value: stats.delivered, icon: CheckCircle, color: 'text-green-500' },
            { label: 'Pending', value: stats.pending, icon: Clock, color: 'text-yellow-500' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl p-4 border border-gray-100">
              <div className="flex items-center justify-between mb-1">
                <span className="text-gray-500 text-xs">{s.label}</span>
                <s.icon className={`w-4 h-4 ${s.color}`} />
              </div>
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div className="flex gap-3">
          <Link to="/request"
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors">
            <Plus className="w-4 h-4" /> New Order
          </Link>
          <Link to="/customer/orders"
            className="flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors">
            <Package className="w-4 h-4" /> All Orders
          </Link>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Recent Orders</h2>
          </div>
          {loading ? (
            <div className="py-12 text-center text-gray-400 text-sm">Loading...</div>
          ) : recent.length === 0 ? (
            <div className="py-12 text-center">
              <ClipboardList className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">No orders yet</p>
              <Link to="/request" className="text-blue-500 text-sm font-medium mt-1 block">Place your first order →</Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {recent.map(o => (
                <Link key={o._id} to={`/customer/orders/${o.orderId}`}
                  className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors">
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{o.orderId}</p>
                    <p className="text-gray-500 text-xs capitalize">{o.category} · {o.items?.length} item{o.items?.length !== 1 ? 's' : ''}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={o.status} />
                    {o.payment?.status !== 'none' && <PaymentBadge status={o.payment.status} />}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </CustomerLayout>
  );
}
