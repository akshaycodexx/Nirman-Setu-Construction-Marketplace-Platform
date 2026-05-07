import { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useCustomer } from '../../context/CustomerContext';
import CustomerLayout from '../../components/CustomerLayout';
import {
  Plus, X, Loader2, CheckCircle, ChevronDown, ChevronUp, BadgeCheck,
  Hammer, Zap, Wrench, Paintbrush, HardHat, Scissors, Layers, MoreHorizontal,
  Calendar, MapPin, Users, Clock, IndianRupee, MessageSquare, Check, XCircle
} from 'lucide-react';

const JOB_TYPES = [
  { value: 'mason',        label: 'Raj Mistri',   icon: HardHat,     color: 'bg-orange-100 text-orange-700' },
  { value: 'carpenter',    label: 'Badhai',        icon: Hammer,      color: 'bg-amber-100 text-amber-700' },
  { value: 'electrician',  label: 'Bijli Wala',    icon: Zap,         color: 'bg-yellow-100 text-yellow-700' },
  { value: 'plumber',      label: 'Nali Wala',     icon: Wrench,      color: 'bg-blue-100 text-blue-700' },
  { value: 'painter',      label: 'Rang Wala',     icon: Paintbrush,  color: 'bg-purple-100 text-purple-700' },
  { value: 'welder',       label: 'Welder',        icon: Scissors,    color: 'bg-red-100 text-red-700' },
  { value: 'tiles',        label: 'Tiles Wala',    icon: Layers,      color: 'bg-teal-100 text-teal-700' },
  { value: 'other',        label: 'Other',         icon: MoreHorizontal, color: 'bg-gray-100 text-gray-700' },
];

const jobLabel = v => JOB_TYPES.find(j => j.value === v)?.label || v;

