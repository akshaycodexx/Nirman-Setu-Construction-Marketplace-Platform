import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAdmin } from '../context/AdminContext';
import { useLang, LANGUAGES } from '../context/LanguageContext';
import useT from '../i18n/useT';
import {
  LayoutDashboard, ClipboardList, LogOut,
  HardHat, Menu, X, ChevronRight, Users, Settings, Bell, IndianRupee, TrendingUp, Wallet, AlertTriangle, BadgeIndianRupee, MessageSquare, Hammer, Boxes, Globe, ChevronDown
} from 'lucide-react';

const NAV_KEYS = [
  { to: '/admin/dashboard', icon: LayoutDashboard, key: 'admin.nav.dashboard' },
  { to: '/admin/orders', icon: ClipboardList, key: 'admin.nav.orders' },
  { to: '/admin/quotes', icon: MessageSquare, key: 'admin.nav.quotes' },
  { to: '/admin/labour', icon: Hammer, key: 'admin.nav.labour' },
  { to: '/admin/rates', icon: IndianRupee, key: 'admin.nav.rates' },
  { to: '/admin/stock', icon: Boxes, key: 'admin.nav.stock' },
  { to: '/admin/suppliers', icon: Users, key: 'admin.nav.suppliers' },
  { to: '/admin/customers', icon: HardHat, key: 'admin.nav.customers' },
  { to: '/admin/analytics', icon: TrendingUp, key: 'admin.nav.analytics' },
  { to: '/admin/payouts', icon: Wallet, key: 'admin.nav.payouts' },
  { to: '/admin/fees', icon: BadgeIndianRupee, key: 'admin.nav.fees' },
  { to: '/admin/complaints', icon: AlertTriangle, key: 'admin.nav.complaints' },
  { to: '/admin/notifications', icon: Bell, key: 'admin.nav.notifications' },
  { to: '/admin/settings', icon: Settings, key: 'admin.nav.settings' },
];

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-700',
  quoted: 'bg-blue-100 text-blue-700',
  confirmed: 'bg-indigo-100 text-indigo-700',
  dispatched: 'bg-orange-100 text-orange-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

