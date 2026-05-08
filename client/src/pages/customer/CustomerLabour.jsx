import { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useCustomer } from '../../context/CustomerContext';
import { useSocket } from '../../context/SocketContext';
import CustomerLayout from '../../components/CustomerLayout';
import {
  Plus, X, Loader2, CheckCircle, ChevronDown, ChevronUp, BadgeCheck,
  Hammer, Zap, Wrench, Paintbrush, HardHat, Scissors, Layers, MoreHorizontal,
  Calendar, MapPin, Users, Clock, IndianRupee, MessageSquare, Check, XCircle
} from 'lucide-react';
import useT from '../../i18n/useT';

const JOB_TYPES = [
  { value: 'mason',        labelKey: 'custlabour.job.mason',       icon: HardHat,        color: 'bg-orange-100 text-orange-700' },
  { value: 'carpenter',   labelKey: 'custlabour.job.carpenter',    icon: Hammer,         color: 'bg-amber-100 text-amber-700' },
  { value: 'electrician', labelKey: 'custlabour.job.electrician',  icon: Zap,            color: 'bg-yellow-100 text-yellow-700' },
  { value: 'plumber',     labelKey: 'custlabour.job.plumber',      icon: Wrench,         color: 'bg-blue-100 text-blue-700' },
  { value: 'painter',     labelKey: 'custlabour.job.painter',      icon: Paintbrush,     color: 'bg-purple-100 text-purple-700' },
  { value: 'welder',      labelKey: 'custlabour.job.welder',       icon: Scissors,       color: 'bg-red-100 text-red-700' },
  { value: 'tiles',       labelKey: 'custlabour.job.tiles',        icon: Layers,         color: 'bg-teal-100 text-teal-700' },
  { value: 'other',       labelKey: 'custlabour.job.other',        icon: MoreHorizontal, color: 'bg-gray-100 text-gray-700' },
];

const STATUS_COLOR = {
  open: 'bg-green-100 text-green-700',
  accepted: 'bg-blue-100 text-blue-700',
  cancelled: 'bg-red-100 text-red-700',
  expired: 'bg-gray-100 text-gray-500',
};

