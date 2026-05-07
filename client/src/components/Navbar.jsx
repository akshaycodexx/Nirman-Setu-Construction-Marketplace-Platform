import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, HardHat, User, ChevronDown, Package, Truck } from 'lucide-react';
import { useCustomer } from '../context/CustomerContext';
import { useSupplier } from '../context/SupplierContext';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [supplierDropdown, setSupplierDropdown] = useState(false);
  const { pathname } = useLocation();
  const { customer } = useCustomer();
  const { supplier } = useSupplier();

  const navLinks = [
    { to: '/#categories', label: 'Materials' },
    { to: '/request', label: 'Get Quote' },
    { to: '/track', label: 'Track Order' },
  ];

  return (
    <nav className="bg-white/95 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-1.5 rounded-xl shadow-sm shadow-orange-200">
              <HardHat className="w-5 h-5 text-white" />
            </div>
            <div className="leading-none">
              <span className="text-lg font-black text-gray-900 tracking-tight">
                Nirman<span className="text-orange-500">Setu</span>
              </span>
              <p className="text-[9px] text-gray-400 font-medium tracking-widest uppercase -mt-0.5">Construction Platform</p>
            </div>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(l => (
              <Link key={l.to} to={l.to}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === l.to ? 'bg-orange-50 text-orange-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}>
                {l.label}
              </Link>
            ))}
          </div>

          {/* Desktop right side */}
          <div className="hidden md:flex items-center gap-2">
            {/* Supplier portal */}
            <div className="relative" onMouseLeave={() => setSupplierDropdown(false)}>
              <button
                onMouseEnter={() => setSupplierDropdown(true)}
                onClick={() => setSupplierDropdown(s => !s)}
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <Package className="w-3.5 h-3.5" />
                {supplier ? supplier.name.split(' ')[0] : 'Supplier'}
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${supplierDropdown ? 'rotate-180' : ''}`} />
              </button>
              {supplierDropdown && (
                <div className="absolute right-0 top-10 w-48 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 overflow-hidden py-1">
                  {supplier ? (
                    <Link to="/supplier/dashboard" onClick={() => setSupplierDropdown(false)}
                      className="flex items-center gap-2.5 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 font-medium">
                      <Package className="w-4 h-4 text-emerald-500" /> My Dashboard
                    </Link>
                  ) : (
                    <>
                      <Link to="/supplier/login" onClick={() => setSupplierDropdown(false)}
                        className="flex items-center gap-2.5 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 font-medium">
                        <Package className="w-4 h-4 text-emerald-500" /> Supplier Login
                      </Link>
                      <Link to="/supplier/register" onClick={() => setSupplierDropdown(false)}
                        className="flex items-center gap-2.5 px-4 py-3 text-sm text-emerald-600 hover:bg-emerald-50 font-semibold border-t border-gray-50">
                        <Truck className="w-4 h-4" /> Join as Supplier
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="w-px h-5 bg-gray-200" />

            {/* Customer portal */}
            {customer ? (
              <Link to="/customer/dashboard"
                className="flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-sm font-semibold px-3 py-2 rounded-lg transition-colors">
                <User className="w-3.5 h-3.5" />
                {customer.name.split(' ')[0]}
              </Link>
            ) : (
              <Link to="/customer/login"
                className="flex items-center gap-1.5 text-gray-700 hover:text-gray-900 border border-gray-200 hover:border-gray-300 text-sm font-semibold px-3 py-2 rounded-lg transition-colors">
                <User className="w-3.5 h-3.5" /> Login
              </Link>
            )}

            <Link to="/request"
              className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold px-5 py-2 rounded-xl transition-colors shadow-sm shadow-orange-200">
              Free Quote →
            </Link>
          </div>

          {/* Mobile toggle */}
          <button className="md:hidden p-2 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors" onClick={() => setOpen(!open)}>
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-1">
          {navLinks.map(l => (
            <Link key={l.to} to={l.to} onClick={() => setOpen(false)}
              className={`block px-4 py-2.5 rounded-xl text-sm font-medium ${
                pathname === l.to ? 'bg-orange-50 text-orange-600' : 'text-gray-600 hover:bg-gray-50'
              }`}>
              {l.label}
            </Link>
          ))}

          <div className="pt-2 border-t border-gray-100 space-y-1.5">
            {/* Customer */}
            {customer ? (
              <Link to="/customer/dashboard" onClick={() => setOpen(false)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-blue-700 bg-blue-50">
                <User className="w-4 h-4" /> My Account ({customer.name.split(' ')[0]})
              </Link>
            ) : (
              <Link to="/customer/login" onClick={() => setOpen(false)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-700 bg-gray-50">
                <User className="w-4 h-4" /> Customer Login
              </Link>
            )}

            {/* Supplier */}
            {supplier ? (
              <Link to="/supplier/dashboard" onClick={() => setOpen(false)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-emerald-700 bg-emerald-50">
                <Package className="w-4 h-4" /> Supplier Dashboard ({supplier.name.split(' ')[0]})
              </Link>
            ) : (
              <>
                <Link to="/supplier/login" onClick={() => setOpen(false)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-700 bg-gray-50">
                  <Package className="w-4 h-4" /> Supplier Login
                </Link>
                <Link to="/supplier/register" onClick={() => setOpen(false)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-emerald-700 bg-emerald-50">
                  <Truck className="w-4 h-4" /> Join as Supplier — Free
                </Link>
              </>
            )}

            <Link to="/request" onClick={() => setOpen(false)}
              className="block bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold px-4 py-3 rounded-xl text-center">
              Free Quote Lo →
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