export function StatusBadge({ status }) {
  const t = useT();
  return (
    <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${STATUS_COLORS[status] || 'bg-gray-100 text-gray-600'}`}>
      {t(`status.${status}`)}
    </span>
  );
}

function AdminSidebarContent({ admin, handleLogout, navLinks, pathname, setSidebarOpen, t }) {
  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <div className="bg-orange-500 p-1.5 rounded-lg">
            <HardHat className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-white font-bold leading-none">Nirman Setu</p>
            <p className="text-orange-400 text-xs">{t('admin.layout.panel')}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navLinks.map(l => (
          <Link
            key={l.to}
            to={l.to}
            onClick={() => setSidebarOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              pathname.startsWith(l.to)
                ? 'bg-orange-500 text-white'
                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
            }`}
          >
            <l.icon className="w-4 h-4 shrink-0" />
            {l.label}
          </Link>
        ))}
      </nav>

      {/* Admin info + logout */}
      <div className="px-3 py-4 border-t border-gray-800">
        <div className="px-3 py-2 mb-2">
          <p className="text-white text-sm font-medium truncate">{admin?.name}</p>
          <p className="text-gray-500 text-xs truncate">{admin?.email}</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-red-400 transition-colors"
        >
          <LogOut className="w-4 h-4" /> {t('common.logout')}
        </button>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }) {
  const { admin, logoutAdmin } = useAdmin();
  const { lang, changeLang } = useLang();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const t = useT();
  const navLinks = NAV_KEYS.map(n => ({ ...n, label: t(n.key) }));
  const currentLang = LANGUAGES.find(l => l.code === lang) || LANGUAGES[0];
  const breadcrumbKey = NAV_KEYS.find(n => pathname.startsWith(n.to))?.key || 'admin.nav.dashboard';
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifs, setNotifs] = useState({ newOrders: [], recentPayments: [], unread: 0 });
  const [notifOpen, setNotifOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const notifRef = useRef(null);
  const langRef = useRef(null);

  useEffect(() => {
    const fetch = () =>
      axios.get('/api/admin/notifications').then(r => setNotifs(r.data)).catch(() => {});
    fetch();
    const id = setInterval(fetch, 60000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
      if (langRef.current && !langRef.current.contains(e.target)) setLangOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    logoutAdmin();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-56 bg-gray-900 fixed inset-y-0 left-0 z-30">
        <AdminSidebarContent admin={admin} handleLogout={handleLogout} navLinks={navLinks} pathname={pathname} setSidebarOpen={setSidebarOpen} t={t} />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="fixed inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <div className="relative w-56 bg-gray-900 z-50">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-5 h-5" />
            </button>
            <AdminSidebarContent admin={admin} handleLogout={handleLogout} navLinks={navLinks} pathname={pathname} setSidebarOpen={setSidebarOpen} t={t} />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 lg:ml-56 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-4 sm:px-6 h-14 flex items-center gap-3 sticky top-0 z-20">
          <button
            className="lg:hidden p-1.5 text-gray-500 hover:text-gray-800"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-sm text-gray-500 flex-1">
            <span>{t('admin.layout.admin')}</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-gray-900 font-medium capitalize">
              {t(breadcrumbKey)}
            </span>
          </nav>

          <div className="relative" ref={langRef}>
            <button
              onClick={() => setLangOpen(o => !o)}
              className="flex items-center gap-1.5 px-2.5 py-2 text-sm font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors"
              title={t('nav.language')}
            >
              <Globe className="w-4 h-4" />
              <span className="hidden sm:inline text-xs font-semibold">{currentLang.native}</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${langOpen ? 'rotate-180' : ''}`} />
            </button>
            {langOpen && (
              <div className="absolute right-0 top-10 w-44 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 overflow-hidden py-1">
                {LANGUAGES.map(l => (
                  <button key={l.code} onClick={() => { changeLang(l.code); setLangOpen(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors ${
                      lang === l.code ? 'bg-orange-50 text-orange-700 font-semibold' : 'text-gray-700 hover:bg-gray-50'
                    }`}>
                    <span className="text-base">{l.flag}</span>
                    <div>
                      <p className="font-medium text-sm leading-tight">{l.native}</p>
                      <p className="text-xs text-gray-400">{l.label}</p>
                    </div>
                    {lang === l.code && <span className="ml-auto text-orange-500">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

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
                  <p className="font-semibold text-gray-800 text-sm">{t('admin.layout.notifications')}</p>
                  <span className="text-xs text-gray-400">{t('admin.layout.last48')}</span>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifs.newOrders.length === 0 && notifs.recentPayments.length === 0 ? (
                    <p className="text-center text-gray-400 text-sm py-8">{t('admin.layout.noNotifications')}</p>
                  ) : (
                    <>
                      {notifs.newOrders.map(o => (
                        <Link key={o._id} to={`/admin/orders/${o.orderId}`}
                          onClick={() => setNotifOpen(false)}
                          className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 border-b border-gray-50 transition-colors">
                          <div className="w-7 h-7 bg-orange-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                            <Bell className="w-3.5 h-3.5 text-orange-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-800">{t('admin.layout.newOrder')}: {o.orderId}</p>
                            <p className="text-xs text-gray-500">{o.customer?.name} · {o.category?.replace('_', ' ')}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{new Date(o.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                          </div>
                        </Link>
                      ))}
                      {notifs.recentPayments.map(o => (
                        <Link key={o._id + 'p'} to={`/admin/orders/${o.orderId}`}
                          onClick={() => setNotifOpen(false)}
                          className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 border-b border-gray-50 transition-colors">
                          <div className="w-7 h-7 bg-green-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                            <IndianRupee className="w-3.5 h-3.5 text-green-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-800">Payment: {o.orderId}</p>
                            <p className="text-xs text-gray-500">{o.customer?.name} · ₹{o.payment?.advanceAmount?.toLocaleString('en-IN')}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{new Date(o.payment?.advancePaidAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                          </div>
                        </Link>
                      ))}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
