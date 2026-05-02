import { useEffect, useState, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import AdminLayout, { StatusBadge } from '../../components/AdminLayout';
import { ClipboardList, Search, ArrowRight, RefreshCw } from 'lucide-react';

const STATUSES = ['all', 'pending', 'quoted', 'confirmed', 'dispatched', 'delivered', 'cancelled'];
const CATEGORIES = ['all', 'material', 'transport', 'equipment'];

export default function AdminOrders() {
  const [params, setParams] = useSearchParams();
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const status = params.get('status') || 'all';
  const category = params.get('category') || 'all';
  const search = params.get('search') || '';
  const page = Number(params.get('page') || 1);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams();
      if (status !== 'all') q.set('status', status);
      if (category !== 'all') q.set('category', category);
      if (search) q.set('search', search);
      q.set('page', page);
      q.set('limit', 20);
      const { data } = await axios.get(`/api/admin/orders?${q}`);
      setOrders(data.orders);
      setTotal(data.total);
    } catch {}
    setLoading(false);
  }, [status, category, search, page]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const setFilter = (key, value) => {
    const next = new URLSearchParams(params);
    next.set(key, value);
    next.set('page', '1');
    setParams(next);
  };

  return (
    <AdminLayout>
      <div className="mb-5 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-orange-500" /> Orders
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">{total} total orders</p>
        </div>
        <button onClick={fetchOrders} className="text-gray-500 hover:text-gray-800 p-2 rounded-lg hover:bg-gray-100">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-4 space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            defaultValue={search}
            onKeyDown={e => e.key === 'Enter' && setFilter('search', e.target.value)}
            onBlur={e => setFilter('search', e.target.value)}
            placeholder="Search by Order ID, customer name, phone..."
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
          />
        </div>

        {/* Status tabs */}
        <div className="flex flex-wrap gap-2">
          {STATUSES.map(s => (
            <button
              key={s}
              onClick={() => setFilter('status', s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                status === s
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Category */}
        <div className="flex gap-2">
          {CATEGORIES.map(c => (
            <button
              key={c}
              onClick={() => setFilter('category', c)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                category === c
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="divide-y divide-gray-50">
            {[...Array(8)].map((_, i) => <div key={i} className="h-16 animate-pulse bg-gray-50 border-b border-gray-100" />)}
          </div>
        ) : orders.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <ClipboardList className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p>Koi order nahi mila</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="hidden sm:grid grid-cols-12 px-5 py-2.5 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              <div className="col-span-2">Order ID</div>
              <div className="col-span-3">Customer</div>
              <div className="col-span-2">Category</div>
              <div className="col-span-2">City</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-1">Date</div>
            </div>

            <div className="divide-y divide-gray-50">
              {orders.map(order => (
                <Link
                  key={order._id}
                  to={`/admin/orders/${order.orderId}`}
                  className="grid grid-cols-12 items-center px-5 py-3.5 hover:bg-orange-50/40 transition-colors group"
                >
                  <div className="col-span-5 sm:col-span-2">
                    <span className="font-mono text-sm font-bold text-gray-900">{order.orderId}</span>
                  </div>
                  <div className="hidden sm:block col-span-3">
                    <p className="text-sm font-medium text-gray-800 truncate">{order.customer?.name}</p>
                    <p className="text-xs text-gray-400">{order.customer?.phone}</p>
                  </div>
                  <div className="hidden sm:block col-span-2">
                    <span className="text-sm text-gray-600 capitalize">{order.category}</span>
                  </div>
                  <div className="hidden sm:block col-span-2">
                    <span className="text-sm text-gray-600">{order.delivery?.city}</span>
                  </div>
                  <div className="col-span-5 sm:col-span-2 flex justify-end sm:justify-start">
                    <StatusBadge status={order.status} />
                  </div>
                  <div className="hidden sm:flex col-span-1 items-center justify-between gap-1">
                    <span className="text-xs text-gray-400">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-orange-400" />
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Pagination */}
      {total > 20 && (
        <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
          <span>Page {page} of {Math.ceil(total / 20)}</span>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setFilter('page', page - 1)}
              className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
            >
              Prev
            </button>
            <button
              disabled={page >= Math.ceil(total / 20)}
              onClick={() => setFilter('page', page + 1)}
              className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
