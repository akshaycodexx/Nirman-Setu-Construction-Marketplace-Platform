import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCustomer } from '../context/CustomerContext';
import { LayoutDashboard, ClipboardList, LogOut, HardHat, Menu, X, ChevronRight, User } from 'lucide-react';

const navLinks = [
  { to: '/customer/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/customer/orders', icon: ClipboardList, label: 'My Orders' },
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

export default function CustomerLayout({ children }) {
  const { customer, logoutCustomer } = useCustomer();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
          <nav className="flex items-center gap-1.5 text-sm text-gray-500">
            <span>Customer</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-gray-900 font-medium capitalize">{pathname.split('/').pop() || 'Dashboard'}</span>
          </nav>
        </header>
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
