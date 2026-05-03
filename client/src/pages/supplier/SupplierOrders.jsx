import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import SupplierLayout from '../../components/SupplierLayout';
import { useSupplier } from '../../context/SupplierContext';
import { ClipboardList, ArrowRight, Package } from 'lucide-react';

const STATUSES = ['all', 'confirmed', 'dispatched', 'delivered'];

const STATUS_COLORS = {
  confirmed: 'bg-indigo-100 text-indigo-700',
  dispatched: 'bg-orange-100 text-orange-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

export default function SupplierOrders() {
  const { getAuthHeaders } = useSupplier();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeStatus, setActiveStatus] = useState('all');

  const fetchOrders = async (status) => {
    setLoading(true);
    try {
      const q = status !== 'all' ? `?status=${status}` : '';
      const { data } = await axios.get(`/api/supplier/orders${q}`, { headers: getAuthHeaders() });
      setOrders(data.orders);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchOrders(activeStatus); }, [activeStatus]);

  return (
    <SupplierLayout>
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <ClipboardList className="w-6 h-6 text-emerald-500" /> My Orders
        </h1>
        <p className="text-gray-500 text-sm mt-0.5">{orders.length} orders</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {STATUSES.map(s => (
          <button
            key={s}
            onClick={() => setActiveStatus(s)}
            className={`px-4 py-1.5 rounded-xl text-sm font-medium capitalize transition-colors ${
              activeStatus === s ? 'bg-emerald-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="divide-y">{[...Array(6)].map((_, i) => <div key={i} className="h-16 animate-pulse bg-gray-50" />)}</div>
        ) : orders.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <Package className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p>Is category mein koi order nahi</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {orders.map(order => (
              <Link
                key={order._id}
                to={`/supplier/orders/${order.orderId}`}
                className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors group"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-mono font-bold text-gray-900">{order.orderId}</span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600'}`}>
                      {order.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 capitalize">
                    {order.category} &bull; {order.delivery?.city} &bull; {new Date(order.delivery?.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {order.items?.map(i => `${i.name} (${i.quantity} ${i.unit})`).join(', ')}
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-emerald-400 shrink-0" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </SupplierLayout>
  );
}