function JobTypeBadge({ type, size = 'sm' }) {
  const jt = JOB_TYPES.find(j => j.value === type);
  if (!jt) return null;
  const Icon = jt.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-semibold text-${size} ${jt.color}`}>
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

// ─── New Request Form ─────────────────────────────────────────────────────────

function RequestForm({ onCreated, onClose }) {
  const { authHeader } = useCustomer();
  const [form, setForm] = useState({
    jobType: '',
    jobTitle: '',
    description: '',
    workersNeeded: 1,
    estimatedDays: '',
    city: '',
    address: '',
    pincode: '',
    startDate: '',
    budgetType: 'per_day',
    budget: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.jobType || !form.jobTitle || !form.city || !form.address || !form.startDate) {
      toast.error('Sab required fields bharo');
      return;
    }
    setSubmitting(true);
    try {
      const { data } = await axios.post('/api/labour/request', form, { headers: authHeader() });
      toast.success('Labour request post ho gayi!');
      onCreated(data.request);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Request failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50">
      <div className="bg-white w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl overflow-y-auto max-h-[90vh]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 sticky top-0 bg-white">
          <h2 className="font-bold text-gray-900">Karigar Request Post Karo</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100"><X className="w-4 h-4 text-gray-500" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Job Type Grid */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-2">Kaam ka Type *</label>
            <div className="grid grid-cols-4 gap-2">
              {JOB_TYPES.map(jt => {
                const Icon = jt.icon;
                const sel = form.jobType === jt.value;
                return (
                  <button type="button" key={jt.value}
                    onClick={() => set('jobType', jt.value)}
                    className={`flex flex-col items-center gap-1 p-2 rounded-xl border-2 text-xs font-medium transition-all ${
                      sel ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}>
                    <Icon className={`w-5 h-5 ${sel ? 'text-blue-500' : 'text-gray-500'}`} />
                    {jt.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Job Title *</label>
            <input value={form.jobTitle} onChange={e => set('jobTitle', e.target.value)}
              placeholder="e.g. 3 BHK complete wiring, bathroom tiles fitting..."
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Kaam ka Description</label>
            <textarea value={form.description} onChange={e => set('description', e.target.value)}
              placeholder="Kaam ki details batao — area, existing condition, etc."
              rows={2}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Workers Chahiye</label>
              <input type="number" min={1} value={form.workersNeeded} onChange={e => set('workersNeeded', e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Estimate Days</label>
              <input type="number" min={1} value={form.estimatedDays} onChange={e => set('estimatedDays', e.target.value)}
                placeholder="kitne din?"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Shuru Kab? *</label>
            <input type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">City *</label>
            <input value={form.city} onChange={e => set('city', e.target.value)}
              placeholder="Patna, Muzaffarpur..."
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Address *</label>
            <input value={form.address} onChange={e => set('address', e.target.value)}
              placeholder="Ghar ka address"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Budget (Optional)</label>
            <div className="flex gap-2">
              <select value={form.budgetType} onChange={e => set('budgetType', e.target.value)}
                className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
                <option value="per_day">Per Day</option>
                <option value="fixed">Fixed Total</option>
              </select>
              <input type="number" value={form.budget} onChange={e => set('budget', e.target.value)}
                placeholder="₹ amount"
                className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
          </div>

          <button type="submit" disabled={submitting}
            className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white font-semibold py-3 rounded-xl text-sm transition-colors">
            {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Posting...</> : <><Plus className="w-4 h-4" /> Post Karigar Request</>}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Counter Modal ────────────────────────────────────────────────────────────

function CounterModal({ quote, onClose, onDone }) {
  const { authHeader } = useCustomer();
  const [price, setPrice] = useState(quote.currentRate || quote.totalAmount);
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!price || price <= 0) { toast.error('Valid price daalo'); return; }
    setSubmitting(true);
    try {
      await axios.post(`/api/labour/${quote.quoteId}/counter`, { price: Number(price), note }, { headers: authHeader() });
      toast.success('Counter offer bheja!');
      onDone();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Counter failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white w-full max-w-sm rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900">Counter Offer</h3>
          <button onClick={onClose}><X className="w-4 h-4 text-gray-400" /></button>
        </div>
        <p className="text-xs text-gray-500 mb-3">
          {quote.supplierName} ka offer: ₹{quote.currentRate?.toLocaleString('en-IN')}
        </p>
        <div className="mb-3">
          <label className="block text-xs font-semibold text-gray-600 mb-1">Aapka Price (₹)</label>
          <input type="number" value={price} onChange={e => setPrice(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
        </div>
        <div className="mb-4">
          <label className="block text-xs font-semibold text-gray-600 mb-1">Note (Optional)</label>
          <input value={note} onChange={e => setNote(e.target.value)}
            placeholder="Kuch kehna hai?"
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
        </div>
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 border border-gray-200 text-gray-600 font-semibold py-2.5 rounded-xl text-sm hover:bg-gray-50">Cancel</button>
          <button onClick={handleSubmit} disabled={submitting}
            className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white font-semibold py-2.5 rounded-xl text-sm flex items-center justify-center gap-1">
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send Counter'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Quote Card ───────────────────────────────────────────────────────────────

function QuoteCard({ quote, request, onAccept, onCounter }) {
  const [expanded, setExpanded] = useState(false);
  const isAccepted = quote.status === 'accepted';
  const isRejected = quote.status === 'rejected';
  const isCountered = quote.status === 'countered';

  return (
    <div className={`rounded-xl border p-4 ${isAccepted ? 'border-green-300 bg-green-50' : isRejected ? 'border-gray-100 bg-gray-50 opacity-60' : isCountered ? 'border-orange-200 bg-orange-50' : 'border-gray-100 bg-white'}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <p className="font-semibold text-gray-900 text-sm">{quote.supplierName}</p>
            {quote.verifiedBadge && (
              <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full">
                <BadgeCheck className="w-2.5 h-2.5" /> Verified
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500">
            ₹{quote.ratePerDay?.toLocaleString('en-IN')}/worker/day
            {quote.totalWorkers > 1 && ` × ${quote.totalWorkers} workers`}
            {quote.totalDays && ` × ${quote.totalDays} days`}
          </p>
        </div>
        <div className="text-right shrink-0 ml-3">
          <p className="text-lg font-black text-gray-900">₹{quote.currentRate?.toLocaleString('en-IN')}</p>
          <p className="text-xs text-gray-400">Total</p>
        </div>
      </div>

      {isCountered && (
        <div className="mt-2 text-xs text-orange-700 bg-orange-100 rounded-lg px-3 py-1.5">
          Counter offer pending — supplier se response ka wait karo
        </div>
      )}

      {quote.notes && (
        <p className="text-xs text-gray-500 mt-2 italic">"{quote.notes}"</p>
      )}

      {/* Negotiation history */}
      {quote.negotiation?.length > 1 && (
        <button onClick={() => setExpanded(e => !e)}
          className="mt-2 text-xs text-blue-500 flex items-center gap-1">
          Negotiation history {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
      )}
      {expanded && (
        <div className="mt-2 space-y-1">
          {quote.negotiation.map((n, i) => (
            <div key={i} className={`text-xs px-2.5 py-1.5 rounded-lg ${n.by === 'customer' ? 'bg-blue-50 text-blue-700 ml-4' : 'bg-gray-100 text-gray-700 mr-4'}`}>
              <span className="font-semibold capitalize">{n.by}:</span> ₹{n.price?.toLocaleString('en-IN')}
              {n.note && <span className="ml-1 opacity-75">— {n.note}</span>}
            </div>
          ))}
        </div>
      )}

      {/* Action buttons */}
      {!isAccepted && !isRejected && !isCountered && request.status === 'open' && (
        <div className="flex gap-2 mt-3">
          <button onClick={() => onCounter(quote)}
            className="flex-1 border border-orange-300 text-orange-600 font-semibold py-2 rounded-lg text-xs hover:bg-orange-50 transition-colors">
            Counter
          </button>
          <button onClick={() => onAccept(quote.quoteId)}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 rounded-lg text-xs transition-colors flex items-center justify-center gap-1">
            <CheckCircle className="w-3.5 h-3.5" /> Accept
          </button>
        </div>
      )}
      {isAccepted && (
        <div className="mt-3 flex items-center gap-2 text-green-700 text-xs font-semibold">
          <CheckCircle className="w-4 h-4" /> Ye quote accept kiya! Contractor se directly contact karo.
        </div>
      )}
    </div>
  );
}

// ─── Request Card ─────────────────────────────────────────────────────────────

function RequestCard({ request, onAccept, onCounter, onCancel, onRefresh }) {
  const [expanded, setExpanded] = useState(false);
  const quotesCount = request.quotes?.length || 0;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <JobTypeBadge type={request.jobType} />
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${STATUS_COLOR[request.status] || 'bg-gray-100 text-gray-500'}`}>
                {request.status}
              </span>
              {request.status === 'accepted' && (
                <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">Deal Done ✓</span>
              )}
            </div>
            <p className="font-semibold text-gray-900 text-sm">{request.jobTitle}</p>
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <MapPin className="w-3 h-3" /> {request.city}
              </span>
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <Calendar className="w-3 h-3" /> {new Date(request.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
              </span>
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <Users className="w-3 h-3" /> {request.workersNeeded} worker{request.workersNeeded > 1 ? 's' : ''}
              </span>
              {request.estimatedDays && (
                <span className="flex items-center gap-1 text-xs text-gray-500">
                  <Clock className="w-3 h-3" /> {request.estimatedDays} days
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {quotesCount > 0 && (
              <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">
                {quotesCount} bid{quotesCount > 1 ? 's' : ''}
              </span>
            )}
            {request.status === 'open' && (
              <button onClick={() => onCancel(request.requestId)}
                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                <XCircle className="w-4 h-4" />
              </button>
            )}
            <button onClick={() => setExpanded(e => !e)}
              className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {request.budget && (
          <div className="mt-2 flex items-center gap-1 text-xs text-gray-500">
            <IndianRupee className="w-3 h-3" />
            Budget: ₹{Number(request.budget).toLocaleString('en-IN')} ({request.budgetType === 'per_day' ? 'per day' : 'fixed'})
          </div>
        )}
      </div>

      {/* Quotes section */}
      {expanded && (
        <div className="border-t border-gray-100 p-4 space-y-3">
          {quotesCount === 0 ? (
            <p className="text-center text-gray-400 text-sm py-4">Abhi koi bid nahi aayi — thoda wait karo</p>
          ) : (
            request.quotes.map(q => (
              <QuoteCard key={q._id || q.quoteId}
                quote={q}
                request={request}
                onAccept={(qid) => onAccept(qid, request.requestId, onRefresh)}
                onCounter={(q) => onCounter(q, onRefresh)}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function CustomerLabour() {
  const { authHeader } = useCustomer();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [counterTarget, setCounterTarget] = useState(null);

  const fetchRequests = async () => {
    try {
      const { data } = await axios.get('/api/labour/my-requests', { headers: authHeader() });
      setRequests(data.requests || []);
    } catch {
      toast.error('Load nahi ho saka');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRequests(); }, []);

  const handleCreated = (newRequest) => {
    setRequests(prev => [{ ...newRequest, quotes: [] }, ...prev]);
  };

  const handleAccept = async (quoteId, requestId, refresh) => {
    if (!window.confirm('Ye quote accept karoge? Baaki sab reject ho jayenge.')) return;
    try {
      await axios.post(`/api/labour/${quoteId}/accept`, {}, { headers: authHeader() });
      toast.success('Karigar book ho gaya!');
      fetchRequests();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Accept failed');
    }
  };

  const handleCancel = async (requestId) => {
    if (!window.confirm('Ye labour request cancel karoge?')) return;
    try {
      await axios.put(`/api/labour/requests/${requestId}/cancel`, {}, { headers: authHeader() });
      toast.success('Request cancel ho gayi');
      fetchRequests();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cancel failed');
    }
  };

  const openCount = requests.filter(r => r.status === 'open').length;
  const acceptedCount = requests.filter(r => r.status === 'accepted').length;
  const totalBids = requests.reduce((s, r) => s + (r.quotes?.length || 0), 0);

  return (
    <CustomerLayout>
      <div className="max-w-2xl mx-auto space-y-5">

        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl p-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">Karigar Booking</h1>
              <p className="text-orange-100 text-sm mt-0.5">Mason, Carpenter, Electrician — sab yahan milenge</p>
            </div>
            <button onClick={() => setShowForm(true)}
              className="flex items-center gap-2 bg-white text-orange-600 font-semibold text-sm px-4 py-2 rounded-xl hover:bg-orange-50 transition-colors shrink-0">
              <Plus className="w-4 h-4" /> Post Job
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="bg-white/20 rounded-xl p-3 text-center">
              <p className="text-2xl font-black">{openCount}</p>
              <p className="text-xs text-orange-100">Open</p>
            </div>
            <div className="bg-white/20 rounded-xl p-3 text-center">
              <p className="text-2xl font-black">{totalBids}</p>
              <p className="text-xs text-orange-100">Total Bids</p>
            </div>
            <div className="bg-white/20 rounded-xl p-3 text-center">
              <p className="text-2xl font-black">{acceptedCount}</p>
              <p className="text-xs text-orange-100">Booked</p>
            </div>
          </div>
        </div>

        {/* How it works */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <p className="text-xs font-bold text-amber-800 mb-2">Kaise Kaam Karta Hai?</p>
          <div className="grid grid-cols-3 gap-3">
            {[
              { step: '1', text: 'Job post karo — kaam ka type, city, date batao' },
              { step: '2', text: 'Contractors apni rate se bid karenge' },
              { step: '3', text: 'Best wala choose karo, deal karo!' },
            ].map(s => (
              <div key={s.step} className="text-center">
                <div className="w-7 h-7 bg-amber-500 text-white rounded-full flex items-center justify-center text-xs font-bold mx-auto mb-1">{s.step}</div>
                <p className="text-xs text-amber-700">{s.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Requests */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
          </div>
        ) : requests.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 py-16 text-center">
            <HardHat className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">Koi labour request nahi abhi</p>
            <p className="text-gray-400 text-sm mt-1">Pehli job post karo!</p>
            <button onClick={() => setShowForm(true)}
              className="mt-4 inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors">
              <Plus className="w-4 h-4" /> Post Karigar Request
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map(r => (
              <RequestCard
                key={r._id}
                request={r}
                onAccept={handleAccept}
                onCounter={(q) => setCounterTarget(q)}
                onCancel={handleCancel}
                onRefresh={fetchRequests}
              />
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <RequestForm onCreated={handleCreated} onClose={() => setShowForm(false)} />
      )}

      {counterTarget && (
        <CounterModal
          quote={counterTarget}
          onClose={() => setCounterTarget(null)}
          onDone={fetchRequests}
        />
      )}
    </CustomerLayout>
  );
}
