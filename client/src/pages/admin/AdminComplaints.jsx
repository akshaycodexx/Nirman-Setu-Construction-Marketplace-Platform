import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import AdminLayout from '../../components/AdminLayout';
import { StatusBadge } from '../../components/AdminLayout';
import { AlertTriangle, CheckCircle, Clock, ArrowRight, Loader2, X, MessageSquare } from 'lucide-react';

function ResolveModal({ order, onClose, onResolved }) {
  const [resolution, setResolution] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await axios.put(`/api/admin/orders/${order.orderId}/complaint/resolve`, { resolution });
      toast.success('Complaint resolved!');
      onResolved(data.order);
      onClose();
    } catch {
      toast.error('Failed to resolve complaint');
    }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-gray-900 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" /> Resolve Complaint
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        </div>

        <div className="bg-red-50 border border-red-100 rounded-xl p-3 mb-4 text-sm">
          <p className="text-xs font-semibold text-red-500 uppercase tracking-wider mb-1">Complaint</p>
          <p className="text-gray-800">{order.complaint?.text}</p>
          <p className="text-xs text-gray-400 mt-1">
            {order.customer?.name} · {order.orderId} · {new Date(order.complaint?.raisedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Resolution Note</label>
            <textarea
              value={resolution}
              onChange={e => setResolution(e.target.value)}
              placeholder="Explain what action was taken..."
              rows={3}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
            />
          </div>
          <button type="submit" disabled={saving}
            className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors flex items-center justify-center gap-2">
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Resolving...</> : <><CheckCircle className="w-4 h-4" /> Mark Resolved</>}
          </button>
        </form>
      </div>
    </div>
  );
}

const TABS = [
  { key: '', label: 'All' },
  { key: 'open', label: 'Open' },
  { key: 'resolved', label: 'Resolved' },
];

export default function AdminComplaints() {
  const [orders, setOrders] = useState([]);
  const [summary, setSummary] = useState({ open: 0, resolved: 0 });
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('open');
  const [modalOrder, setModalOrder] = useState(null);

  const fetchComplaints = useCallback(async () => {
    setLoading(true);
    try {
      const q = tab ? `?status=${tab}` : '';
      const { data } = await axios.get(`/api/admin/complaints${q}`);
      setOrders(data.orders);
      setSummary(data.summary);
    } catch {}
    setLoading(false);
  }, [tab]);

  useEffect(() => { fetchComplaints(); }, [fetchComplaints]);

  const handleResolved = (updatedOrder) => {
    setOrders(prev => prev.map(o => o._id === updatedOrder._id ? updatedOrder : o));
    fetchComplaints();
  };

  return (
    <AdminLayout>
      {modalOrder && (
        <ResolveModal
          order={modalOrder}
          onClose={() => setModalOrder(null)}
          onResolved={handleResolved}
        />
      )}

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <AlertTriangle className="w-6 h-6 text-orange-500" /> Complaints
        </h1>
        <p className="text-gray-500 text-sm mt-0.5">Manage and resolve customer complaints</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
        <div className="bg-red-50 border border-red-100 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-red-600 uppercase tracking-wider">Open Complaints</span>
            <Clock className="w-4 h-4 text-red-400" />
          </div>
          <p className="text-3xl font-black text-red-700">{summary.open}</p>
          <p className="text-sm text-red-500 mt-1">{summary.open === 1 ? 'complaint' : 'complaints'} awaiting resolution</p>
        </div>
        <div className="bg-green-50 border border-green-100 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-green-600 uppercase tracking-wider">Resolved</span>
            <CheckCircle className="w-4 h-4 text-green-400" />
          </div>
          <p className="text-3xl font-black text-green-700">{summary.resolved}</p>
          <p className="text-sm text-green-500 mt-1">{summary.resolved === 1 ? 'complaint' : 'complaints'} resolved</p>
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
        <div className="hidden sm:grid grid-cols-12 px-5 py-2.5 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wide">
          <div className="col-span-2">Order</div>
          <div className="col-span-2">Customer</div>
          <div className="col-span-3">Complaint</div>
          <div className="col-span-2">Supplier</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-1">Action</div>
        </div>

        {loading ? (
          <div className="divide-y">{[...Array(5)].map((_, i) => <div key={i} className="h-16 animate-pulse bg-gray-50" />)}</div>
        ) : orders.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p>Koi complaint nahi mili</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {orders.map(order => {
              const isOpen = order.complaint?.status === 'open';
              return (
                <div key={order._id} className={`grid grid-cols-12 items-start px-5 py-4 gap-2 ${isOpen ? 'bg-red-50/20' : ''}`}>
                  {/* Order */}
                  <div className="col-span-6 sm:col-span-2">
                    <Link to={`/admin/orders/${order.orderId}`}
                      className="font-mono text-sm font-bold text-gray-900 hover:text-orange-600 transition-colors flex items-center gap-1">
                      {order.orderId} <ArrowRight className="w-3 h-3 opacity-40" />
                    </Link>
                    <p className="text-xs text-gray-400 mt-0.5 capitalize">{order.category}</p>
                    <div className="mt-1"><StatusBadge status={order.status} /></div>
                  </div>

                  {/* Customer */}
                  <div className="hidden sm:block col-span-2">
                    <p className="text-sm font-medium text-gray-800">{order.customer?.name}</p>
                    <p className="text-xs text-gray-400">{order.delivery?.city}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(order.complaint?.raisedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </p>
                  </div>

                  {/* Complaint text */}
                  <div className="hidden sm:block col-span-3">
                    <p className="text-sm text-gray-700 line-clamp-2">{order.complaint?.text}</p>
                    {order.complaint?.resolution && (
                      <p className="text-xs text-green-600 mt-1 italic line-clamp-1">✓ {order.complaint.resolution}</p>
                    )}
                  </div>

                  {/* Supplier */}
                  <div className="hidden sm:block col-span-2">
                    <p className="text-sm text-gray-700">{order.supplierId?.name || '—'}</p>
                    {order.supplierId?.businessName && (
                      <p className="text-xs text-gray-400">{order.supplierId.businessName}</p>
                    )}
                  </div>

                  {/* Status */}
                  <div className="col-span-4 sm:col-span-2">
                    {isOpen ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 bg-red-50 px-2 py-1 rounded-full">
                        <Clock className="w-3 h-3" /> Open
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                        <CheckCircle className="w-3 h-3" /> Resolved
                      </span>
                    )}
                  </div>

                  {/* Action */}
                  <div className="hidden sm:flex col-span-1 justify-end">
                    {isOpen && (
                      <button
                        onClick={() => setModalOrder(order)}
                        className="flex items-center gap-1 bg-green-50 hover:bg-green-100 text-green-700 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap"
                      >
                        <CheckCircle className="w-3 h-3" /> Resolve
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
