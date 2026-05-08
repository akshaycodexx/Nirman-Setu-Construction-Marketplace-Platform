import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import AdminLayout from '../../components/AdminLayout';
import { Wallet, CheckCircle, Clock, IndianRupee, ArrowRight, Loader2, X } from 'lucide-react';
import useT from '../../i18n/useT';

function PayoutModal({ order, onClose, onPaid }) {
  const [amount, setAmount] = useState(order.payment?.advanceAmount || '');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) { toast.error('Amount daalo'); return; }
    setSaving(true);
    try {
      const { data } = await axios.patch(`/api/admin/orders/${order.orderId}/supplier-payout`, {
        amount: Number(amount), note,
      });
      toast.success('Supplier payout marked!');
      onPaid(data.order);
      onClose();
    } catch { toast.error('Failed to mark payout'); }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-gray-900 flex items-center gap-2">
            <Wallet className="w-4 h-4 text-orange-500" /> Mark Supplier Paid
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        </div>
        <div className="bg-gray-50 rounded-xl p-3 mb-4 text-sm space-y-1">
          <div className="flex justify-between">
            <span className="text-gray-500">Order</span>
            <span className="font-mono font-bold text-gray-800">{order.orderId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Supplier</span>
            <span className="font-medium text-gray-800">{order.supplierId?.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Advance Received</span>
            <span className="font-medium text-gray-800">₹{order.payment?.advanceAmount?.toLocaleString('en-IN') || '—'}</span>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Amount to Pay Supplier (₹) *</label>
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="e.g. 5000"
              required
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Payment Reference (optional)</label>
            <input
              type="text"
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="UPI Ref / NEFT / Cash"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>
          <button type="submit" disabled={saving || !amount}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors flex items-center justify-center gap-2">
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><CheckCircle className="w-4 h-4" /> Mark as Paid</>}
          </button>
        </form>
      </div>
    </div>
  );
}

const TABS = [
  { key: '', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'paid', label: 'Paid' },
];