function JobTypeBadge({ type, size = 'sm' }) {
  const t = useT();
  const jt = JOB_TYPES.find(j => j.value === type);
  if (!jt) return null;
  const Icon = jt.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-semibold text-${size} ${jt.color}`}>
      <Icon className="w-3 h-3" /> {t(jt.labelKey)}
    </span>
  );
}

function RequestForm({ onCreated, onClose }) {
  const { authHeader } = useCustomer();
  const t = useT();
  const jobTypes = JOB_TYPES.map(jt => ({ ...jt, label: t(jt.labelKey) }));
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
      toast.error(t('custlabour.requiredFields'));
      return;
    }
    setSubmitting(true);
    try {
      const { data } = await axios.post('/api/labour/request', form, { headers: authHeader() });
      toast.success(t('custlabour.labourBooked'));
      onCreated(data.request);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || t('custlabour.loadFail'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50">
      <div className="bg-white w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl overflow-y-auto max-h-[90vh]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 sticky top-0 bg-white">
          <h2 className="font-bold text-gray-900">{t('custlabour.form.title')}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100"><X className="w-4 h-4 text-gray-500" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-2">{t('custlabour.form.type')}</label>
            <div className="grid grid-cols-4 gap-2">
              {jobTypes.map(jt => {
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
            <label className="block text-xs font-semibold text-gray-600 mb-1">{t('custlabour.form.jobTitle')}</label>
            <input value={form.jobTitle} onChange={e => set('jobTitle', e.target.value)}
              placeholder={t('custlabour.form.titlePh')}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">{t('custlabour.form.desc')}</label>
            <textarea value={form.description} onChange={e => set('description', e.target.value)}
              placeholder={t('custlabour.form.descPh')}
              rows={2}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">{t('custlabour.form.workers')}</label>
              <input type="number" min={1} value={form.workersNeeded} onChange={e => set('workersNeeded', e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">{t('custlabour.form.days')}</label>
              <input type="number" min={1} value={form.estimatedDays} onChange={e => set('estimatedDays', e.target.value)}
                placeholder={t('custlabour.form.daysPh')}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">{t('custlabour.form.start')}</label>
            <input type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">{t('custlabour.form.city')}</label>
            <input value={form.city} onChange={e => set('city', e.target.value)}
              placeholder={t('custlabour.form.cityPh')}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">{t('custlabour.form.addr')}</label>
            <input value={form.address} onChange={e => set('address', e.target.value)}
              placeholder={t('custlabour.form.addrPh')}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">{t('custlabour.form.budget')}</label>
            <div className="flex gap-2">
              <select value={form.budgetType} onChange={e => set('budgetType', e.target.value)}
                className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
                <option value="per_day">{t('custlabour.form.perDay')}</option>
                <option value="fixed">{t('custlabour.form.fixed')}</option>
              </select>
              <input type="number" value={form.budget} onChange={e => set('budget', e.target.value)}
                placeholder="₹ amount"
                className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
          </div>

          <button type="submit" disabled={submitting}
            className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white font-semibold py-3 rounded-xl text-sm transition-colors">
            {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> {t('custlabour.form.posting')}</> : <><Plus className="w-4 h-4" /> {t('custlabour.form.submit')}</>}
          </button>
        </form>
      </div>
    </div>
  );
}

function CounterModal({ quote, onClose, onDone }) {
  const { authHeader } = useCustomer();
  const t = useT();
  const [price, setPrice] = useState(quote.currentRate || quote.totalAmount);
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!price || price <= 0) { toast.error(t('custlabour.validPrice')); return; }
    setSubmitting(true);
    try {
      await axios.post(`/api/labour/${quote.quoteId}/counter`, { price: Number(price), note }, { headers: authHeader() });
      toast.success(t('custlabour.counterSent'));
      onDone();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || t('custlabour.loadFail'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white w-full max-w-sm rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900">{t('custlabour.counter.title')}</h3>
          <button onClick={onClose}><X className="w-4 h-4 text-gray-400" /></button>
        </div>
        <p className="text-xs text-gray-500 mb-3">
          {t('custlabour.counter.supplierOffer', { name: quote.supplierName, price: quote.currentRate?.toLocaleString('en-IN') })}
        </p>
        <div className="mb-3">
          <label className="block text-xs font-semibold text-gray-600 mb-1">{t('custlabour.counter.yourPrice')}</label>
          <input type="number" value={price} onChange={e => setPrice(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
        </div>
        <div className="mb-4">
          <label className="block text-xs font-semibold text-gray-600 mb-1">{t('custlabour.counter.note')}</label>
          <input value={note} onChange={e => setNote(e.target.value)}
            placeholder={t('custlabour.counter.notePh')}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
        </div>
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 border border-gray-200 text-gray-600 font-semibold py-2.5 rounded-xl text-sm hover:bg-gray-50">{t('custlabour.counter.cancel')}</button>
          <button onClick={handleSubmit} disabled={submitting}
            className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white font-semibold py-2.5 rounded-xl text-sm flex items-center justify-center gap-1">
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : t('custlabour.counter.send')}
          </button>
        </div>
      </div>
    </div>
  );
}

function QuoteCard({ quote, request, onAccept, onCounter }) {
  const t = useT();
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
                <BadgeCheck className="w-2.5 h-2.5" /> {t('custlabour.verified')}
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
          <p className="text-xs text-gray-400">{t('custlabour.totalLabel')}</p>
        </div>
      </div>

      {isCountered && (
        <div className="mt-2 text-xs text-orange-700 bg-orange-100 rounded-lg px-3 py-1.5">
          {t('custlabour.counterPending')}
        </div>
      )}

      {quote.notes && (
        <p className="text-xs text-gray-500 mt-2 italic">"{quote.notes}"</p>
      )}

      {quote.negotiation?.length > 1 && (
        <button onClick={() => setExpanded(e => !e)}
          className="mt-2 text-xs text-blue-500 flex items-center gap-1">
          {t('custlabour.negHistory')} {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
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

      {!isAccepted && !isRejected && !isCountered && request.status === 'open' && (
        <div className="flex gap-2 mt-3">
          <button onClick={() => onCounter(quote)}
            className="flex-1 border border-orange-300 text-orange-600 font-semibold py-2 rounded-lg text-xs hover:bg-orange-50 transition-colors">
            {t('custlabour.counter.btn')}
          </button>
          <button onClick={() => onAccept(quote.quoteId)}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 rounded-lg text-xs transition-colors flex items-center justify-center gap-1">
            <CheckCircle className="w-3.5 h-3.5" /> {t('custlabour.accept.btn')}
          </button>
        </div>
      )}
      {isAccepted && (
        <div className="mt-3 flex items-center gap-2 text-green-700 text-xs font-semibold">
          <CheckCircle className="w-4 h-4" /> {t('custlabour.accepted')}
        </div>
      )}
    </div>
  );
}

function RequestCard({ request, onAccept, onCounter, onCancel, onRefresh }) {
  const t = useT();
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
                <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{t('custlabour.dealDone')}</span>
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
                <Users className="w-3 h-3" /> {t('custlabour.workers', { n: request.workersNeeded, s: request.workersNeeded > 1 ? 's' : '' })}
              </span>
              {request.estimatedDays && (
                <span className="flex items-center gap-1 text-xs text-gray-500">
                  <Clock className="w-3 h-3" /> {t('custlabour.days', { n: request.estimatedDays })}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {quotesCount > 0 && (
              <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">
                {t('custlabour.bids', { n: quotesCount, s: quotesCount > 1 ? 's' : '' })}
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
            {t('custlabour.budgetLabel', {
              amount: Number(request.budget).toLocaleString('en-IN'),
              type: request.budgetType === 'per_day' ? t('custlabour.perDay') : t('custlabour.fixedTotal'),
            })}
          </div>
        )}
      </div>

      {expanded && (
        <div className="border-t border-gray-100 p-4 space-y-3">
          {quotesCount === 0 ? (
            <p className="text-center text-gray-400 text-sm py-4">{t('custlabour.noBids')}</p>
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

export default function CustomerLabour() {
  const { authHeader } = useCustomer();
  const socketRef = useSocket();
  const t = useT();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [counterTarget, setCounterTarget] = useState(null);

  const fetchRequests = async () => {
    try {
      const { data } = await axios.get('/api/labour/my-requests', { headers: authHeader() });
      setRequests(data.requests || []);
    } catch {
      toast.error(t('custlabour.loadFail'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRequests(); }, []);

  useEffect(() => {
    const socket = socketRef?.current;
    if (!socket) return;
    const EVENTS = ['labour:quote_submitted', 'labour:counter_response'];
    EVENTS.forEach(ev => socket.on(ev, fetchRequests));
    return () => EVENTS.forEach(ev => socket.off(ev, fetchRequests));
  }, [socketRef]);

  const handleCreated = (newRequest) => {
    setRequests(prev => [{ ...newRequest, quotes: [] }, ...prev]);
  };

  const handleAccept = async (quoteId, requestId, refresh) => {
    if (!window.confirm(t('custlabour.acceptConfirm'))) return;
    try {
      await axios.post(`/api/labour/${quoteId}/accept`, {}, { headers: authHeader() });
      toast.success(t('custlabour.labourBooked'));
      fetchRequests();
    } catch (err) {
      toast.error(err.response?.data?.message || t('custlabour.loadFail'));
    }
  };

  const handleCancel = async (requestId) => {
    if (!window.confirm(t('custlabour.cancelConfirm'))) return;
    try {
      await axios.put(`/api/labour/requests/${requestId}/cancel`, {}, { headers: authHeader() });
      toast.success(t('custlabour.reqCancelled'));
      fetchRequests();
    } catch (err) {
      toast.error(err.response?.data?.message || t('custlabour.loadFail'));
    }
  };

  const openCount = requests.filter(r => r.status === 'open').length;
  const acceptedCount = requests.filter(r => r.status === 'accepted').length;
  const totalBids = requests.reduce((s, r) => s + (r.quotes?.length || 0), 0);

  return (
    <CustomerLayout>
      <div className="max-w-2xl mx-auto space-y-5">

        <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl p-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">{t('custlabour.title')}</h1>
              <p className="text-orange-100 text-sm mt-0.5">{t('custlabour.sub')}</p>
            </div>
            <button onClick={() => setShowForm(true)}
              className="flex items-center gap-2 bg-white text-orange-600 font-semibold text-sm px-4 py-2 rounded-xl hover:bg-orange-50 transition-colors shrink-0">
              <Plus className="w-4 h-4" /> {t('custlabour.postJob')}
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="bg-white/20 rounded-xl p-3 text-center">
              <p className="text-2xl font-black">{openCount}</p>
              <p className="text-xs text-orange-100">{t('custlabour.open')}</p>
            </div>
            <div className="bg-white/20 rounded-xl p-3 text-center">
              <p className="text-2xl font-black">{totalBids}</p>
              <p className="text-xs text-orange-100">{t('custlabour.totalBids')}</p>
            </div>
            <div className="bg-white/20 rounded-xl p-3 text-center">
              <p className="text-2xl font-black">{acceptedCount}</p>
              <p className="text-xs text-orange-100">{t('custlabour.booked')}</p>
            </div>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <p className="text-xs font-bold text-amber-800 mb-2">{t('custlabour.howTitle')}</p>
          <div className="grid grid-cols-3 gap-3">
            {[
              { step: '1', text: t('custlabour.step1') },
              { step: '2', text: t('custlabour.step2') },
              { step: '3', text: t('custlabour.step3') },
            ].map(s => (
              <div key={s.step} className="text-center">
                <div className="w-7 h-7 bg-amber-500 text-white rounded-full flex items-center justify-center text-xs font-bold mx-auto mb-1">{s.step}</div>
                <p className="text-xs text-amber-700">{s.text}</p>
              </div>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
          </div>
        ) : requests.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 py-16 text-center">
            <HardHat className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">{t('custlabour.noReq')}</p>
            <p className="text-gray-400 text-sm mt-1">{t('custlabour.noReqSub')}</p>
            <button onClick={() => setShowForm(true)}
              className="mt-4 inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors">
              <Plus className="w-4 h-4" /> {t('custlabour.postKarigar')}
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
