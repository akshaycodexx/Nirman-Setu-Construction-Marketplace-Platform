import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useCustomer } from '../../context/CustomerContext';
import CustomerLayout, { StatusBadge, PaymentBadge } from '../../components/CustomerLayout';
import { ClipboardList, ChevronRight } from 'lucide-react';

export default function CustomerOrders() {
  const { authHeader } = useCustomer();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/customer/orders', { headers: authHeader() })
      .then(r => setOrders(r.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <CustomerLayout>
      <div className="max-w-3xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">My Orders</h1>
          <Link to="/request" className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
            + New Order
          </Link>
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl border border-gray-100 py-12 text-center text-gray-400 text-sm">Loading...</div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 py-16 text-center">
            <ClipboardList className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500">No orders yet.</p>
            <Link to="/request" className="text-blue-500 text-sm font-medium mt-1 block">Place your first order →</Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50 overflow-hidden">
            {orders.map(o => (
              <Link key={o._id} to={`/customer/orders/${o.orderId}`}
                className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors">
                <div>
                  <p className="font-semibold text-gray-900">{o.orderId}</p>
                  <p className="text-gray-500 text-sm capitalize mt-0.5">
                    {o.category} · {o.items?.length} item{o.items?.length !== 1 ? 's' : ''} · {o.delivery?.city}
                  </p>
                  {o.quote?.amount && (
                    <p className="text-gray-700 text-sm mt-0.5 font-medium">₹{o.quote.amount.toLocaleString('en-IN')}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex flex-col items-end gap-1">
                    <StatusBadge status={o.status} />
                    {o.payment?.status !== 'none' && <PaymentBadge status={o.payment.status} />}
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </CustomerLayout>
  );
}
