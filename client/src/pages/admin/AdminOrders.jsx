import { useEffect, useState, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import AdminLayout, { StatusBadge } from '../../components/AdminLayout';
import useT from '../../i18n/useT';

const PAYMENT_BADGE = {
  advance_paid: 'bg-blue-100 text-blue-700',
  fully_paid: 'bg-green-100 text-green-700',
};

import { ClipboardList, Search, ArrowRight, RefreshCw, Download, Flag, MapPin, ShieldAlert } from 'lucide-react';

const STATUSES = ['all', 'pending', 'quoted', 'confirmed', 'dispatched', 'delivered', 'cancelled'];
const CATEGORIES = ['all', 'material', 'transport', 'equipment'];

const RISK_CONFIG = {
  green:  { label: 'Low Risk',    cls: 'bg-green-50 text-green-700 border border-green-200' },
  yellow: { label: 'Caution',     cls: 'bg-yellow-50 text-yellow-700 border border-yellow-200' },
  red:    { label: 'High Risk',   cls: 'bg-red-50 text-red-700 border border-red-200' },
};

const RISK_ROW = {
  green:  '',
  yellow: 'border-l-4 border-l-yellow-400',
  red:    'border-l-4 border-l-red-500 bg-red-50/30',
};

export default function AdminOrders() {
  const t = useT();
  const [params, setParams] = useSearchParams();
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const status = params.get('status') || 'all';
  const category = params.get('category') || 'all';
  const search = params.get('search') || '';
  const complaints = params.get('complaints') || '';
  const risk = params.get('risk') || 'all';
  const city = params.get('city') || '';
  const page = Number(params.get('page') || 1);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams();
      if (status !== 'all') q.set('status', status);
      if (category !== 'all') q.set('category', category);
      if (complaints) q.set('complaints', complaints);
      if (search) q.set('search', search);
      if (risk !== 'all') q.set('risk', risk);
      if (city) q.set('city', city);
      q.set('page', page);
      q.set('limit', 20);
      const { data } = await axios.get(`/api/admin/orders?${q}`);
      setOrders(data.orders);
      setTotal(data.total);
    } catch {}
    setLoading(false);
  }, [status, category, search, complaints, risk, city, page]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const setFilter = (key, value) => {
    const next = new URLSearchParams(params);
    next.set(key, value);
    next.set('page', '1');
    setParams(next);
  };

  const handleExport = async () => {
    const token = localStorage.getItem('adminToken');
    const q = new URLSearchParams();
    if (status !== 'all') q.set('status', status);
    if (category !== 'all') q.set('category', category);
    const res = await fetch(`/api/admin/orders/export?${q}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nirman-setu-orders-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AdminLayout>
      <div className="mb-5 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-orange-500" /> {t('admin.nav.orders')}
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">{t('admin.orders.total', { n: total })}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 border border-gray-200 hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" /> {t('admin.orders.exportCsv')}
          </button>
          <button onClick={fetchOrders} className="text-gray-500 hover:text-gray-800 p-2 rounded-lg hover:bg-gray-100">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-4 space-y-3">
        {/* Search + City */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              defaultValue={search}
              onKeyDown={e => e.key === 'Enter' && setFilter('search', e.target.value)}
              onBlur={e => setFilter('search', e.target.value)}
              placeholder={t('admin.orders.searchPh')}
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
            />
          </div>
          <div className="relative w-40">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              defaultValue={city}
              onKeyDown={e => e.key === 'Enter' && setFilter('city', e.target.value)}
              onBlur={e => setFilter('city', e.target.value)}
              placeholder={t('admin.orders.cityPh')}
              className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
            />
          </div>
        </div>

        {/* Status tabs */}
        <div className="flex flex-wrap gap-2">
          {STATUSES.map(s => (
            <button
              key={s}
              onClick={() => { setFilter('status', s); const next = new URLSearchParams(params); next.delete('complaints'); setParams(next); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                status === s && !complaints
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {s === 'all' ? t('admin.common.all') : t(`status.${s}`)}
            </button>
          ))}
          <button
            onClick={() => { const next = new URLSearchParams(params); next.set('complaints', complaints === 'open' ? '' : 'open'); next.set('page', '1'); setParams(next); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors ${
              complaints === 'open'
                ? 'bg-red-500 text-white'
                : 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
            }`}
          >
            <Flag className="w-3 h-3" /> {t('admin.nav.complaints')}
          </button>
        </div>

        {/* Risk filter */}
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs font-medium text-gray-500 flex items-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5" /> {t('admin.common.risk')}:
          </span>
          {['all', 'green', 'yellow', 'red'].map(r => (
            <button
              key={r}
              onClick={() => setFilter('risk', r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                risk === r
                  ? r === 'all' ? 'bg-gray-900 text-white' : r === 'green' ? 'bg-green-600 text-white' : r === 'yellow' ? 'bg-yellow-500 text-white' : 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {r === 'all' ? t('admin.common.all') : t(`admin.risk.${r}`)}
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
            <p>{t('admin.orders.empty')}</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="hidden sm:grid grid-cols-12 px-5 py-2.5 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              <div className="col-span-2">{t('admin.orders.orderId')}</div>
              <div className="col-span-3">{t('admin.orders.customer')}</div>
              <div className="col-span-2">{t('admin.orders.category')}</div>
              <div className="col-span-2">{t('admin.orders.city')}</div>
              <div className="col-span-2">{t('admin.common.status')}</div>
              <div className="col-span-1">{t('admin.orders.date')}</div>
            </div>

            <div className="divide-y divide-gray-50">
              {orders.map(order => (
                <Link
                  key={order._id}
                  to={`/admin/orders/${order.orderId}`}
                  className={`grid grid-cols-12 items-center px-5 py-3.5 hover:bg-orange-50/40 transition-colors group ${RISK_ROW[order.customerRisk] || ''}`}
                >
                  <div className="col-span-5 sm:col-span-2">
                    <span className="font-mono text-sm font-bold text-gray-900">{order.orderId}</span>
                  </div>
                  <div className="hidden sm:block col-span-3">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className="text-sm font-medium text-gray-800 truncate">{order.customer?.name}</p>
                      {order.customerRisk && order.customerRisk !== 'green' && (
                        <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${RISK_CONFIG[order.customerRisk]?.cls}`}>
                          {t(`admin.risk.${order.customerRisk}`)}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400">
                      {order.customer?.phone}
                      {order.quote?.amount ? ` · ₹${order.quote.amount.toLocaleString('en-IN')}` : ''}
                    </p>
                  </div>
                  <div className="hidden sm:block col-span-2">
                    <span className="text-sm text-gray-600 capitalize">{order.category}</span>
                  </div>
                  <div className="hidden sm:block col-span-2">
                    <span className="text-sm text-gray-600">{order.delivery?.city}</span>
                    {order.delivery?.pincode && <p className="text-xs text-gray-400">{order.delivery.pincode}</p>}
                  </div>
                  <div className="col-span-5 sm:col-span-2 flex justify-end sm:justify-start flex-wrap gap-1 items-center">
                    <StatusBadge status={order.status} />
                    {PAYMENT_BADGE[order.payment?.status] && (
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${PAYMENT_BADGE[order.payment.status]}`}>
                        {order.payment.status === 'advance_paid' ? t('admin.orders.advance') : t('admin.fees.paid')}
                      </span>
                    )}
                    {order.complaint?.text && order.complaint?.status === 'open' && (
                      <span title="Open complaint" className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                    )}
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
          <span>{t('admin.common.pageOf', { page, total: Math.ceil(total / 20) })}</span>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setFilter('page', page - 1)}
              className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
            >
              {t('admin.common.prev')}
            </button>
            <button
              disabled={page >= Math.ceil(total / 20)}
              onClick={() => setFilter('page', page + 1)}
              className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
            >
              {t('common.next')}
            </button>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
