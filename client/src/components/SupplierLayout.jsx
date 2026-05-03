import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSupplier } from '../context/SupplierContext';
import { LayoutDashboard, ClipboardList, LogOut, HardHat, Menu, X, ChevronRight, CheckCircle, Settings } from 'lucide-react';

const navLinks = [
  { to: '/supplier/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/supplier/orders', icon: ClipboardList, label: 'My Orders' },
  { to: '/supplier/profile', icon: Settings, label: 'Profile' },
];

export default function SupplierLayout({ children }) {
  const { supplier, logoutSupplier } = useSupplier();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logoutSupplier();
    navigate('/supplier/login');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="px-4 py-5 border-b border-emerald-800">
        <div className="flex items-center gap-2">
          <div className="bg-emerald-500 p-1.5 rounded-lg">
            <HardHat className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-white font-bold leading-none">Nirman Setu</p>
            <p className="text-emerald-400 text-xs">Supplier Panel</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navLinks.map(l => (
          <Link
            key={l.to}
            to={l.to}
            onClick={() => setSidebarOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              pathname.startsWith(l.to)
                ? 'bg-emerald-500 text-white'
                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
            }`}
          >
            <l.icon className="w-4 h-4 shrink-0" />
            {l.label}
          </Link>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-gray-800">
        <div className="px-3 py-2 mb-2">
          <div className="flex items-center gap-1.5">
            <p className="text-white text-sm font-medium truncate">{supplier?.name}</p>
            {supplier?.verifiedBadge && <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
          </div>
          <p className="text-gray-500 text-xs truncate">{supplier?.phone}</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-red-400 transition-colors"
        >
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
          <button className="lg:hidden p-1.5 text-gray-500" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-5 h-5" />
          </button>
          <nav className="flex items-center gap-1.5 text-sm text-gray-500">
            <span>Supplier</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-gray-900 font-medium capitalize">{pathname.split('/').pop() || 'Dashboard'}</span>
          </nav>
        </header>
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
