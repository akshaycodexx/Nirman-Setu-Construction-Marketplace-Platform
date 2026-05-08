import { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useSupplier } from '../../context/SupplierContext';
import SupplierLayout from '../../components/SupplierLayout';
import {
  Hammer, Zap, Wrench, Paintbrush, HardHat, Scissors, Layers, MoreHorizontal,
  MapPin, Calendar, Users, Clock, IndianRupee, CheckCircle, XCircle,
  Loader2, X, ChevronDown, ChevronUp, BadgeCheck, Plus, Check
} from 'lucide-react';
import useT from '../../i18n/useT';

const JOB_TYPE_KEYS = [
  { value: 'mason',        labelKey: 'custlabour.job.mason',       icon: HardHat,        color: 'bg-orange-100 text-orange-700' },
  { value: 'carpenter',   labelKey: 'custlabour.job.carpenter',    icon: Hammer,         color: 'bg-amber-100 text-amber-700' },
  { value: 'electrician', labelKey: 'custlabour.job.electrician',  icon: Zap,            color: 'bg-yellow-100 text-yellow-700' },
  { value: 'plumber',     labelKey: 'custlabour.job.plumber',      icon: Wrench,         color: 'bg-blue-100 text-blue-700' },
  { value: 'painter',     labelKey: 'custlabour.job.painter',      icon: Paintbrush,     color: 'bg-purple-100 text-purple-700' },
  { value: 'welder',      labelKey: 'custlabour.job.welder',       icon: Scissors,       color: 'bg-red-100 text-red-700' },
  { value: 'tiles',       labelKey: 'custlabour.job.tiles',        icon: Layers,         color: 'bg-teal-100 text-teal-700' },
  { value: 'other',       labelKey: 'custlabour.job.other',        icon: MoreHorizontal, color: 'bg-gray-100 text-gray-700' },
];

