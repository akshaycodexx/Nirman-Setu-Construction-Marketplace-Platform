import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useCustomer } from '../../context/CustomerContext';
import { useSocket } from '../../context/SocketContext';
import CustomerLayout, { StatusBadge, PaymentBadge } from '../../components/CustomerLayout';
import { ClipboardList, Plus, Package, CheckCircle, IndianRupee, Zap, ArrowRight, AlertCircle, CreditCard, Loader2, MessageSquare, Calculator, Hammer } from 'lucide-react';
import useT from '../../i18n/useT';

export default function CustomerDashboard() {
  const { customer, authHeader } = useCustomer();
  const socketRef = useSocket();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const t = useT();

  const fetchStats = () =>
    axios.get('/api/customer/dashboard-stats', { headers: authHeader() })
      .then(r => setStats(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));

  useEffect(() => { fetchStats(); }, []);

  useEffect(() => {
    const socket = socketRef?.current;
    if (!socket) return;
    const EVENTS = ['customer:order-updated', 'quote:submitted', 'labour:quote_submitted'];
    EVENTS.forEach(ev => socket.on(ev, fetchStats));
    return () => EVENTS.forEach(ev => socket.off(ev, fetchStats));
  }, [socketRef]);

  const statCards = [
    { label: t('custdash.totalOrders'), value: stats?.totalOrders ?? '—', icon: ClipboardList, color: 'bg-blue-50 text-blue-700', iconColor: 'text-blue-500' },
    { label: t('custdash.active'), value: stats?.activeCount ?? '—', icon: Zap, color: 'bg-orange-50 text-orange-700', iconColor: 'text-orange-500' },
    { label: t('custdash.delivered'), value: stats?.deliveredCount ?? '—', icon: CheckCircle, color: 'bg-green-50 text-green-700', iconColor: 'text-green-500' },
    { label: t('custdash.paidOut'), value: stats?.totalSpent ? `₹${stats.totalSpent.toLocaleString('en-IN')}` : '₹0', icon: IndianRupee, color: 'bg-purple-50 text-purple-700', iconColor: 'text-purple-500' },
  ];

  return (
    <CustomerLayout>
      <div className="max-w-4xl mx-auto space-y-5">

        {/* Welcome Banner */}
        <div className="bg-linear-to-r from-blue-600 to-blue-500 rounded-2xl p-5 text-white">
          <h1 className="text-xl font-bold">{t('custdash.welcome', { name: customer?.name })}</h1>
          <p className="text-blue-100 text-sm mt-0.5">{t('custdash.welcomeSub')}</p>
          <Link to="/request"
            className="mt-3 inline-flex items-center gap-2 bg-white text-blue-600 font-semibold text-sm px-4 py-2 rounded-xl hover:bg-blue-50 transition-colors">
            <Plus className="w-4 h-4" /> {t('custdash.newOrder')}
          </Link>
        </div>

        {/* Quote Pending — Action Required */}
        {stats?.pendingPayment && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-amber-800 text-sm">{t('custdash.actionReq')}</p>
              <p className="text-amber-700 text-xs mt-0.5">
                {t('custdash.quoteMsg', { orderId: stats.pendingPayment.orderId, amount: stats.pendingPayment.quote?.amount?.toLocaleString('en-IN') })}
              </p>
            </div>
            <Link to={`/customer/orders/${stats.pendingPayment.orderId}`}
              className="shrink-0 flex items-center gap-1 bg-amber-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-amber-600 transition-colors">
              <CreditCard className="w-3 h-3" /> {t('custdash.payNow')}
            </Link>
          </div>
        )}

        {/* Active Order Banner */}
        {stats?.activeOrder && !stats?.pendingPayment && (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-start gap-3">
            <Package className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-blue-800 text-sm">{t('custdash.activeOrderTitle', { orderId: stats.activeOrder.orderId })}</p>
              <p className="text-blue-600 text-xs mt-0.5 capitalize">
                {stats.activeOrder.category} · Status: {stats.activeOrder.status}
                {stats.activeOrder.delivery?.city && ` · ${stats.activeOrder.delivery.city}`}
              </p>
            </div>
            <Link to={`/customer/orders/${stats.activeOrder.orderId}`}
              className="shrink-0 flex items-center gap-1 text-blue-600 text-xs font-semibold hover:text-blue-700">
              {t('custdash.track')} <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {statCards.map(s => (
            <div key={s.label} className={`rounded-2xl p-4 border border-transparent ${s.color}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium opacity-70">{s.label}</span>
                <s.icon className={`w-4 h-4 ${s.iconColor}`} />
              </div>
              <p className="text-2xl font-black">{loading ? '—' : s.value}</p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="flex gap-3 flex-wrap">
          <Link to="/request"
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors">
            <Plus className="w-4 h-4" /> {t('custdash.newOrder')}
          </Link>
          <Link to="/customer/orders"
            className="flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors">
            <Package className="w-4 h-4" /> {t('custdash.allOrders')}
          </Link>
          <Link to="/customer/quotes"
            className="flex items-center gap-2 bg-orange-50 border border-orange-200 hover:bg-orange-100 text-orange-700 font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors">
            <MessageSquare className="w-4 h-4" /> {t('custdash.priceCompare')}
          </Link>
          <Link to="/customer/labour"
            className="flex items-center gap-2 bg-amber-50 border border-amber-200 hover:bg-amber-100 text-amber-700 font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors">
            <Hammer className="w-4 h-4" /> {t('custdash.karigar')}
          </Link>
          <Link to="/customer/estimator"
            className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 text-indigo-700 font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors">
            <Calculator className="w-4 h-4" /> {t('custdash.estimate')}
          </Link>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">{t('custdash.recentOrders')}</h2>
            <Link to="/customer/orders" className="text-xs text-blue-500 hover:text-blue-600 font-medium">{t('custdash.viewAllOrders')}</Link>
          </div>
          {loading ? (
            <div className="py-12 text-center">
              <Loader2 className="w-5 h-5 text-gray-400 animate-spin mx-auto" />
            </div>
          ) : !stats?.recentOrders?.length ? (
            <div className="py-12 text-center">
              <ClipboardList className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">{t('custdash.noOrders')}</p>
              <Link to="/request" className="text-blue-500 text-sm font-medium mt-1 block">{t('custdash.placeFirstLink')}</Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {stats.recentOrders.map(o => (
                <Link key={o._id} to={`/customer/orders/${o.orderId}`}
                  className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors group">
                  <div className="min-w-0">
                    <p className="font-mono font-bold text-gray-900 text-sm">{o.orderId}</p>
                    <p className="text-gray-500 text-xs capitalize mt-0.5">
                      {o.category?.replace('_', ' ')} · {o.items?.length} item{o.items?.length !== 1 ? 's' : ''}
                      {o.quote?.amount && <span className="ml-1 text-gray-400">· ₹{o.quote.amount.toLocaleString('en-IN')}</span>}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <StatusBadge status={o.status} />
                    {o.payment?.status !== 'none' && <PaymentBadge status={o.payment.status} />}
                    <ArrowRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-blue-400" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </CustomerLayout>
  );
}
