import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import SupplierLayout from '../../components/SupplierLayout';
import { useSupplier } from '../../context/SupplierContext';
import { Package, CheckCircle, Truck, ArrowRight, LayoutDashboard, ToggleLeft, ToggleRight, Star, IndianRupee, CalendarDays, AlertCircle, Clock } from 'lucide-react';

const STATUS_COLORS = {
  confirmed: 'bg-indigo-100 text-indigo-700',
  dispatched: 'bg-orange-100 text-orange-700',
  delivered: 'bg-green-100 text-green-700',
};

export default function SupplierDashboard() {
  const { supplier, getAuthHeaders } = useSupplier();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [available, setAvailable] = useState(supplier?.availability ?? true);
  const [upcoming, setUpcoming] = useState([]);

  useEffect(() => {
    axios.get('/api/supplier/dashboard', { headers: getAuthHeaders() })
      .then(r => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
    axios.get('/api/supplier/upcoming', { headers: getAuthHeaders() })
      .then(r => setUpcoming(r.data.orders || []))
      .catch(() => {});
  }, []);

  const toggleAvailability = async () => {
    setToggling(true);
    try {
      const { data: res } = await axios.put('/api/supplier/availability',
        { availability: !available },
        { headers: getAuthHeaders() }
      );
      setAvailable(res.availability);
    } catch {}
    setToggling(false);
  };

  const stats = [
    { key: 'total', label: 'Total Orders', icon: Package, color: 'bg-gray-900 text-white' },
    { key: 'confirmed', label: 'To Dispatch', icon: CheckCircle, color: 'bg-indigo-50 text-indigo-700' },
    { key: 'dispatched', label: 'In Transit', icon: Truck, color: 'bg-orange-50 text-orange-700' },
    { key: 'delivered', label: 'Delivered', icon: CheckCircle, color: 'bg-green-50 text-green-700' },
  ];
  const perf = data?.performance || {};
  const pendingAcceptance = data?.pendingAcceptance || 0;
  const pendingPayout = data?.pendingPayout || { total: 0, count: 0 };

  return (
    <SupplierLayout>
      <div className="mb-5 flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <LayoutDashboard className="w-6 h-6 text-emerald-500" /> Dashboard
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">Welcome, {supplier?.name}</p>
        </div>

        {/* Availability toggle */}
        <button
          onClick={toggleAvailability}
          disabled={toggling}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-colors ${
            available
              ? 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100'
              : 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100'
          }`}
        >
          {available
            ? <><ToggleRight className="w-5 h-5" /> Available</>
            : <><ToggleLeft className="w-5 h-5" /> Unavailable</>
          }
        </button>
      </div>

      {/* Pending acceptance banner */}
      {!loading && pendingAcceptance > 0 && (
        <Link to="/supplier/orders"
          className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-3 mb-4 hover:bg-amber-100 transition-colors">
          <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
          <span className="text-sm font-semibold text-amber-800">
            {pendingAcceptance} order{pendingAcceptance > 1 ? 's' : ''} tumhara response chahta hai — accept ya decline karo
          </span>
          <ArrowRight className="w-4 h-4 text-amber-400 ml-auto shrink-0" />
        </Link>
      )}

      {/* Pending payout banner */}
      {!loading && pendingPayout.count > 0 && (
        <Link to="/supplier/earnings"
          className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-2xl px-5 py-3 mb-4 hover:bg-green-100 transition-colors">
          <Clock className="w-4 h-4 text-green-600 shrink-0" />
          <span className="text-sm font-semibold text-green-800">
            ₹{pendingPayout.total.toLocaleString('en-IN')} payout pending — {pendingPayout.count} order{pendingPayout.count > 1 ? 's' : ''} ka payment aana baki hai
          </span>
          <ArrowRight className="w-4 h-4 text-green-500 ml-auto shrink-0" />
        </Link>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {stats.map(s => (
          <div key={s.key} className={`rounded-2xl p-4 border border-gray-100 ${s.color}`}>
            <s.icon className="w-5 h-5 mb-2 opacity-70" />
            <p className="text-2xl font-black">{loading ? '—' : data?.stats?.[s.key] ?? 0}</p>
            <p className="text-xs font-medium opacity-70 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Performance */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="rounded-2xl p-4 border border-yellow-100 bg-yellow-50">
          <div className="flex items-center gap-1.5 mb-2">
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-400" />
            <span className="text-xs font-medium text-yellow-700">Avg Rating</span>
          </div>
          <p className="text-2xl font-black text-yellow-800">
            {loading ? '—' : perf.avgRating != null ? `${perf.avgRating}/5` : 'N/A'}
          </p>
          <p className="text-xs text-yellow-600 mt-0.5">{loading ? '' : perf.ratingCount ? `${perf.ratingCount} review${perf.ratingCount !== 1 ? 's' : ''}` : 'No reviews yet'}</p>
        </div>
        <div className="rounded-2xl p-4 border border-green-100 bg-green-50">
          <div className="flex items-center gap-1.5 mb-2">
            <IndianRupee className="w-4 h-4 text-green-600" />
            <span className="text-xs font-medium text-green-700">Total Earnings</span>
          </div>
          <p className="text-2xl font-black text-green-800">
            {loading ? '—' : perf.earnings ? `₹${perf.earnings.toLocaleString('en-IN')}` : '₹0'}
          </p>
          <p className="text-xs text-green-600 mt-0.5">Paid payouts</p>
        </div>
      </div>

      {/* Upcoming Deliveries */}
      {upcoming.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-4">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100">
            <CalendarDays className="w-4 h-4 text-emerald-500" />
            <h2 className="font-semibold text-gray-900">Upcoming Deliveries</h2>
            <span className="ml-auto text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">{upcoming.length}</span>
          </div>
          <div className="divide-y divide-gray-50">
            {upcoming.map(order => {
              const dDate = new Date(order.delivery?.date);
              const today = new Date();
              today.setHours(0,0,0,0);
              const diff = Math.ceil((dDate - today) / (1000 * 60 * 60 * 24));
              const urgency = diff === 0 ? 'Today' : diff === 1 ? 'Tomorrow' : `${diff}d left`;
              const urgencyColor = diff <= 1 ? 'text-red-600 bg-red-50' : diff <= 3 ? 'text-orange-600 bg-orange-50' : 'text-gray-500 bg-gray-50';
              return (
                <Link key={order._id} to={`/supplier/orders/${order.orderId}`}
                  className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 transition-colors group">
                  <div className={`text-center rounded-xl px-3 py-1.5 text-xs font-bold shrink-0 ${urgencyColor}`}>
                    <p>{dDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                    <p>{urgency}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-mono text-sm font-bold text-gray-900">{order.orderId}</span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600'}`}>
                        {order.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 capitalize">{order.category} &bull; {order.delivery?.city} &bull; {order.delivery?.slot}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-emerald-400 shrink-0" />
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent orders */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Recent Orders</h2>
          <Link to="/supplier/orders" className="text-sm text-emerald-600 hover:text-emerald-700 flex items-center gap-1 font-medium">
            All Orders <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="divide-y">{[...Array(4)].map((_, i) => <div key={i} className="h-14 animate-pulse bg-gray-50" />)}</div>
        ) : !data?.recent?.length ? (
          <div className="py-12 text-center text-gray-400">
            <Package className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p>Koi order assign nahi hua abhi</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {data.recent.map(order => (
              <Link
                key={order._id}
                to={`/supplier/orders/${order.orderId}`}
                className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 transition-colors group"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-mono text-sm font-bold text-gray-900">{order.orderId}</span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600'}`}>
                      {order.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 capitalize">{order.category} &bull; {order.delivery?.city}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-emerald-400 shrink-0" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </SupplierLayout>
  );
}
