import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCustomer } from '../context/CustomerContext';
import { LayoutDashboard, ClipboardList, LogOut, HardHat, Menu, X, ChevronRight, User, Settings, Bell, CheckCircle, IndianRupee, Package, AlertCircle } from 'lucide-react';

const navLinks = [
  { to: '/customer/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/customer/orders', icon: ClipboardList, label: 'My Orders' },
  { to: '/customer/notifications', icon: Bell, label: 'Notifications' },
  { to: '/customer/profile', icon: Settings, label: 'Profile' },
];

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-700',
  quoted: 'bg-blue-100 text-blue-700',
  confirmed: 'bg-indigo-100 text-indigo-700',
  dispatched: 'bg-orange-100 text-orange-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

const PAYMENT_COLORS = {
  none: 'bg-gray-100 text-gray-600',
  advance_paid: 'bg-blue-100 text-blue-700',
  fully_paid: 'bg-green-100 text-green-700',
  refunded: 'bg-red-100 text-red-700',
};

export function StatusBadge({ status }) {
  return (
    <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${STATUS_COLORS[status] || 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  );
}

export function PaymentBadge({ status }) {
  const label = { none: 'Unpaid', advance_paid: 'Advance Paid', fully_paid: 'Fully Paid', refunded: 'Refunded' }[status] || status;
  return (
    <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${PAYMENT_COLORS[status] || 'bg-gray-100 text-gray-600'}`}>
      {label}
    </span>
  );
}

const NOTIF_ICONS = {
  quote: { icon: Package, bg: 'bg-blue-100', color: 'text-blue-600', label: 'Quote Received' },
  payment: { icon: IndianRupee, bg: 'bg-green-100', color: 'text-green-600', label: 'Payment' },
  complaint: { icon: CheckCircle, bg: 'bg-purple-100', color: 'text-purple-600', label: 'Complaint' },
  status: { icon: AlertCircle, bg: 'bg-orange-100', color: 'text-orange-600', label: 'Update' },
};

export default function CustomerLayout({ children }) {
  const { customer, logoutCustomer, authHeader } = useCustomer();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifs, setNotifs] = useState({ notifications: [], unread: 0 });
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef(null);

  useEffect(() => {
    if (!customer) return;
    const fetchNotifs = () =>
      axios.get('/api/customer/notifications', { headers: authHeader() })
        .then(r => setNotifs(r.data))
        .catch(() => {});
    fetchNotifs();
    const id = setInterval(fetchNotifs, 60000);
    return () => clearInterval(id);
  }, [customer]);

  useEffect(() => {
    const handler = (e) => { if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    logoutCustomer();
    navigate('/customer/login');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="px-4 py-5 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <div className="bg-blue-500 p-1.5 rounded-lg">
            <HardHat className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-white font-bold leading-none">Nirman Setu</p>
            <p className="text-blue-400 text-xs">Customer Portal</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navLinks.map(l => (
          <Link key={l.to} to={l.to} onClick={() => setSidebarOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              pathname.startsWith(l.to) ? 'bg-blue-500 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
            }`}>
            <l.icon className="w-4 h-4 shrink-0" />
            {l.label}
          </Link>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-gray-800">
        <div className="flex items-center gap-2 px-3 py-2 mb-2">
          <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center shrink-0">
            <User className="w-3.5 h-3.5 text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-white text-sm font-medium truncate">{customer?.name}</p>
            <p className="text-gray-500 text-xs truncate">{customer?.phone}</p>
          </div>
        </div>
        <button onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-red-400 transition-colors">
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="hidden lg:flex lg:flex-col w-56 bg-gray-900 fixed inset-y-0 left-0 z-30">
        <SidebarContent />
      </aside>

      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="fixed inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <div className="relative w-56 bg-gray-900 z-50">
            <button className="absolute top-4 right-4 text-gray-400 hover:text-white" onClick={() => setSidebarOpen(false)}>
              <X className="w-5 h-5" />
            </button>
            <SidebarContent />
          </div>
        </div>
      )}

      <div className="flex-1 lg:ml-56 flex flex-col min-h-screen">
        <header className="bg-white border-b border-gray-200 px-4 sm:px-6 h-14 flex items-center gap-3 sticky top-0 z-20">
          <button className="lg:hidden p-1.5 text-gray-500 hover:text-gray-800" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-5 h-5" />
          </button>
          <nav className="flex items-center gap-1.5 text-sm text-gray-500 flex-1">
            <span>Customer</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-gray-900 font-medium capitalize">{pathname.split('/').pop() || 'Dashboard'}</span>
          </nav>

          {/* Notification Bell */}
          <div className="relative" ref={notifRef}>
            <button onClick={() => setNotifOpen(o => !o)}
              className="relative p-2 rounded-xl text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors">
              <Bell className="w-5 h-5" />
              {notifs.unread > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {notifs.unread > 9 ? '9+' : notifs.unread}
                </span>
              )}
            </button>

            {notifOpen && (
              <div className="absolute right-0 top-11 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                  <p className="font-semibold text-gray-800 text-sm">Notifications</p>
                  <span className="text-xs text-gray-400">Last 48 hrs</span>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifs.notifications.length === 0 ? (
                    <p className="text-center text-gray-400 text-sm py-8">Koi naya notification nahi</p>
                  ) : (
                    notifs.notifications.map(n => {
                      const cfg = NOTIF_ICONS[n.type] || NOTIF_ICONS.status;
                      const Icon = cfg.icon;
                      return (
                        <Link key={n._id} to={`/customer/orders/${n.orderId}`}
                          onClick={() => setNotifOpen(false)}
                          className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 border-b border-gray-50 transition-colors">
                          <div className={`w-7 h-7 ${cfg.bg} rounded-full flex items-center justify-center shrink-0 mt-0.5`}>
                            <Icon className={`w-3.5 h-3.5 ${cfg.color}`} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-800 capitalize">{n.orderId} — {n.status?.replace('_', ' ')}</p>
                            {n.note && <p className="text-xs text-gray-500 truncate">{n.note}</p>}
                            <p className="text-xs text-gray-400 mt-0.5">{new Date(n.at).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                          </div>
                        </Link>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
