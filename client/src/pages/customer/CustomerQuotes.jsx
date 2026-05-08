import { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useCustomer } from '../../context/CustomerContext';
import { useSocket } from '../../context/SocketContext';
import CustomerLayout from '../../components/CustomerLayout';
import {
  Plus, X, ChevronDown, ChevronUp, CheckCircle, Clock, Ban,
  MessageSquare, IndianRupee, Package, Loader2, ArrowRight,
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import useT from '../../i18n/useT';

const UNITS = ['ton', 'bag', 'piece', 'truck', 'cubic_meter', 'kg', 'litre', 'sqft'];
const UNIT_LABEL = { ton: 'Ton', bag: 'Bag', piece: 'Piece', truck: 'Truck', cubic_meter: 'Cubic Meter', kg: 'KG', litre: 'Litre', sqft: 'Sq.Ft' };

const STATUS_STYLE = {
  open: 'bg-green-100 text-green-700',
  accepted: 'bg-blue-100 text-blue-700',
  cancelled: 'bg-red-100 text-red-700',
  expired: 'bg-gray-100 text-gray-500',
};

const QUOTE_STATUS_STYLE = {
  active: 'bg-green-100 text-green-700',
  countered: 'bg-yellow-100 text-yellow-700',
  accepted: 'bg-blue-100 text-blue-700',
  rejected: 'bg-red-100 text-red-700',
  withdrawn: 'bg-gray-100 text-gray-500',
};

function RequestForm({ onCreated, onClose, prefill }) {
  const { authHeader } = useCustomer();
  const t = useT();
  const [form, setForm] = useState({
    material: prefill?.material || '',
    quantity: prefill?.quantity || '',
    unit: prefill?.unit || 'ton',
    description: '', city: '', pincode: '', address: '', requiredBy: '', budget: '',
  });
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await axios.post('/api/quotes/request', {
        ...form,
        quantity: Number(form.quantity),
        budget: form.budget ? Number(form.budget) : undefined,
      }, { headers: authHeader() });
      toast.success(t('custquotes.sent'));
      onCreated(data.request);
    } catch (err) {
      toast.error(err.response?.data?.message || t('custquotes.loadFail'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">{t('custquotes.form.title')}</h2>
          <button onClick={onClose}><X className="w-5 h-5 text-gray-400" /></button>
        </div>
        <form onSubmit={submit} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-xs font-medium text-gray-500 mb-1 block">{t('custquotes.form.material')}</label>
              <input value={form.material} onChange={e => set('material', e.target.value)}
                placeholder={t('custquotes.form.materialPh')} required
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">{t('custquotes.form.qty')}</label>
              <input value={form.quantity} onChange={e => set('quantity', e.target.value)}
                type="number" min="1" required placeholder="10"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">{t('custquotes.form.unit')}</label>
              <select value={form.unit} onChange={e => set('unit', e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                {UNITS.map(u => <option key={u} value={u}>{UNIT_LABEL[u]}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">{t('custquotes.form.city')}</label>
              <input value={form.city} onChange={e => set('city', e.target.value)}
                placeholder="Patna" required
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">{t('custquotes.form.pin')}</label>
              <input value={form.pincode} onChange={e => set('pincode', e.target.value)}
                placeholder="800001"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="col-span-2">
              <label className="text-xs font-medium text-gray-500 mb-1 block">{t('custquotes.form.addr')}</label>
              <input value={form.address} onChange={e => set('address', e.target.value)}
                placeholder={t('custquotes.form.addrPh')} required
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">{t('custquotes.form.date')}</label>
              <input value={form.requiredBy} onChange={e => set('requiredBy', e.target.value)}
                type="date" required min={new Date().toISOString().split('T')[0]}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">{t('custquotes.form.budget')}</label>
              <input value={form.budget} onChange={e => set('budget', e.target.value)}
                type="number" min="0" placeholder="50000"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="col-span-2">
              <label className="text-xs font-medium text-gray-500 mb-1 block">{t('custquotes.form.desc')}</label>
              <textarea value={form.description} onChange={e => set('description', e.target.value)}
                rows={2} placeholder={t('custquotes.form.descPh')}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
            </div>
          </div>
          <button type="submit" disabled={saving}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors flex items-center justify-center gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            {t('custquotes.form.submit')}
          </button>
        </form>
      </div>
    </div>
  );
}

function CounterModal({ quote, request, onDone, onClose }) {
  const { authHeader } = useCustomer();
  const t = useT();
  const [price, setPrice] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!price || Number(price) <= 0) return toast.error(t('custquotes.validPrice'));
    setSaving(true);
    try {
      await axios.post(`/api/quotes/${quote.quoteId}/counter`, { price: Number(price), note }, { headers: authHeader() });
      toast.success(t('custquotes.counterSent'));
      onDone();
    } catch (err) {
      toast.error(err.response?.data?.message || t('custquotes.loadFail'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-gray-900">{t('custquotes.counter.title')}</h3>
          <button onClick={onClose}><X className="w-5 h-5 text-gray-400" /></button>
        </div>
        <p className="text-sm text-gray-500">
          {t('custquotes.counter.supplierQuote', { name: quote.supplierName, price: quote.currentPrice?.toLocaleString('en-IN') })}
        </p>
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">{t('custquotes.counter.yourPrice')}</label>
          <input value={price} onChange={e => setPrice(e.target.value)} type="number" min="1"
            placeholder={t('custquotes.counter.pricePh')}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">{t('custquotes.counter.note')}</label>
          <input value={note} onChange={e => setNote(e.target.value)}
            placeholder={t('custquotes.counter.notePh')}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <button onClick={submit} disabled={saving}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors flex items-center justify-center gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageSquare className="w-4 h-4" />}
          {t('custquotes.counter.send')}
        </button>
      </div>
    </div>
  );
}

function QuoteCard({ quote, request, onRefresh }) {
  const { authHeader } = useCustomer();
  const t = useT();
  const [counterOpen, setCounterOpen] = useState(false);
  const [accepting, setAccepting] = useState(false);

  const accept = async () => {
    setAccepting(true);
    try {
      await axios.post(`/api/quotes/${quote.quoteId}/accept`, {}, { headers: authHeader() });
      toast.success(t('custquotes.accepted'));
      onRefresh();
    } catch (err) {
      toast.error(err.response?.data?.message || t('custquotes.loadFail'));
    } finally {
      setAccepting(false);
    }
  };

  const canAct = request.status === 'open' && ['active', 'countered'].includes(quote.status);
  const lastNeg = quote.negotiation?.[quote.negotiation.length - 1];

  return (
    <>
      {counterOpen && (
        <CounterModal quote={quote} request={request}
          onDone={() => { setCounterOpen(false); onRefresh(); }}
          onClose={() => setCounterOpen(false)} />
      )}
      <div className={`rounded-xl border p-4 space-y-3 ${quote.status === 'accepted' ? 'border-blue-200 bg-blue-50' : 'border-gray-100 bg-white'}`}>
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-1.5">
              <p className="font-semibold text-gray-900 text-sm">{quote.supplierName}</p>
              {quote.verifiedBadge && (
                <span className="inline-flex items-center gap-0.5 bg-blue-100 text-blue-700 text-xs font-semibold px-1.5 py-0.5 rounded-full">
                  <CheckCircle className="w-3 h-3" /> {t('custquotes.verified')}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-0.5">{t('custquotes.delivDays', { n: quote.deliveryDays })}</p>
          </div>
          <span className={`text-xs font-semibold px-2 py-1 rounded-full capitalize ${QUOTE_STATUS_STYLE[quote.status] || 'bg-gray-100 text-gray-500'}`}>
            {quote.status === 'countered' ? t('custquotes.counterChal') : quote.status}
          </span>
        </div>

        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-black text-gray-900">₹{quote.currentPrice?.toLocaleString('en-IN')}</span>
          <span className="text-xs text-gray-400">{t('custquotes.totalLabel')}</span>
        </div>

        {quote.notes && <p className="text-xs text-gray-500 italic">{quote.notes}</p>}

        {quote.negotiation?.length > 1 && (
          <div className="bg-gray-50 rounded-lg p-2.5 space-y-1.5">
            <p className="text-xs font-medium text-gray-500">{t('custquotes.negHistory')}</p>
            {quote.negotiation.map((n, i) => (
              <div key={i} className={`flex items-center gap-2 text-xs ${n.by === 'customer' ? 'text-blue-700' : 'text-gray-600'}`}>
                <span className="font-semibold capitalize">{n.by}:</span>
                <span>₹{n.price?.toLocaleString('en-IN')}</span>
                {n.note && <span className="text-gray-400">— {n.note}</span>}
              </div>
            ))}
          </div>
        )}

        {quote.status === 'accepted' && request.convertedOrderId && (
          <Link to={`/customer/orders/${request.convertedOrderId}`}
            className="flex items-center gap-1.5 text-blue-600 text-xs font-semibold hover:text-blue-700">
            {t('custquotes.orderDekho')} {request.convertedOrderId} <ArrowRight className="w-3 h-3" />
          </Link>
        )}

        {canAct && (
          <div className="flex gap-2 pt-1">
            <button onClick={() => setCounterOpen(true)}
              className="flex-1 flex items-center justify-center gap-1.5 border border-orange-300 text-orange-600 hover:bg-orange-50 font-semibold py-2 rounded-xl text-xs transition-colors">
              <MessageSquare className="w-3.5 h-3.5" /> {t('custquotes.counterKaro')}
            </button>
            <button onClick={accept} disabled={accepting}
              className="flex-1 flex items-center justify-center gap-1.5 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 rounded-xl text-xs transition-colors">
              {accepting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
              {t('custquotes.acceptKaro')}
            </button>
          </div>
        )}
      </div>
    </>
  );
}

function RequestCard({ request, onRefresh }) {
  const { authHeader } = useCustomer();
  const t = useT();
  const [expanded, setExpanded] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const cancel = async () => {
    setCancelling(true);
    try {
      await axios.put(`/api/quotes/requests/${request.requestId}/cancel`, {}, { headers: authHeader() });
      toast.success(t('custquotes.reqCancelled'));
      onRefresh();
    } catch (err) {
      toast.error(err.response?.data?.message || t('custquotes.loadFail'));
    } finally {
      setCancelling(false);
    }
  };

  const quoteCount = request.quotes?.length || 0;
  const hasNewQuote = request.status === 'open' && request.quotes?.some(q => q.status === 'active');

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <button onClick={() => setExpanded(e => !e)}
        className="w-full flex items-start justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-gray-900">{request.material}</span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${STATUS_STYLE[request.status] || 'bg-gray-100 text-gray-500'}`}>
              {request.status}
            </span>
            {hasNewQuote && (
              <span className="text-xs font-bold text-white bg-orange-500 px-2 py-0.5 rounded-full animate-pulse">
                {t('custquotes.newQuote')}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500">
            {request.quantity} {UNIT_LABEL[request.unit]} · {request.city}
            {request.budget && ` · ${t('custquotes.budgetLabel', { amount: request.budget.toLocaleString('en-IN') })}`}
          </p>
          <p className="text-xs text-gray-400">
            {t('custquotes.chahiye')} {new Date(request.requiredBy).toLocaleDateString('en-IN')}
            {quoteCount > 0 && <span className="ml-2 text-blue-500 font-semibold">{t('custquotes.quoteCount', { n: quoteCount, s: quoteCount !== 1 ? 's' : '' })}</span>}
          </p>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-gray-400 shrink-0 mt-1" /> : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0 mt-1" />}
      </button>

      {expanded && (
        <div className="px-5 pb-5 space-y-3 border-t border-gray-50">
          <p className="text-xs text-gray-400 pt-3">
            {t('custquotes.reqId')} <span className="font-mono font-semibold text-gray-600">{request.requestId}</span>
            {' · '}{request.address}
          </p>

          {request.description && (
            <p className="text-sm text-gray-600 bg-gray-50 rounded-xl px-3 py-2">{request.description}</p>
          )}

          {quoteCount === 0 ? (
            <div className="py-6 text-center">
              <Clock className="w-7 h-7 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-400">{t('custquotes.noQuoteYet')}</p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{t('custquotes.quotesReceived')}</p>
              {request.quotes.map(q => (
                <QuoteCard key={q.quoteId} quote={q} request={request} onRefresh={onRefresh} />
              ))}
            </div>
          )}

          {request.status === 'open' && (
            <button onClick={cancel} disabled={cancelling}
              className="flex items-center gap-1.5 text-red-500 hover:text-red-600 text-xs font-semibold mt-2">
              {cancelling ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Ban className="w-3.5 h-3.5" />}
              {t('custquotes.cancelReq')}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function CustomerQuotes() {
  const { authHeader } = useCustomer();
  const socketRef = useSocket();
  const t = useT();
  const location = useLocation();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(!!location.state?.prefill);
  const prefill = location.state?.prefill || null;

  const load = () => {
    setLoading(true);
    axios.get('/api/quotes/my-requests', { headers: authHeader() })
      .then(r => setRequests(r.data.requests || []))
      .catch(() => toast.error(t('custquotes.loadFail')))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    const socket = socketRef?.current;
    if (!socket) return;
    const EVENTS = ['quote:submitted', 'quote:counter_response'];
    EVENTS.forEach(ev => socket.on(ev, load));
    return () => EVENTS.forEach(ev => socket.off(ev, load));
  }, [socketRef]);

  const handleCreated = (req) => {
    setFormOpen(false);
    setRequests(prev => [{ ...req, quotes: [] }, ...prev]);
  };

  const openCount = requests.filter(r => r.status === 'open').length;

  return (
    <CustomerLayout>
      {formOpen && <RequestForm prefill={prefill} onCreated={handleCreated} onClose={() => setFormOpen(false)} />}
      <div className="max-w-2xl mx-auto space-y-5">

        {/* Header */}
        <div className="bg-linear-to-r from-orange-500 to-amber-500 rounded-2xl p-5 text-white">
          <h1 className="text-xl font-bold">{t('custquotes.title')}</h1>
          <p className="text-orange-100 text-sm mt-0.5">{t('custquotes.sub')}</p>
          <button onClick={() => setFormOpen(true)}
            className="mt-3 inline-flex items-center gap-2 bg-white text-orange-600 font-semibold text-sm px-4 py-2 rounded-xl hover:bg-orange-50 transition-colors">
            <Plus className="w-4 h-4" /> {t('custquotes.newReq')}
          </button>
        </div>

        {/* Stats */}
        {requests.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white rounded-2xl border border-gray-100 p-4 text-center">
              <p className="text-2xl font-black text-gray-900">{requests.length}</p>
              <p className="text-xs text-gray-500 mt-0.5">{t('custquotes.totalReq')}</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-4 text-center">
              <p className="text-2xl font-black text-green-600">{openCount}</p>
              <p className="text-xs text-gray-500 mt-0.5">{t('custquotes.open')}</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-4 text-center">
              <p className="text-2xl font-black text-blue-600">{requests.reduce((s, r) => s + (r.quotes?.length || 0), 0)}</p>
              <p className="text-xs text-gray-500 mt-0.5">{t('custquotes.received')}</p>
            </div>
          </div>
        )}

        {/* List */}
        {loading ? (
          <div className="py-16 text-center">
            <Loader2 className="w-6 h-6 text-gray-400 animate-spin mx-auto" />
          </div>
        ) : requests.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-2xl border border-gray-100">
            <Package className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">{t('custquotes.noReq')}</p>
            <p className="text-gray-400 text-sm mt-1">{t('custquotes.noReqSub')}</p>
            <button onClick={() => setFormOpen(true)}
              className="mt-4 inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm px-4 py-2 rounded-xl transition-colors">
              <Plus className="w-4 h-4" /> {t('custquotes.reqBanao')}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map(r => (
              <RequestCard key={r._id} request={r} onRefresh={load} />
            ))}
          </div>
        )}
      </div>
    </CustomerLayout>
  );
}
