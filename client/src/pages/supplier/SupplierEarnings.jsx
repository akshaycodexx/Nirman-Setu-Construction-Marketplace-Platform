import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import SupplierLayout from '../../components/SupplierLayout';
import { useSupplier } from '../../context/SupplierContext';
import { IndianRupee, Loader2, ArrowRight, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import useT from '../../i18n/useT';

const PAY_STATUS_CLS = {
  paid: 'bg-green-100 text-green-700',
  pending: 'bg-amber-100 text-amber-700',
};

export default function SupplierEarnings() {
  const { getAuthHeaders } = useSupplier();
  const t = useT();
  const PAY_STATUS = {
    paid: { label: t('suppearnings.payPaid'), cls: PAY_STATUS_CLS.paid },
    pending: { label: t('suppearnings.payPending'), cls: PAY_STATUS_CLS.pending },
  };
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/supplier/earnings', { headers: getAuthHeaders() })
      .then(r => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const orders = data?.orders || [];
  const paidOrders = orders.filter(o => o.supplierPayout?.status === 'paid');
  const pendingOrders = orders.filter(o => o.payment?.status !== 'none' && o.supplierPayout?.status === 'pending');

  return (
    <SupplierLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <IndianRupee className="w-6 h-6 text-emerald-500" /> {t('suppearnings.title')}
        </h1>
        <p className="text-gray-500 text-sm mt-0.5">{t('suppearnings.sub')}</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-green-50 border border-green-200 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-xs font-semibold text-green-700 uppercase tracking-wide">{t('suppearnings.totalEarned')}</span>
          </div>
          <p className="text-3xl font-black text-green-800">
            {loading ? '—' : `₹${(data?.totalEarned || 0).toLocaleString('en-IN')}`}
          </p>
          <p className="text-xs text-green-600 mt-1">{t('suppearnings.paidOrders', { n: paidOrders.length })}</p>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-amber-600" />
            <span className="text-xs font-semibold text-amber-700 uppercase tracking-wide">{t('suppearnings.pendingAdmin')}</span>
          </div>
          <p className="text-3xl font-black text-amber-800">
            {loading ? '—' : `₹${(data?.totalPending || 0).toLocaleString('en-IN')}`}
          </p>
          <p className="text-xs text-amber-600 mt-1">{t('suppearnings.awaitingPayout', { n: pendingOrders.length })}</p>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-gray-600" />
            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">{t('suppearnings.totalOrders')}</span>
          </div>
          <p className="text-3xl font-black text-gray-800">{loading ? '—' : orders.length}</p>
          <p className="text-xs text-gray-500 mt-1">{t('suppearnings.lifetime')}</p>
        </div>
      </div>

      {/* Pending payouts */}
      {pendingOrders.length > 0 && (
        <div className="bg-white rounded-2xl border border-amber-200 shadow-sm overflow-hidden mb-4">
          <div className="px-5 py-4 border-b border-amber-100 bg-amber-50">
            <h2 className="font-semibold text-amber-800 flex items-center gap-2">
              <Clock className="w-4 h-4" /> {t('suppearnings.pendingPayouts', { n: pendingOrders.length })}
            </h2>
            <p className="text-xs text-amber-600 mt-0.5">{t('suppearnings.pendingNote')}</p>
          </div>
          <div className="divide-y divide-gray-50">
            {pendingOrders.map(o => (
              <Link key={o._id} to={`/supplier/orders/${o.orderId}`}
                className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 transition-colors group">
                <div className="flex-1 min-w-0">
                  <p className="font-mono font-bold text-gray-900 text-sm">{o.orderId}</p>
                  <p className="text-xs text-gray-500 capitalize mt-0.5">{o.category} · {o.delivery?.city}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-amber-700">₹{(o.payment?.advanceAmount || 0).toLocaleString('en-IN')}</p>
                  <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">Pending</span>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-emerald-400 shrink-0" />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* All earnings history */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">{t('suppearnings.payHistory')}</h2>
        </div>
        {loading ? (
          <div className="py-16 text-center"><Loader2 className="w-5 h-5 text-gray-400 animate-spin mx-auto" /></div>
        ) : orders.filter(o => o.payment?.status !== 'none').length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <IndianRupee className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p>{t('suppearnings.noPayment')}</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {orders.filter(o => o.payment?.status !== 'none').map(o => {
              const isPaid = o.supplierPayout?.status === 'paid';
              const amount = isPaid ? o.supplierPayout?.amount : o.payment?.advanceAmount;
              return (
                <Link key={o._id} to={`/supplier/orders/${o.orderId}`}
                  className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 transition-colors group">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-mono font-bold text-gray-900 text-sm">{o.orderId}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${PAY_STATUS[o.supplierPayout?.status || 'pending'].cls}`}>
                        {PAY_STATUS[o.supplierPayout?.status || 'pending'].label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 capitalize">{o.category} · {o.delivery?.city}</p>
                    {isPaid && o.supplierPayout?.paidAt && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        {t('suppearnings.paidOn', { date: new Date(o.supplierPayout.paidAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) })}
                      </p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`text-sm font-bold ${isPaid ? 'text-green-700' : 'text-amber-700'}`}>
                      ₹{(amount || 0).toLocaleString('en-IN')}
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-emerald-400 shrink-0" />
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </SupplierLayout>
  );
}
