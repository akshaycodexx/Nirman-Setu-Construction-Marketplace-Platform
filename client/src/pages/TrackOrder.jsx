import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import WhatsAppButton from '../components/WhatsAppButton';
import { Search, Package, CheckCircle, Truck, Clock, XCircle, Loader2, AlertCircle } from 'lucide-react';
import useT from '../i18n/useT';

const STATUS_STEP_KEYS = [
  { key: 'pending', labelKey: 'track.step.pending', icon: Package, descKey: 'track.step.pendingDesc' },
  { key: 'quoted', labelKey: 'track.step.quoted', icon: CheckCircle, descKey: 'track.step.quotedDesc' },
  { key: 'confirmed', labelKey: 'track.step.confirmed', icon: CheckCircle, descKey: 'track.step.confirmedDesc' },
  { key: 'dispatched', labelKey: 'track.step.dispatched', icon: Truck, descKey: 'track.step.dispatchedDesc' },
  { key: 'delivered', labelKey: 'track.step.delivered', icon: CheckCircle, descKey: 'track.step.deliveredDesc' },
];

const STATUS_ORDER = ['pending', 'quoted', 'confirmed', 'dispatched', 'delivered'];

const STATUS_COLORS = {
  pending: 'text-yellow-600 bg-yellow-50 border-yellow-200',
  quoted: 'text-blue-600 bg-blue-50 border-blue-200',
  confirmed: 'text-indigo-600 bg-indigo-50 border-indigo-200',
  dispatched: 'text-orange-600 bg-orange-50 border-orange-200',
  delivered: 'text-green-600 bg-green-50 border-green-200',
  cancelled: 'text-red-600 bg-red-50 border-red-200',
};

export default function TrackOrder() {
  const { orderId: paramOrderId } = useParams();
  const navigate = useNavigate();
  const t = useT();
  const [input, setInput] = useState(paramOrderId || '');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const STATUS_STEPS = STATUS_STEP_KEYS.map(s => ({ ...s, label: t(s.labelKey), desc: t(s.descKey) }));

  useEffect(() => {
    if (paramOrderId) fetchOrder(paramOrderId);
  }, [paramOrderId]);

  const fetchOrder = async (id) => {
    const oid = (id || input).trim().toUpperCase();
    if (!oid) return;
    setLoading(true);
    setError('');
    setOrder(null);
    try {
      const { data } = await axios.get(`/api/orders/track/${oid}`);
      setOrder(data.order);
    } catch (err) {
      if (err.response?.status === 404) {
        setError(t('track.notFound'));
      } else {
        setError(t('track.serverError'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/track/${input.trim().toUpperCase()}`);
    fetchOrder(input);
  };

  const currentIdx = order ? STATUS_ORDER.indexOf(order.status) : -1;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('track.title')}</h1>
          <p className="text-gray-500">{t('track.sub')}</p>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-3 mb-8">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value.toUpperCase())}
            placeholder={t('track.placeholder')}
            className="flex-1 border border-gray-200 bg-white rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent uppercase"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-200 text-white font-semibold px-5 py-3 rounded-xl transition-colors"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            {t('track.btn')}
          </button>
        </form>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center gap-3 text-gray-500 py-12">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>{t('track.searching')}</span>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl p-4">
            <AlertCircle className="w-5 h-5 shrink-0" />
            {error}
          </div>
        )}

        {/* Order found */}
        {order && !loading && (
          <div className="space-y-4">
            {/* Header */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Order ID</p>
                  <p className="text-xl font-black text-gray-900 font-mono">{order.orderId}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {order.customer?.name} &bull; {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <span className={`text-sm font-semibold px-3 py-1.5 rounded-full border capitalize ${STATUS_COLORS[order.status] || STATUS_COLORS.pending}`}>
                  {order.status === 'pending' ? 'Processing' : order.status}
                </span>
              </div>
            </div>

            {/* Status timeline */}
            {order.status !== 'cancelled' && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 className="font-semibold text-gray-900 mb-5">{t('track.progress')}</h3>
                <div className="space-y-0">
                  {STATUS_STEPS.map((s, i) => {
                    const isDone = i <= currentIdx;
                    const isCurrent = i === currentIdx;
                    return (
                      <div key={s.key} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 transition-all ${
                            isDone
                              ? 'bg-orange-500 border-orange-500'
                              : 'bg-white border-gray-200'
                          }`}>
                            <s.icon className={`w-4 h-4 ${isDone ? 'text-white' : 'text-gray-300'}`} />
                          </div>
                          {i < STATUS_STEPS.length - 1 && (
                            <div className={`w-0.5 flex-1 my-1 ${isDone ? 'bg-orange-300' : 'bg-gray-100'}`} style={{ minHeight: '24px' }} />
                          )}
                        </div>
                        <div className="pb-5">
                          <p className={`font-medium text-sm ${isDone ? 'text-gray-900' : 'text-gray-400'}`}>{s.label}</p>
                          {isCurrent && <p className="text-xs text-orange-500 mt-0.5">{s.desc}</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Cancelled */}
            {order.status === 'cancelled' && (
              <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl p-4">
                <XCircle className="w-5 h-5 shrink-0" />
                <div>
                  <p className="font-semibold">{t('track.cancelled')}</p>
                  {order.adminNote && <p className="text-sm mt-0.5">{order.adminNote}</p>}
                </div>
              </div>
            )}

            {/* Quote message */}
            {order.status === 'quoted' && order.quote?.breakdown && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-sm font-semibold text-blue-800 mb-1">{t('track.quoteReady')}</p>
                <p className="text-sm text-blue-700">{order.quote.breakdown}</p>
                <p className="text-xs text-blue-500 mt-2">{t('track.teamContact')}</p>
              </div>
            )}

            {/* Order details */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-semibold text-gray-900 mb-3">{t('track.orderTitle')}</h3>
              <div className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">{t('track.category')}</span>
                  <span className="font-medium capitalize">{order.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">{t('track.deliveryDate')}</span>
                  <span className="font-medium">{new Date(order.delivery?.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">{t('track.slot')}</span>
                  <span className="font-medium capitalize">{order.delivery?.slot}</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">{t('track.items')}</p>
                {order.items?.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm py-1">
                    <span className="text-gray-700">{item.name}</span>
                    <span className="text-gray-500 font-mono">{item.quantity} {item.unit}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Need help */}
            <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-gray-800">{t('track.needHelp')}</p>
                <p className="text-xs text-gray-500">{t('track.helpDesc')}</p>
              </div>
              <a
                href="tel:+910000000000"
                className="shrink-0 bg-orange-500 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
              >
                {t('track.callNow')}
              </a>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!order && !loading && !error && (
          <div className="text-center py-12 text-gray-400">
            <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">{t('track.emptyState')}</p>
            <p className="text-sm mt-1">{t('track.emptyStateSub')}</p>
          </div>
        )}
      </div>

      <WhatsAppButton message="Nirman Setu order track karne mein help chahiye" />
      <Footer />
    </div>
  );
}