function JobTypeBadge({ type }) {
  const t = useT();
  const jt = JOB_TYPE_KEYS.find(j => j.value === type);
  if (!jt) return null;
  const Icon = jt.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-semibold text-xs ${jt.color}`}>
      <Icon className="w-3 h-3" /> {t(jt.labelKey)}
    </span>
  );
}

function SubmitBidModal({ request, onClose, onDone }) {
  const { authHeader } = useSupplier();
  const t = useT();
  const [form, setForm] = useState({
    ratePerDay: '',
    totalWorkers: request.workersNeeded || 1,
    totalDays: request.estimatedDays || '',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const totalAmount = form.ratePerDay && form.totalWorkers && form.totalDays
    ? Number(form.ratePerDay) * Number(form.totalWorkers) * Number(form.totalDays)
    : null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.ratePerDay) { toast.error(t('supplabour.rateRequired')); return; }
    setSubmitting(true);
    try {
      await axios.post(`/api/labour/requests/${request.requestId}/submit`, {
        ratePerDay: Number(form.ratePerDay),
        totalWorkers: Number(form.totalWorkers),
        totalDays: form.totalDays ? Number(form.totalDays) : undefined,
        notes: form.notes,
      }, { headers: authHeader() });
      toast.success(t('supplabour.bidSubmitted'));
      onDone();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || t('supplabour.bidFail'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50">
      <div className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl overflow-y-auto max-h-[85vh]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 sticky top-0 bg-white">
          <div>
            <h2 className="font-bold text-gray-900">{t('supplabour.bid.title')}</h2>
            <p className="text-xs text-gray-500">{request.jobTitle}</p>
          </div>
          <button onClick={onClose}><X className="w-4 h-4 text-gray-400" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">{t('supplabour.bid.rate')}</label>
            <input type="number" value={form.ratePerDay} onChange={e => set('ratePerDay', e.target.value)}
              placeholder="e.g. 600"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">{t('supplabour.bid.workers')}</label>
              <input type="number" min={1} value={form.totalWorkers} onChange={e => set('totalWorkers', e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">{t('supplabour.bid.days')}</label>
              <input type="number" min={1} value={form.totalDays} onChange={e => set('totalDays', e.target.value)}
                placeholder={request.estimatedDays || '?'}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
          </div>

          {totalAmount && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
              <p className="text-xs text-blue-600 font-semibold">{t('supplabour.bid.totalAmt')}</p>
              <p className="text-2xl font-black text-blue-900">₹{totalAmount.toLocaleString('en-IN')}</p>
              <p className="text-xs text-blue-500 mt-0.5">
                {t('supplabour.bid.calcLabel', {
                  rate: form.ratePerDay,
                  workers: form.totalWorkers,
                  s: Number(form.totalWorkers) > 1 ? 's' : '',
                  days: form.totalDays,
                })}
              </p>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">{t('supplabour.bid.notes')}</label>
            <textarea value={form.notes} onChange={e => set('notes', e.target.value)}
              placeholder={t('supplabour.bid.notesPh')}
              rows={2}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none" />
          </div>

          <button type="submit" disabled={submitting}
            className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white font-semibold py-3 rounded-xl text-sm transition-colors">
            {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> {t('supplabour.bid.submitting')}</> : <><Check className="w-4 h-4" /> {t('supplabour.bid.submit')}</>}
          </button>
        </form>
      </div>
    </div>
  );
}

function CounterRespondModal({ quote, onClose, onDone }) {
  const { authHeader } = useSupplier();
  const t = useT();
  const [action, setAction] = useState('accept');
  const [price, setPrice] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (action === 'counter' && (!price || price <= 0)) { toast.error(t('supplabour.priceDaalo')); return; }
    setSubmitting(true);
    try {
      await axios.post(`/api/labour/${quote.quoteId}/counter-respond`, {
        action,
        price: action === 'counter' ? Number(price) : undefined,
        note,
      }, { headers: authHeader() });
      const msg = action === 'accept'
        ? t('supplabour.counterAccepted')
        : action === 'reject'
        ? t('supplabour.counterRejected')
        : t('supplabour.counterSentMsg');
      toast.success(msg);
      onDone();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || t('supplabour.counterFail'));
    } finally {
      setSubmitting(false);
    }
  };

  const actions = [
    { val: 'accept', labelKey: 'supplabour.counter.accept', color: 'green' },
    { val: 'reject', labelKey: 'supplabour.counter.reject', color: 'red' },
    { val: 'counter', labelKey: 'supplabour.counter.counter', color: 'orange' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white w-full max-w-sm rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900">{t('supplabour.counter.title')}</h3>
          <button onClick={onClose}><X className="w-4 h-4 text-gray-400" /></button>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          {t('supplabour.counterCustomer')} <span className="font-bold">₹{quote.currentRate?.toLocaleString('en-IN')}</span>
        </p>

        <div className="grid grid-cols-3 gap-2 mb-4">
          {actions.map(a => (
            <button key={a.val} onClick={() => setAction(a.val)}
              className={`py-2 rounded-xl text-sm font-semibold border-2 transition-colors ${
                action === a.val
                  ? a.color === 'green' ? 'border-green-500 bg-green-50 text-green-700'
                    : a.color === 'red' ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-orange-500 bg-orange-50 text-orange-700'
                  : 'border-gray-200 text-gray-500 hover:border-gray-300'
              }`}>
              {t(a.labelKey)}
            </button>
          ))}
        </div>

        {action === 'counter' && (
          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-600 mb-1">{t('supplabour.counter.newPrice')}</label>
            <input type="number" value={price} onChange={e => setPrice(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 mb-2" />
          </div>
        )}
        <div className="mb-4">
          <label className="block text-xs font-semibold text-gray-600 mb-1">{t('supplabour.counter.note')}</label>
          <input value={note} onChange={e => setNote(e.target.value)}
            placeholder={t('supplabour.counter.notePh')}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
        </div>

        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 border border-gray-200 text-gray-600 font-semibold py-2.5 rounded-xl text-sm hover:bg-gray-50">{t('supplabour.counter.cancel')}</button>
          <button onClick={handleSubmit} disabled={submitting}
            className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white font-semibold py-2.5 rounded-xl text-sm flex items-center justify-center gap-1">
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : t('supplabour.counter.confirm')}
          </button>
        </div>
      </div>
    </div>
  );
}

function AvailableCard({ request, onBid }) {
  const t = useT();
  const [expanded, setExpanded] = useState(false);
  const hoursLeft = Math.max(0, Math.floor((new Date(request.expiresAt) - new Date()) / 3600000));

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <JobTypeBadge type={request.jobType} />
            {hoursLeft < 12 && !request.alreadyQuoted && (
              <span className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                {t('supplabour.hoursLeft', { h: hoursLeft })}
              </span>
            )}
            {request.alreadyQuoted && (
              <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                <CheckCircle className="w-3 h-3" /> {t('supplabour.bidDiya')}
              </span>
            )}
          </div>
          <p className="font-semibold text-gray-900 text-sm">{request.jobTitle}</p>
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            <span className="flex items-center gap-1 text-xs text-gray-500"><MapPin className="w-3 h-3" /> {request.city}</span>
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <Calendar className="w-3 h-3" /> {new Date(request.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
            </span>
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <Users className="w-3 h-3" /> {t('supplabour.workers', { n: request.workersNeeded, s: request.workersNeeded > 1 ? 's' : '' })}
            </span>
            {request.estimatedDays && (
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <Clock className="w-3 h-3" /> {t('supplabour.days', { n: request.estimatedDays })}
              </span>
            )}
          </div>
        </div>
        <button onClick={() => setExpanded(e => !e)} className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg">
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {request.budget && (
        <div className="mt-1.5 flex items-center gap-1 text-xs text-gray-500">
          <IndianRupee className="w-3 h-3" />
          {t('supplabour.budget.label', {
            amount: Number(request.budget).toLocaleString('en-IN'),
            type: request.budgetType === 'per_day' ? t('supplabour.budget.perDay') : t('supplabour.budget.fixed'),
          })}
        </div>
      )}

      {expanded && request.description && (
        <p className="mt-2 text-xs text-gray-600 bg-gray-50 rounded-xl px-3 py-2">{request.description}</p>
      )}

      {!request.alreadyQuoted && (
        <button onClick={() => onBid(request)}
          className="mt-3 w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors">
          <Plus className="w-4 h-4" /> {t('supplabour.submitBid')}
        </button>
      )}
    </div>
  );
}

function MyQuoteCard({ quote, onRespond }) {
  const t = useT();
  const req = quote.requestId;
  const isCountered = quote.status === 'countered';

  return (
    <div className={`bg-white rounded-2xl border p-4 ${isCountered ? 'border-orange-300' : 'border-gray-100'}`}>
      {isCountered && (
        <div className="flex items-center gap-2 text-orange-700 bg-orange-50 rounded-xl px-3 py-2 mb-3 text-xs font-semibold">
          <IndianRupee className="w-3.5 h-3.5" />
          {t('supplabour.counterAaya', { amount: quote.currentRate?.toLocaleString('en-IN') })}
        </div>
      )}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          {req && <JobTypeBadge type={req.jobType} />}
          <p className="font-semibold text-gray-900 text-sm mt-1">{req?.jobTitle || '—'}</p>
          <div className="flex items-center gap-2 flex-wrap mt-1">
            {req?.city && <span className="flex items-center gap-1 text-xs text-gray-500"><MapPin className="w-3 h-3" /> {req.city}</span>}
            {req?.startDate && (
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <Calendar className="w-3 h-3" /> {new Date(req.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
              </span>
            )}
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="text-lg font-black text-gray-900">₹{quote.currentRate?.toLocaleString('en-IN')}</p>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${
            quote.status === 'accepted' ? 'bg-green-100 text-green-700'
              : quote.status === 'rejected' ? 'bg-red-100 text-red-700'
              : quote.status === 'countered' ? 'bg-orange-100 text-orange-700'
              : 'bg-blue-100 text-blue-700'
          }`}>
            {quote.status}
          </span>
        </div>
      </div>
      <p className="text-xs text-gray-400 mt-1">
        ₹{quote.ratePerDay}/day × {quote.totalWorkers} × {quote.totalDays || '?'} days
      </p>
      {quote.notes && <p className="text-xs text-gray-500 mt-1 italic">"{quote.notes}"</p>}

      {isCountered && (
        <button onClick={() => onRespond(quote)}
          className="mt-3 w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors">
          {t('supplabour.respondCounter')}
        </button>
      )}
    </div>
  );
}

