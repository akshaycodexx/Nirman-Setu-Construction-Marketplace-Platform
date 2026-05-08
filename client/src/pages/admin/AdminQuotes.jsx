import { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import AdminLayout from '../../components/AdminLayout';
import { MessageSquare, ChevronDown, ChevronUp, Clock, CheckCircle, Ban, Loader2, RefreshCw, Filter } from 'lucide-react';
import useT from '../../i18n/useT';

const STATUS_STYLE = {
  open:      'bg-green-100 text-green-700',
  accepted:  'bg-blue-100 text-blue-700',
  cancelled: 'bg-red-100 text-red-700',
  expired:   'bg-gray-100 text-gray-500',
};

const QUOTE_STATUS_STYLE = {
  active:    'bg-green-100 text-green-700',
  countered: 'bg-yellow-100 text-yellow-700',
  accepted:  'bg-blue-100 text-blue-700',
  rejected:  'bg-red-100 text-red-700',
};

const UNIT_LABEL = { ton: 'Ton', bag: 'Bag', piece: 'Piece', truck: 'Truck', cubic_meter: 'Cu.M', kg: 'KG', litre: 'Ltr', sqft: 'Sqft' };

function RequestRow({ request }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-gray-100 rounded-2xl overflow-hidden bg-white">
      <button onClick={() => setExpanded(e => !e)}
        className="w-full flex items-start justify-between px-5 py-4 hover:bg-gray-50 transition-colors text-left">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-gray-900">{request.material}</span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${STATUS_STYLE[request.status] || 'bg-gray-100 text-gray-500'}`}>
              {request.status}
            </span>
            {request.quotes?.length > 0 && (
              <span className="text-xs bg-orange-100 text-orange-700 font-semibold px-2 py-0.5 rounded-full">
                {request.quotes.length} quote{request.quotes.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500">
            {request.quantity} {UNIT_LABEL[request.unit] || request.unit} · {request.city}
            · <span className="font-mono text-xs text-gray-400">{request.requestId}</span>
          </p>
          <p className="text-xs text-gray-400">
            {request.customerName} · {new Date(request.createdAt).toLocaleDateString('en-IN')}
            {request.convertedOrderId && (
              <span className="ml-2 text-blue-500 font-semibold">→ Order: {request.convertedOrderId}</span>
            )}
          </p>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-gray-400 shrink-0 mt-1" /> : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0 mt-1" />}
      </button>

      {expanded && (
        <div className="px-5 pb-5 border-t border-gray-50 space-y-3">
          <div className="grid grid-cols-2 gap-3 pt-3 text-sm">
            <div>
              <p className="text-xs text-gray-400">Customer</p>
              <p className="font-medium text-gray-800">{request.customerName}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Required By</p>
              <p className="font-medium text-gray-800">{new Date(request.requiredBy).toLocaleDateString('en-IN')}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Address</p>
              <p className="font-medium text-gray-800">{request.address}, {request.city} {request.pincode}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Budget</p>
              <p className="font-medium text-gray-800">{request.budget ? `₹${request.budget.toLocaleString('en-IN')}` : '—'}</p>
            </div>
            {request.description && (
              <div className="col-span-2">
                <p className="text-xs text-gray-400">Notes</p>
                <p className="font-medium text-gray-800">{request.description}</p>
              </div>
            )}
          </div>

          {request.quotes?.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Quotes Submitted</p>
              {request.quotes.map(q => (
                <div key={q._id || q.quoteId} className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2.5">
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">{q.supplierName}</p>
                    <p className="text-xs text-gray-500">₹{q.currentPrice?.toLocaleString('en-IN')} total</p>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full capitalize ${QUOTE_STATUS_STYLE[q.status] || 'bg-gray-100 text-gray-500'}`}>
                    {q.status === 'countered' ? 'Counter Chal Raha' : q.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function AdminQuotes() {
  const t = useT();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);

  const load = (p = 1, status = statusFilter) => {
    setLoading(true);
    const params = { page: p };
    if (status) params.status = status;
    axios.get('/api/quotes/admin/all', {
      headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` },
      params,
    })
      .then(r => {
        setRequests(r.data.requests || []);
        setTotal(r.data.total || 0);
        setPages(r.data.pages || 1);
        setPage(p);
      })
      .catch(() => toast.error(t('admin.common.loadFailed')))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleFilter = (s) => {
    setStatusFilter(s);
    load(1, s);
  };

  // Stats
  const openCount     = requests.filter(r => r.status === 'open').length;
  const acceptedCount = requests.filter(r => r.status === 'accepted').length;
  const totalQuotes   = requests.reduce((s, r) => s + (r.quotes?.length || 0), 0);

  return (
    <AdminLayout>
      <div className="space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{t('admin.nav.quotes')}</h1>
            <p className="text-sm text-gray-500 mt-0.5">{t('admin.quotes.sub')}</p>
          </div>
          <button onClick={() => load(1)}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 bg-white border border-gray-200 px-3 py-2 rounded-xl transition-colors">
            <RefreshCw className="w-4 h-4" /> {t('admin.common.refresh')}
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: t('admin.quotes.totalRequests'), value: total, color: 'text-gray-900' },
            { label: t('admin.quotes.open'), value: openCount, color: 'text-green-600' },
            { label: t('admin.quotes.accepted'), value: acceptedCount, color: 'text-blue-600' },
            { label: t('admin.quotes.submitted'), value: totalQuotes, color: 'text-orange-600' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-4">
              <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filter */}
        <div className="flex gap-2 flex-wrap">
          {[['', 'Sab'], ['open', 'Open'], ['accepted', 'Accepted'], ['expired', 'Expired'], ['cancelled', 'Cancelled']].map(([val, label]) => (
            <button key={val} onClick={() => handleFilter(val)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${
                statusFilter === val
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}>
              {label}
            </button>
          ))}
        </div>

        {/* List */}
        {loading ? (
          <div className="py-16 text-center">
            <Loader2 className="w-6 h-6 text-gray-400 animate-spin mx-auto" />
          </div>
        ) : requests.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-2xl border border-gray-100">
            <MessageSquare className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">{t('admin.quotes.empty')}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {requests.map(r => <RequestRow key={r._id} request={r} />)}
          </div>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <button disabled={page <= 1} onClick={() => load(page - 1)}
              className="px-3 py-1.5 rounded-xl text-sm border border-gray-200 disabled:opacity-40 hover:bg-gray-50">
              ← Prev
            </button>
            <span className="text-sm text-gray-500">Page {page} of {pages}</span>
            <button disabled={page >= pages} onClick={() => load(page + 1)}
              className="px-3 py-1.5 rounded-xl text-sm border border-gray-200 disabled:opacity-40 hover:bg-gray-50">
              Next →
            </button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
