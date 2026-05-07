import { useEffect, useState } from 'react';
import axios from 'axios';
import AdminLayout from '../../components/AdminLayout';
import {
  Hammer, Zap, Wrench, Paintbrush, HardHat, Scissors, Layers, MoreHorizontal,
  MapPin, Calendar, Users, Clock, IndianRupee, ChevronDown, ChevronUp, Loader2
} from 'lucide-react';

const JOB_TYPES = [
  { value: 'mason',        label: 'Raj Mistri',   icon: HardHat,        color: 'bg-orange-100 text-orange-700' },
  { value: 'carpenter',    label: 'Badhai',        icon: Hammer,         color: 'bg-amber-100 text-amber-700' },
  { value: 'electrician',  label: 'Bijli Wala',    icon: Zap,            color: 'bg-yellow-100 text-yellow-700' },
  { value: 'plumber',      label: 'Nali Wala',     icon: Wrench,         color: 'bg-blue-100 text-blue-700' },
  { value: 'painter',      label: 'Rang Wala',     icon: Paintbrush,     color: 'bg-purple-100 text-purple-700' },
  { value: 'welder',       label: 'Welder',        icon: Scissors,       color: 'bg-red-100 text-red-700' },
  { value: 'tiles',        label: 'Tiles Wala',    icon: Layers,         color: 'bg-teal-100 text-teal-700' },
  { value: 'other',        label: 'Other',         icon: MoreHorizontal, color: 'bg-gray-100 text-gray-700' },
];

function JobTypeBadge({ type }) {
  const jt = JOB_TYPES.find(j => j.value === type);
  if (!jt) return null;
  const Icon = jt.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-semibold text-xs ${jt.color}`}>
      <Icon className="w-3 h-3" /> {jt.label}
    </span>
  );
}

const STATUS_COLOR = {
  open: 'bg-green-100 text-green-700',
  accepted: 'bg-blue-100 text-blue-700',
  cancelled: 'bg-red-100 text-red-700',
  expired: 'bg-gray-100 text-gray-500',
};

function RequestRow({ request }) {
  const [expanded, setExpanded] = useState(false);
  const quotesCount = request.quotes?.length || 0;

  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden">
      <div className="flex items-start gap-3 p-4 bg-white hover:bg-gray-50 cursor-pointer" onClick={() => setExpanded(e => !e)}>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <JobTypeBadge type={request.jobType} />
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${STATUS_COLOR[request.status] || 'bg-gray-100 text-gray-500'}`}>
              {request.status}
            </span>
            {quotesCount > 0 && (
              <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                {quotesCount} bid{quotesCount !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          <p className="font-semibold text-gray-900 text-sm">{request.jobTitle}</p>
          <div className="flex items-center gap-3 flex-wrap mt-1">
            <span className="text-xs text-gray-500 font-medium">{request.customerName}</span>
            <span className="flex items-center gap-1 text-xs text-gray-400"><MapPin className="w-3 h-3" />{request.city}</span>
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <Calendar className="w-3 h-3" />{new Date(request.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
            <span className="flex items-center gap-1 text-xs text-gray-400"><Users className="w-3 h-3" />{request.workersNeeded} worker{request.workersNeeded > 1 ? 's' : ''}</span>
            {request.estimatedDays && (
              <span className="flex items-center gap-1 text-xs text-gray-400"><Clock className="w-3 h-3" />{request.estimatedDays} days</span>
            )}
          </div>
          {request.budget && (
            <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
              <IndianRupee className="w-3 h-3" />
              Budget: ₹{Number(request.budget).toLocaleString('en-IN')} ({request.budgetType === 'per_day' ? 'per day' : 'fixed'})
            </p>
          )}
        </div>
        <div className="shrink-0 text-gray-400">
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </div>

      {expanded && (
        <div className="border-t border-gray-100 bg-gray-50 p-4 space-y-2">
          {request.description && (
            <p className="text-xs text-gray-600 italic">"{request.description}"</p>
          )}
          <p className="text-xs text-gray-500">Address: {request.address}{request.pincode && `, ${request.pincode}`}</p>
          <p className="text-xs text-gray-400">Posted: {new Date(request.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
          <p className="text-xs text-gray-400">Expires: {new Date(request.expiresAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>

          {quotesCount > 0 && (
            <div className="mt-3">
              <p className="text-xs font-semibold text-gray-700 mb-2">Bids Received:</p>
              <div className="space-y-2">
                {request.quotes.map((q, i) => (
                  <div key={i} className="bg-white border border-gray-100 rounded-xl p-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{q.supplierName}</p>
                      <p className="text-xs text-gray-500">₹{q.ratePerDay}/day/worker</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900">₹{q.totalAmount?.toLocaleString('en-IN')}</p>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${STATUS_COLOR[q.status] || 'bg-gray-100 text-gray-500'}`}>
                        {q.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function AdminLabour() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);

  const token = localStorage.getItem('adminToken');
  const authHeader = { Authorization: `Bearer ${token}` };

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const params = { page };
      if (statusFilter) params.status = statusFilter;
      const { data } = await axios.get('/api/labour/admin/all', { headers: authHeader, params });
      setRequests(data.requests || []);
      setTotal(data.total || 0);
      setPages(data.pages || 1);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRequests(); }, [statusFilter, page]);

  const openCount = requests.filter(r => r.status === 'open').length;
  const acceptedCount = requests.filter(r => r.status === 'accepted').length;
  const totalBids = requests.reduce((s, r) => s + (r.quotes?.length || 0), 0);

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">Labour Requests</h1>
            <p className="text-gray-400 text-sm">Karigar booking requests — customer se contractor tak</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total', value: total, color: 'text-white' },
            { label: 'Open', value: openCount, color: 'text-green-400' },
            { label: 'Accepted', value: acceptedCount, color: 'text-blue-400' },
            { label: 'Total Bids', value: totalBids, color: 'text-orange-400' },
          ].map(s => (
            <div key={s.label} className="bg-gray-800 rounded-2xl p-4 border border-gray-700">
              <p className="text-gray-400 text-xs">{s.label}</p>
              <p className={`text-2xl font-black mt-1 ${s.color}`}>{loading ? '—' : s.value}</p>
            </div>
          ))}
        </div>

        {/* Filter */}
        <div className="flex gap-2 flex-wrap">
          {['', 'open', 'accepted', 'cancelled', 'expired'].map(s => (
            <button key={s}
              onClick={() => { setStatusFilter(s); setPage(1); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                statusFilter === s
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-800 text-gray-400 border border-gray-700 hover:border-gray-500'
              }`}>
              {s || 'All'}
            </button>
          ))}
        </div>

        {/* Requests list */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
          </div>
        ) : requests.length === 0 ? (
          <div className="bg-gray-800 rounded-2xl border border-gray-700 py-16 text-center">
            <HardHat className="w-10 h-10 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">Koi labour request nahi</p>
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map(r => <RequestRow key={r._id} request={r} />)}
          </div>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex justify-center gap-2">
            {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)}
                className={`w-8 h-8 rounded-lg text-sm font-semibold ${
                  page === p ? 'bg-blue-500 text-white' : 'bg-gray-800 text-gray-400 border border-gray-700 hover:border-gray-500'
                }`}>
                {p}
              </button>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