export default function SupplierLabourRequests() {
  const { authHeader } = useSupplier();
  const t = useT();
  const jobTypes = JOB_TYPE_KEYS.map(j => ({ ...j, label: t(j.labelKey) }));
  const [tab, setTab] = useState('available');
  const [available, setAvailable] = useState([]);
  const [myQuotes, setMyQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cityFilter, setCityFilter] = useState('');
  const [jobFilter, setJobFilter] = useState('');
  const [bidTarget, setBidTarget] = useState(null);
  const [respondTarget, setRespondTarget] = useState(null);

  const fetchAvailable = async () => {
    try {
      const params = {};
      if (cityFilter) params.city = cityFilter;
      if (jobFilter) params.jobType = jobFilter;
      const { data } = await axios.get('/api/labour/available', { headers: authHeader(), params });
      setAvailable(data.requests || []);
    } catch {
      toast.error(t('supplabour.loadFail'));
    }
  };

  const fetchMyQuotes = async () => {
    try {
      const { data } = await axios.get('/api/labour/supplier/my-quotes', { headers: authHeader() });
      setMyQuotes(data.quotes || []);
    } catch {}
  };

  const fetchAll = async () => {
    setLoading(true);
    await Promise.all([fetchAvailable(), fetchMyQuotes()]);
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);
  useEffect(() => { if (tab === 'available') fetchAvailable(); }, [cityFilter, jobFilter]);

  const pendingCounters = myQuotes.filter(q => q.status === 'countered').length;

  return (
    <SupplierLayout>
      <div className="max-w-2xl mx-auto space-y-5">

        <div className="bg-linear-to-r from-blue-600 to-blue-500 rounded-2xl p-5 text-white">
          <h1 className="text-xl font-bold">{t('supplabour.title')}</h1>
          <p className="text-blue-100 text-sm mt-0.5">{t('supplabour.sub')}</p>
          {pendingCounters > 0 && (
            <div className="mt-3 bg-white/20 rounded-xl px-3 py-2 text-sm font-semibold flex items-center gap-2">
              <IndianRupee className="w-4 h-4" />
              {t('supplabour.pendingCounter', { n: pendingCounters })}
            </div>
          )}
        </div>

        <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
          <button onClick={() => setTab('available')}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-colors ${tab === 'available' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            {t('supplabour.available')}
          </button>
          <button onClick={() => setTab('my')}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-colors relative ${tab === 'my' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            {t('supplabour.myBids')}
            {pendingCounters > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-orange-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {pendingCounters}
              </span>
            )}
          </button>
        </div>

        {tab === 'available' && (
          <div className="flex gap-2 flex-wrap">
            <input value={cityFilter} onChange={e => setCityFilter(e.target.value)}
              placeholder={t('supplabour.cityFilter')}
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 w-40" />
            <select value={jobFilter} onChange={e => setJobFilter(e.target.value)}
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
              <option value="">{t('supplabour.allTypes')}</option>
              {jobTypes.map(j => <option key={j.value} value={j.value}>{j.label}</option>)}
            </select>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
          </div>
        ) : tab === 'available' ? (
          available.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 py-16 text-center">
              <HardHat className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">{t('supplabour.noAvail')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {available.map(r => (
                <AvailableCard key={r._id} request={r} onBid={setBidTarget} />
              ))}
            </div>
          )
        ) : (
          myQuotes.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 py-16 text-center">
              <CheckCircle className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">{t('supplabour.noBids')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {myQuotes.map(q => (
                <MyQuoteCard key={q._id} quote={q} onRespond={setRespondTarget} />
              ))}
            </div>
          )
        )}
      </div>

      {bidTarget && (
        <SubmitBidModal request={bidTarget} onClose={() => setBidTarget(null)} onDone={fetchAll} />
      )}
      {respondTarget && (
        <CounterRespondModal quote={respondTarget} onClose={() => setRespondTarget(null)} onDone={fetchAll} />
      )}
    </SupplierLayout>
  );
}