export default function AdminPayouts() {
  const t = useT();
  const [orders, setOrders] = useState([]);
  const [summary, setSummary] = useState({ pending: { count: 0, total: 0 }, paid: { count: 0, total: 0 } });
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('pending');
  const [modalOrder, setModalOrder] = useState(null);

  const fetchPayouts = useCallback(async () => {
    setLoading(true);
    try {
      const q = tab ? `?status=${tab}` : '';
      const { data } = await axios.get(`/api/admin/payouts${q}`);
      setOrders(data.orders);
      setSummary(data.summary);
    } catch {}
    setLoading(false);
  }, [tab]);

  useEffect(() => { fetchPayouts(); }, [fetchPayouts]);

  const handlePaid = (updatedOrder) => {
    setOrders(prev => prev.map(o => o._id === updatedOrder._id ? updatedOrder : o));
    fetchPayouts();
  };

  return (
    <AdminLayout>
      {modalOrder && (
        <PayoutModal
          order={modalOrder}
          onClose={() => setModalOrder(null)}
          onPaid={handlePaid}
        />
      )}

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Wallet className="w-6 h-6 text-orange-500" /> {t('admin.nav.payouts')}
        </h1>
        <p className="text-gray-500 text-sm mt-0.5">{t('admin.payouts.sub')}</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
        <div className="bg-red-50 border border-red-100 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-red-600 uppercase tracking-wider">{t('admin.payouts.pending')}</span>
            <Clock className="w-4 h-4 text-red-400" />
          </div>
          <p className="text-3xl font-black text-red-700">₹{summary.pending.total.toLocaleString('en-IN')}</p>
          <p className="text-sm text-red-500 mt-1">{summary.pending.count} order{summary.pending.count !== 1 ? 's' : ''} awaiting payment</p>
        </div>
        <div className="bg-green-50 border border-green-100 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-green-600 uppercase tracking-wider">{t('admin.payouts.totalPaid')}</span>
            <CheckCircle className="w-4 h-4 text-green-400" />
          </div>
          <p className="text-3xl font-black text-green-700">₹{summary.paid.total.toLocaleString('en-IN')}</p>
          <p className="text-sm text-green-500 mt-1">{summary.paid.count} order{summary.paid.count !== 1 ? 's' : ''} settled</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-4">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-1.5 rounded-xl text-sm font-medium transition-colors ${
              tab === t.key ? 'bg-orange-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="hidden sm:grid grid-cols-12 px-5 py-2.5 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wide">
          <div className="col-span-2">Order ID</div>
          <div className="col-span-3">Supplier</div>
          <div className="col-span-2">Category</div>
          <div className="col-span-2">Advance Recv.</div>
          <div className="col-span-2">Payout</div>
          <div className="col-span-1">Action</div>
        </div>

        {loading ? (
          <div className="divide-y">{[...Array(6)].map((_, i) => <div key={i} className="h-16 animate-pulse bg-gray-50" />)}</div>
        ) : orders.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <Wallet className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p>Koi payout record nahi mila</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {orders.map(order => {
              const isPaid = order.supplierPayout?.status === 'paid';
              return (
                <div key={order._id} className={`grid grid-cols-12 items-center px-5 py-3.5 ${!isPaid ? 'bg-red-50/30' : ''}`}>
                  {/* Order ID */}
                  <div className="col-span-5 sm:col-span-2">
                    <Link to={`/admin/orders/${order.orderId}`} className="font-mono text-sm font-bold text-gray-900 hover:text-orange-600 transition-colors flex items-center gap-1">
                      {order.orderId} <ArrowRight className="w-3 h-3 opacity-40" />
                    </Link>
                    <p className="text-xs text-gray-400 mt-0.5">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                  </div>

                  {/* Supplier */}
                  <div className="hidden sm:block col-span-3">
                    <p className="text-sm font-medium text-gray-800">{order.supplierId?.name || '—'}</p>
                    {order.supplierId?.businessName && (
                      <p className="text-xs text-gray-400">{order.supplierId.businessName}</p>
                    )}
                  </div>

                  {/* Category */}
                  <div className="hidden sm:block col-span-2">
                    <span className="text-sm text-gray-600 capitalize">{order.category}</span>
                    <p className="text-xs text-gray-400">{order.delivery?.city}</p>
                  </div>

                  {/* Advance received */}
                  <div className="hidden sm:block col-span-2">
                    <p className="text-sm font-semibold text-gray-800">
                      {order.payment?.advanceAmount
                        ? `₹${order.payment.advanceAmount.toLocaleString('en-IN')}`
                        : '—'}
                    </p>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium capitalize ${
                      order.payment?.status === 'fully_paid' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                    }`}>{order.payment?.status?.replace('_', ' ')}</span>
                  </div>

                  {/* Payout status */}
                  <div className="col-span-5 sm:col-span-2 flex items-center gap-2">
                    {isPaid ? (
                      <div>
                        <div className="flex items-center gap-1 text-green-600 text-xs font-semibold">
                          <CheckCircle className="w-3.5 h-3.5" /> Paid
                        </div>
                        <p className="text-sm font-bold text-green-700">₹{order.supplierPayout.amount?.toLocaleString('en-IN')}</p>
                        {order.supplierPayout.note && (
                          <p className="text-xs text-gray-400 italic truncate max-w-[120px]">{order.supplierPayout.note}</p>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-red-500 text-xs font-semibold">
                        <Clock className="w-3.5 h-3.5" /> Pending
                      </div>
                    )}
                  </div>

                  {/* Action */}
                  <div className="hidden sm:flex col-span-1 justify-end">
                    {!isPaid && (
                      <button
                        onClick={() => setModalOrder(order)}
                        className="flex items-center gap-1 bg-orange-50 hover:bg-orange-100 text-orange-700 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-colors"
                      >
                        <IndianRupee className="w-3 h-3" /> Pay
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
