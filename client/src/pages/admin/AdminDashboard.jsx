import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import AdminLayout, { StatusBadge } from '../../components/AdminLayout';
import {
  Package, Clock, Truck, CheckCircle, XCircle,
  ArrowRight, IndianRupee, Users, FileText, TrendingUp, Wallet, Bell, Flag, ShieldAlert, Star, CalendarClock, BadgeIndianRupee, ThumbsDown
} from 'lucide-react';
import { useSocket } from '../../context/SocketContext';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const socketRef = useSocket();

  useEffect(() => {
    axios.get('/api/admin/dashboard')
      .then(r => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Real-time: join admin room + listen for new orders
  useEffect(() => {
    const socket = socketRef?.current;
    if (!socket) return;

    socket.emit('join:admin');

    const handleNewOrder = (order) => {
      toast.custom((t) => (
        <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} flex items-start gap-3 bg-white border border-orange-200 shadow-lg rounded-2xl px-4 py-3 max-w-sm`}>
          <Bell className="w-5 h-5 text-orange-500 mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold text-gray-900 text-sm">Naya Order! 🔔</p>
            <p className="text-xs text-gray-600 mt-0.5">{order.customerName} — {order.category} ({order.city})</p>
            <Link to={`/admin/orders/${order.orderId}`} onClick={() => toast.dismiss(t.id)}
              className="text-xs text-orange-600 font-semibold mt-1 inline-block hover:underline">
              {order.orderId} dekho →
            </Link>
          </div>
        </div>
      ), { duration: 8000 });

      // Refresh dashboard stats
      axios.get('/api/admin/dashboard').then(r => setData(r.data)).catch(() => {});
    };

    socket.on('order:new', handleNewOrder);
    return () => socket.off('order:new', handleNewOrder);
  }, [socketRef]);

  const s = data?.stats || {};
  const r = data?.revenue || {};
  const p = data?.payable || {};
  const openComplaints = data?.openComplaints || 0;
  const highValueOrders = data?.highValueOrders || [];
  const riskSummary = data?.riskSummary || { yellow: 0, red: 0 };
  const lateOrders = data?.lateOrders || [];
  const declinedOrders = data?.declinedOrders || [];
  const platformFees = data?.platformFees || {};

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Nirman Setu — Overview</p>
      </div>

      {/* Complaints alert */}
      {!loading && openComplaints > 0 && (
        <Link to="/admin/orders?complaints=open"
          className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-2xl px-5 py-3 mb-3 hover:bg-red-100 transition-colors">
          <Flag className="w-4 h-4 text-red-500 shrink-0" />
          <span className="text-sm font-semibold text-red-700">{openComplaints} open complaint{openComplaints > 1 ? 's' : ''} — turant dhyan dein</span>
          <ArrowRight className="w-4 h-4 text-red-400 ml-auto shrink-0" />
        </Link>
      )}

      {/* High-value orders alert */}
      {!loading && highValueOrders.length > 0 && (
        <Link to="/admin/orders?status=pending"
          className="flex items-center gap-3 bg-yellow-50 border border-yellow-200 rounded-2xl px-5 py-3 mb-3 hover:bg-yellow-100 transition-colors">
          <Star className="w-4 h-4 text-yellow-500 shrink-0 fill-yellow-400" />
          <span className="text-sm font-semibold text-yellow-800">
            {highValueOrders.length} high-value order{highValueOrders.length > 1 ? 's' : ''} pending —
            {' '}₹{highValueOrders[0]?.quote?.amount?.toLocaleString('en-IN')} highest
          </span>
          <ArrowRight className="w-4 h-4 text-yellow-500 ml-auto shrink-0" />
        </Link>
      )}

      {/* Risk alert */}
      {!loading && (riskSummary.red > 0 || riskSummary.yellow > 0) && (
        <Link to="/admin/orders?risk=red"
          className="flex items-center gap-3 bg-orange-50 border border-orange-200 rounded-2xl px-5 py-3 mb-3 hover:bg-orange-100 transition-colors">
          <ShieldAlert className="w-4 h-4 text-orange-500 shrink-0" />
          <span className="text-sm font-semibold text-orange-800">
            {riskSummary.red > 0 && <span className="text-red-700">{riskSummary.red} high-risk</span>}
            {riskSummary.red > 0 && riskSummary.yellow > 0 && ' · '}
            {riskSummary.yellow > 0 && <span className="text-yellow-700">{riskSummary.yellow} caution</span>}
            {' '}active orders — verify before dispatch
          </span>
          <ArrowRight className="w-4 h-4 text-orange-400 ml-auto shrink-0" />
        </Link>
      )}

      {/* Supplier declined — reassign needed */}
      {!loading && declinedOrders.length > 0 && (
        <Link to="/admin/orders?status=pending"
          className="flex items-center gap-3 bg-purple-50 border border-purple-200 rounded-2xl px-5 py-3 mb-3 hover:bg-purple-100 transition-colors">
          <ThumbsDown className="w-4 h-4 text-purple-500 shrink-0" />
          <span className="text-sm font-semibold text-purple-800">
            {declinedOrders.length} order{declinedOrders.length > 1 ? 's' : ''} supplier ne decline kiya — reassign karo:{' '}
            {declinedOrders.slice(0, 2).map(o => o.orderId).join(', ')}
            {declinedOrders.length > 2 && ` +${declinedOrders.length - 2} more`}
          </span>
          <ArrowRight className="w-4 h-4 text-purple-400 ml-auto shrink-0" />
        </Link>
      )}

      {/* Late delivery alert */}
      {!loading && lateOrders.length > 0 && (
        <Link to="/admin/orders?status=dispatched"
          className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-2xl px-5 py-3 mb-3 hover:bg-red-100 transition-colors">
          <CalendarClock className="w-4 h-4 text-red-500 shrink-0" />
          <span className="text-sm font-semibold text-red-800">
            {lateOrders.length} order{lateOrders.length > 1 ? 's' : ''} late —{' '}
            delivery date nikal gayi: {lateOrders.slice(0, 2).map(o => o.orderId).join(', ')}
            {lateOrders.length > 2 && ` +${lateOrders.length - 2} more`}
          </span>
          <ArrowRight className="w-4 h-4 text-red-400 ml-auto shrink-0" />
        </Link>
      )}

      {/* Pending platform fees alert */}
      {!loading && platformFees.pendingCount > 0 && (
        <Link to="/admin/fees"
          className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-3 mb-5 hover:bg-amber-100 transition-colors">
          <BadgeIndianRupee className="w-4 h-4 text-amber-600 shrink-0" />
          <span className="text-sm font-semibold text-amber-800">
            {platformFees.pendingCount} pending platform fee{platformFees.pendingCount > 1 ? 's' : ''} — ₹{(platformFees.pendingTotal || 0).toLocaleString('en-IN')} due
          </span>
          <ArrowRight className="w-4 h-4 text-amber-400 ml-auto shrink-0" />
        </Link>
      )}

      {/* Revenue cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
        <RevenueCard
          loading={loading}
          label="Advance Collected"
          value={r.advanceCollected ? `₹${r.advanceCollected.toLocaleString('en-IN')}` : '₹0'}
          icon={IndianRupee}
          color="bg-green-500"
          sub="Payments received"
        />
        <RevenueCard
          loading={loading}
          label="Total Quoted Value"
          value={r.totalQuotedValue ? `₹${r.totalQuotedValue.toLocaleString('en-IN')}` : '₹0'}
          icon={TrendingUp}
          color="bg-orange-500"
          sub="All quotes combined"
        />
        <RevenueCard
          loading={loading}
          label="Total Orders"
          value={s.total ?? 0}
          icon={Package}
          color="bg-gray-800"
          sub={`${s.pending ?? 0} pending action`}
        />
        <RevenueCard
          loading={loading}
          label="Customers"
          value={s.totalCustomers ?? 0}
          icon={Users}
          color="bg-blue-500"
          sub="Registered accounts"
        />
        <RevenueCard
          loading={loading}
          label="Supplier Payable"
          value={p.total ? `₹${p.total.toLocaleString('en-IN')}` : '₹0'}
          icon={Wallet}
          color="bg-red-500"
          sub={`${p.count ?? 0} orders pending`}
          highlight={p.count > 0}
        />
      </div>

      {/* Status grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {[
          { key: 'pending', label: 'Pending', icon: Clock, cls: 'bg-yellow-50 text-yellow-700 border-yellow-100' },
          { key: 'quoted', label: 'Quoted', icon: FileText, cls: 'bg-blue-50 text-blue-700 border-blue-100' },
          { key: 'confirmed', label: 'Confirmed', icon: CheckCircle, cls: 'bg-indigo-50 text-indigo-700 border-indigo-100' },
          { key: 'dispatched', label: 'Dispatched', icon: Truck, cls: 'bg-orange-50 text-orange-700 border-orange-100' },
          { key: 'delivered', label: 'Delivered', icon: CheckCircle, cls: 'bg-green-50 text-green-700 border-green-100' },
          { key: 'cancelled', label: 'Cancelled', icon: XCircle, cls: 'bg-red-50 text-red-700 border-red-100' },
        ].map(card => (
          <Link key={card.key} to={`/admin/orders?status=${card.key}`}
            className={`rounded-2xl p-4 border ${card.cls} hover:opacity-80 transition-opacity`}>
            <card.icon className="w-4 h-4 mb-2 opacity-70" />
            <p className="text-2xl font-black">{loading ? '—' : (s[card.key] ?? 0)}</p>
            <p className="text-xs font-medium opacity-70 mt-0.5">{card.label}</p>
          </Link>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Recent Orders</h2>
          <Link to="/admin/orders" className="text-sm text-orange-500 hover:text-orange-600 flex items-center gap-1 font-medium">
            All Orders <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="divide-y divide-gray-50">
            {[...Array(5)].map((_, i) => <div key={i} className="px-5 py-4 h-16 animate-pulse bg-gray-50" />)}
          </div>
        ) : !data?.recent?.length ? (
          <div className="px-5 py-12 text-center text-gray-400">
            <Package className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p>Koi order nahi abhi</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {data.recent.map(order => (
              <Link key={order._id} to={`/admin/orders/${order.orderId}`}
                className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 transition-colors group">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <span className="font-mono text-sm font-bold text-gray-900">{order.orderId}</span>
                    <StatusBadge status={order.status} />
                    {order.quote?.amount && (
                      <span className={`text-xs font-medium ${order.quote.amount >= 25000 ? 'text-yellow-700 bg-yellow-50 px-1.5 py-0.5 rounded-full' : 'text-gray-500'}`}>
                        ₹{order.quote.amount.toLocaleString('en-IN')}
                      </span>
                    )}
                    {order.customerRisk === 'red' && <span className="text-xs font-semibold px-1.5 py-0.5 rounded-full bg-red-100 text-red-700">High Risk</span>}
                    {order.customerRisk === 'yellow' && <span className="text-xs font-semibold px-1.5 py-0.5 rounded-full bg-yellow-100 text-yellow-700">Caution</span>}
                  </div>
                  <p className="text-sm text-gray-500 truncate">
                    {order.customer?.name} &bull; {order.delivery?.city} &bull;{' '}
                    <span className="capitalize">{order.category}</span>
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-gray-400">
                    {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </p>
                  <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-orange-400 transition-colors ml-auto mt-1" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

function RevenueCard({ loading, label, value, icon: Icon, color, sub, highlight }) {
  return (
    <div className={`rounded-2xl border p-5 shadow-sm ${highlight ? 'bg-red-50 border-red-100' : 'bg-white border-gray-100'}`}>
      <div className="flex items-center justify-between mb-3">
        <span className={`text-xs font-medium ${highlight ? 'text-red-600' : 'text-gray-500'}`}>{label}</span>
        <div className={`${color} p-1.5 rounded-lg`}>
          <Icon className="w-3.5 h-3.5 text-white" />
        </div>
      </div>
      <p className={`text-2xl font-black ${highlight ? 'text-red-700' : 'text-gray-900'}`}>{loading ? '—' : value}</p>
      <p className={`text-xs mt-1 ${highlight ? 'text-red-400' : 'text-gray-400'}`}>{sub}</p>
    </div>
  );
}
