import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useCustomer } from '../../context/CustomerContext';
import { useSocket } from '../../context/SocketContext';
import CustomerLayout, { StatusBadge, PaymentBadge } from '../../components/CustomerLayout';
import { ClipboardList, ChevronRight, Flag } from 'lucide-react';
import useT from '../../i18n/useT';

const TAB_KEYS = [
  { key: 'all', labelKey: 'custorders.tab.all' },
  { key: 'pending', labelKey: 'status.pending' },
  { key: 'quoted', labelKey: 'status.quoted' },
  { key: 'confirmed', labelKey: 'status.confirmed' },
  { key: 'dispatched', labelKey: 'status.dispatched' },
  { key: 'delivered', labelKey: 'status.delivered' },
  { key: 'cancelled', labelKey: 'status.cancelled' },
];

export default function CustomerOrders() {
  const { authHeader } = useCustomer();
  const socketRef = useSocket();
  const t = useT();
  const TABS = TAB_KEYS.map(tab => ({ ...tab, label: t(tab.labelKey) }));
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all');

  const fetchOrders = () =>
    axios.get('/api/customer/orders', { headers: authHeader() })
      .then(r => setOrders(r.data))
      .finally(() => setLoading(false));

  useEffect(() => { fetchOrders(); }, []);

  useEffect(() => {
    const socket = socketRef?.current;
    if (!socket) return;
    socket.on('customer:order-updated', fetchOrders);
    socket.on('quote:submitted', fetchOrders);
    return () => {
      socket.off('customer:order-updated', fetchOrders);
      socket.off('quote:submitted', fetchOrders);
    };
  }, [socketRef]);

  const filtered = tab === 'all' ? orders : orders.filter(o => o.status === tab);

  return (
    <CustomerLayout>
      <div className="max-w-3xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">{t('custorders.title')}</h1>
          <Link to="/request" className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
            {t('custorders.newOrder')}
          </Link>
        </div>

        {/* Status filter tabs */}
        <div className="flex gap-2 flex-wrap">
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                tab === t.key ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}>
              {t.label}
              {t.key !== 'all' && !loading && (
                <span className="ml-1 opacity-60">
                  ({orders.filter(o => o.status === t.key).length})
                </span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl border border-gray-100 py-12 text-center text-gray-400 text-sm">{t('common.loading')}</div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 py-16 text-center">
            <ClipboardList className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500">{tab === 'all' ? t('custorders.noOrders') : t('custorders.noTabOrders', { tab })}</p>
            {tab === 'all' && (
              <Link to="/request" className="text-blue-500 text-sm font-medium mt-1 block">{t('custorders.firstOrder')}</Link>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50 overflow-hidden">
            {filtered.map(o => (
              <Link key={o._id} to={`/customer/orders/${o.orderId}`}
                className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900">{o.orderId}</p>
                    {o.complaint?.text && o.complaint?.status === 'open' && (
                      <span title="Open complaint">
                        <Flag className="w-3 h-3 text-red-500" />
                      </span>
                    )}
                  </div>
                  <p className="text-gray-500 text-sm capitalize mt-0.5">
                    {o.category} · {o.items?.length} item{o.items?.length !== 1 ? 's' : ''} · {o.delivery?.city}
                  </p>
                  <div className="flex items-center gap-3 mt-0.5">
                    {o.quote?.amount && (
                      <p className="text-gray-700 text-sm font-medium">₹{o.quote.amount.toLocaleString('en-IN')}</p>
                    )}
                    <p className="text-gray-400 text-xs">
                      {new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-3 shrink-0">
                  <div className="flex flex-col items-end gap-1">
                    <StatusBadge status={o.status} />
                    {o.payment?.status !== 'none' && <PaymentBadge status={o.payment.status} />}
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </CustomerLayout>
  );
}
