import { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useSupplier } from '../../context/SupplierContext';
import SupplierLayout from '../../components/SupplierLayout';
import {
  Search, Send, X, ChevronDown, ChevronUp, CheckCircle, Loader2,
  Package, MessageSquare, Clock, IndianRupee, ArrowRight,
} from 'lucide-react';
import useT from '../../i18n/useT';

const UNIT_LABEL = { ton: 'Ton', bag: 'Bag', piece: 'Piece', truck: 'Truck', cubic_meter: 'Cubic Meter', kg: 'KG', litre: 'Litre', sqft: 'Sq.Ft' };

const QUOTE_STATUS_STYLE = {
  active: 'bg-green-100 text-green-700',
  countered: 'bg-yellow-100 text-yellow-700',
  accepted: 'bg-blue-100 text-blue-700',
  rejected: 'bg-red-100 text-red-700',
  withdrawn: 'bg-gray-100 text-gray-500',
};

function SubmitQuoteModal({ request, onDone, onClose }) {
  const { getAuthHeaders } = useSupplier();
  const t = useT();
  const [form, setForm] = useState({ pricePerUnit: '', deliveryDays: '', notes: '' });
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const totalPreview = form.pricePerUnit ? (Number(form.pricePerUnit) * request.quantity).toLocaleString('en-IN') : null;

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axios.post(`/api/quotes/requests/${request.requestId}/submit`, {
        pricePerUnit: Number(form.pricePerUnit),
        deliveryDays: Number(form.deliveryDays),
        notes: form.notes,
      }, { headers: getAuthHeaders() });
      toast.success(t('suppqr.quoteSent'));
      onDone();
    } catch (err) {
      toast.error(err.response?.data?.message || t('suppqr.loadFail'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h2 className="font-bold text-gray-900">{t('suppqr.form.title')}</h2>
            <p className="text-xs text-gray-500 mt-0.5">{request.material} · {request.quantity} {UNIT_LABEL[request.unit]}</p>
          </div>
          <button onClick={onClose}><X className="w-5 h-5 text-gray-400" /></button>
        </div>
        <form onSubmit={submit} className="p-5 space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">
              {t('suppqr.form.priceLabel', { unit: UNIT_LABEL[request.unit] || request.unit })}
            </label>
            <input value={form.pricePerUnit} onChange={e => set('pricePerUnit', e.target.value)}
              type="number" min="1" required placeholder="1000"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            {totalPreview && (
              <p className="text-xs text-emerald-600 font-semibold mt-1">
                {t('suppqr.form.totalPreview', { amount: totalPreview })}
              </p>
            )}
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">{t('suppqr.form.days')}</label>
            <input value={form.deliveryDays} onChange={e => set('deliveryDays', e.target.value)}
              type="number" min="1" required placeholder="2"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">{t('suppqr.form.notes')}</label>
            <input value={form.notes} onChange={e => set('notes', e.target.value)}
              placeholder={t('suppqr.form.notesPh')}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
          <button type="submit" disabled={saving}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors flex items-center justify-center gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            {t('suppqr.form.submit')}
          </button>
        </form>
      </div>
    </div>
  );
}

function CounterRespondModal({ quote, onDone, onClose }) {
  const { getAuthHeaders } = useSupplier();
  const t = useT();
  const [action, setAction] = useState('accept');
  const [price, setPrice] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (action === 'counter' && (!price || Number(price) <= 0)) return toast.error(t('suppqr.validPrice'));
    setSaving(true);
    try {
      await axios.post(`/api/quotes/${quote.quoteId}/counter-respond`, {
        action,
        price: action === 'counter' ? Number(price) : undefined,
        note,
      }, { headers: getAuthHeaders() });
      toast.success(
        action === 'accept' ? t('suppqr.counterAccepted')
        : action === 'reject' ? t('suppqr.rejected')
        : t('suppqr.counterSent')
      );
      onDone();
    } catch (err) {
      toast.error(err.response?.data?.message || t('suppqr.loadFail'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-gray-900">{t('suppqr.resp.title')}</h3>
          <button onClick={onClose}><X className="w-5 h-5 text-gray-400" /></button>
        </div>
        <p className="text-sm text-gray-500">
          {t('suppqr.resp.customer')} <strong>₹{quote.currentPrice?.toLocaleString('en-IN')}</strong>
        </p>
        <div className="grid grid-cols-3 gap-2">
          {['accept', 'counter', 'reject'].map(a => (
            <button key={a} onClick={() => setAction(a)}
              className={`py-2 rounded-xl text-xs font-semibold capitalize transition-colors border ${action === a
                ? a === 'accept' ? 'bg-green-500 text-white border-green-500'
                  : a === 'reject' ? 'bg-red-500 text-white border-red-500'
                  : 'bg-orange-500 text-white border-orange-500'
                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>
              {a === 'accept' ? t('suppqr.resp.accept') : a === 'counter' ? t('suppqr.resp.counter') : t('suppqr.resp.reject')}
            </button>
          ))}
        </div>
        {action === 'counter' && (
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">{t('suppqr.resp.yourCounter')}</label>
            <input value={price} onChange={e => setPrice(e.target.value)} type="number" min="1"
              placeholder={t('suppqr.resp.counterPricePh')}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
        )}
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">{t('suppqr.resp.note')}</label>
          <input value={note} onChange={e => setNote(e.target.value)}
            placeholder={t('suppqr.resp.notePh')}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
        </div>
        <button onClick={submit} disabled={saving}
          className={`w-full text-white font-semibold py-2.5 rounded-xl text-sm transition-colors flex items-center justify-center gap-2 ${
            action === 'accept' ? 'bg-green-500 hover:bg-green-600' : action === 'reject' ? 'bg-red-500 hover:bg-red-600' : 'bg-orange-500 hover:bg-orange-600'
          }`}>
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
          {action === 'accept' ? t('suppqr.resp.acceptKaro') : action === 'reject' ? t('suppqr.resp.rejectKaro') : t('suppqr.resp.counterBhejo')}
        </button>
      </div>
    </div>
  );
}

function AvailableRequestCard({ request, onQuoted }) {
  const t = useT();
  const [expanded, setExpanded] = useState(false);
  const [quoteOpen, setQuoteOpen] = useState(false);
  const expiresIn = Math.max(0, Math.floor((new Date(request.expiresAt) - Date.now()) / (1000 * 60 * 60)));

  return (
    <>
      {quoteOpen && (
        <SubmitQuoteModal request={request}
          onDone={() => { setQuoteOpen(false); onQuoted(request._id); }}
          onClose={() => setQuoteOpen(false)} />
      )}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <button onClick={() => setExpanded(e => !e)}
          className="w-full flex items-start justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-gray-900">{request.material}</span>
              {request.alreadyQuoted && (
                <span className="text-xs font-semibold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">{t('suppqr.quoted')}</span>
              )}
              <span className="text-xs text-gray-400">{t('suppqr.hBaki', { h: expiresIn })}</span>
            </div>
            <p className="text-sm text-gray-500">
              {request.quantity} {UNIT_LABEL[request.unit] || request.unit} · {request.city}
              {request.budget && ` · ${t('suppqr.budget', { amount: request.budget.toLocaleString('en-IN') })}`}
            </p>
            <p className="text-xs text-gray-400">
              {t('suppqr.chahiye')} {new Date(request.requiredBy).toLocaleDateString('en-IN')}
            </p>
          </div>
          {expanded ? <ChevronUp className="w-4 h-4 text-gray-400 shrink-0 mt-1" /> : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0 mt-1" />}
        </button>

        {expanded && (
          <div className="px-5 pb-5 border-t border-gray-50 space-y-3">
            <p className="text-xs text-gray-400 pt-3">{request.address}, {request.city} {request.pincode}</p>
            {request.description && (
              <p className="text-sm text-gray-600 bg-gray-50 rounded-xl px-3 py-2">{request.description}</p>
            )}
            {!request.alreadyQuoted ? (
              <button onClick={() => setQuoteOpen(true)}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors">
                <Send className="w-4 h-4" /> {t('suppqr.quoteDoBtn')}
              </button>
            ) : (
              <p className="text-sm text-emerald-600 font-semibold flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4" /> {t('suppqr.quotedMsg')}
              </p>
            )}
          </div>
        )}
      </div>
    </>
  );
}

function MyQuoteCard({ quote }) {
  const t = useT();
  const [counterRespondOpen, setCounterRespondOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const request = quote.requestId;

  return (
    <>
      {counterRespondOpen && (
        <CounterRespondModal quote={quote}
          onDone={() => setCounterRespondOpen(false)}
          onClose={() => setCounterRespondOpen(false)} />
      )}
      <div className={`rounded-2xl border overflow-hidden ${quote.status === 'accepted' ? 'border-blue-200' : 'border-gray-100'}`}>
        <button onClick={() => setExpanded(e => !e)}
          className="w-full flex items-start justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors bg-white">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-gray-900">{request?.material}</span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${QUOTE_STATUS_STYLE[quote.status] || 'bg-gray-100 text-gray-500'}`}>
                {quote.status === 'countered' ? t('suppqr.counterAaya') : quote.status}
              </span>
            </div>
            <p className="text-sm text-gray-500">
              {request?.quantity} {UNIT_LABEL[request?.unit] || request?.unit} · {request?.city}
            </p>
            <p className="text-xs text-gray-400">{t('suppqr.yourQuote')} <span className="font-semibold text-gray-700">₹{quote.currentPrice?.toLocaleString('en-IN')}</span></p>
          </div>
          {expanded ? <ChevronUp className="w-4 h-4 text-gray-400 shrink-0 mt-1" /> : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0 mt-1" />}
        </button>

        {expanded && (
          <div className="px-5 pb-5 border-t border-gray-50 bg-white space-y-3">
            {quote.negotiation?.length > 0 && (
              <div className="bg-gray-50 rounded-xl p-3 space-y-1.5 mt-3">
                <p className="text-xs font-semibold text-gray-500">{t('suppqr.negTitle')}</p>
                {quote.negotiation.map((n, i) => (
                  <div key={i} className={`flex items-center gap-2 text-xs ${n.by === 'supplier' ? 'text-emerald-700' : 'text-blue-700'}`}>
                    <span className="font-semibold capitalize">{n.by === 'supplier' ? t('suppqr.aap') : t('suppqr.customer')}:</span>
                    <span>₹{n.price?.toLocaleString('en-IN')}</span>
                    {n.note && <span className="text-gray-400">— {n.note}</span>}
                  </div>
                ))}
              </div>
            )}

            {quote.status === 'countered' && (
              <button onClick={() => setCounterRespondOpen(true)}
                className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors">
                <MessageSquare className="w-4 h-4" /> {t('suppqr.counterRespond')}
              </button>
            )}

            {quote.status === 'accepted' && request?.convertedOrderId && (
              <p className="text-sm text-blue-600 font-semibold">
                {t('suppqr.orderBanGaya')} <span className="font-mono">{request.convertedOrderId}</span>
              </p>
            )}
          </div>
        )}
      </div>
    </>
  );
}

export default function SupplierQuoteRequests() {
  const { getAuthHeaders } = useSupplier();
  const t = useT();
  const [tab, setTab] = useState('available');
  const [available, setAvailable] = useState([]);
  const [myQuotes, setMyQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [city, setCity] = useState('');
  const [search, setSearch] = useState('');

  const loadAvailable = () => {
    const params = city ? { city } : {};
    return axios.get('/api/quotes/available', { headers: getAuthHeaders(), params })
      .then(r => setAvailable(r.data.requests || []));
  };

  const loadMyQuotes = () => {
    return axios.get('/api/quotes/supplier/my-quotes', { headers: getAuthHeaders() })
      .then(r => setMyQuotes(r.data.quotes || []));
  };

  const loadAll = () => {
    setLoading(true);
    Promise.all([loadAvailable(), loadMyQuotes()])
      .catch(() => toast.error(t('suppqr.loadFail')))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadAll(); }, []);

  const handleCitySearch = (e) => {
    e.preventDefault();
    setLoading(true);
    loadAvailable().finally(() => setLoading(false));
  };

  const handleQuoted = (requestId) => {
    setAvailable(prev => prev.map(r => r._id === requestId ? { ...r, alreadyQuoted: true } : r));
    loadMyQuotes();
  };

  const pendingCounter = myQuotes.filter(q => q.status === 'countered').length;

  const filteredAvailable = available.filter(r =>
    !search || r.material.toLowerCase().includes(search.toLowerCase()) || r.city.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SupplierLayout>
      <div className="max-w-2xl mx-auto space-y-5">

        <div className="bg-linear-to-r from-emerald-600 to-teal-600 rounded-2xl p-5 text-white">
          <h1 className="text-xl font-bold">{t('suppqr.title')}</h1>
          <p className="text-emerald-100 text-sm mt-0.5">{t('suppqr.sub')}</p>
          {pendingCounter > 0 && (
            <div className="mt-3 inline-flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-xl text-sm font-semibold">
              <MessageSquare className="w-4 h-4" /> {t('suppqr.pendingCounter', { n: pendingCounter })}
            </div>
          )}
        </div>

        <div className="flex bg-gray-100 rounded-2xl p-1">
          {[['available', t('suppqr.available')], ['my', t('suppqr.myQuotes')]].map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-colors ${tab === key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              {label}
              {key === 'my' && pendingCounter > 0 && (
                <span className="ml-1.5 bg-yellow-400 text-yellow-900 text-xs font-bold px-1.5 py-0.5 rounded-full">{pendingCounter}</span>
              )}
            </button>
          ))}
        </div>

        {tab === 'available' && (
          <form onSubmit={handleCitySearch} className="flex gap-2">
            <input value={city} onChange={e => setCity(e.target.value)}
              placeholder={t('suppqr.cityFilter')}
              className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            <button type="submit"
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl">
              <Search className="w-4 h-4" />
            </button>
          </form>
        )}

        {tab === 'available' && (
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder={t('suppqr.materialSearch')}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
        )}

        {loading ? (
          <div className="py-16 text-center">
            <Loader2 className="w-6 h-6 text-gray-400 animate-spin mx-auto" />
          </div>
        ) : tab === 'available' ? (
          filteredAvailable.length === 0 ? (
            <div className="py-16 text-center bg-white rounded-2xl border border-gray-100">
              <Package className="w-10 h-10 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">{t('suppqr.noAvailable')}</p>
              <p className="text-gray-400 text-sm mt-1">{t('suppqr.noAvailableSub')}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredAvailable.map(r => (
                <AvailableRequestCard key={r._id} request={r} onQuoted={handleQuoted} />
              ))}
            </div>
          )
        ) : (
          myQuotes.length === 0 ? (
            <div className="py-16 text-center bg-white rounded-2xl border border-gray-100">
              <Clock className="w-10 h-10 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">{t('suppqr.noMyQuotes')}</p>
              <p className="text-gray-400 text-sm mt-1">{t('suppqr.noMyQuotesSub')}</p>
              <button onClick={() => setTab('available')}
                className="mt-4 inline-flex items-center gap-2 text-emerald-600 text-sm font-semibold hover:text-emerald-700">
                {t('suppqr.reqsDekho')} <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {myQuotes.map(q => <MyQuoteCard key={q._id} quote={q} />)}
            </div>
          )
        )}
      </div>
    </SupplierLayout>
  );
}
