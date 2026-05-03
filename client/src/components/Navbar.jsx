import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, HardHat, User } from 'lucide-react';
import { useCustomer } from '../context/CustomerContext';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const { customer } = useCustomer();

  const links = [
    { to: '/', label: 'Home' },
    { to: '/request', label: 'Order Request' },
    { to: '/track', label: 'Track Order' },
  ];

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-orange-500 p-1.5 rounded-lg">
              <HardHat className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">
              Nirman <span className="text-orange-500">Setu</span>
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1">
            {links.map(l => (
              <Link key={l.to} to={l.to}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === l.to ? 'bg-orange-50 text-orange-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}>
                {l.label}
              </Link>
            ))}
            <div className="flex items-center gap-2 ml-3">
              {customer ? (
                <Link to="/customer/dashboard"
                  className="flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
                  <User className="w-3.5 h-3.5" />
                  {customer.name.split(' ')[0]}
                </Link>
              ) : (
                <Link to="/customer/login"
                  className="flex items-center gap-1.5 border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
                  <User className="w-3.5 h-3.5" /> Login
                </Link>
              )}
              <Link to="/request"
                className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors">
                Get Quote
              </Link>
            </div>
          </div>

          {/* Mobile toggle */}
          <button className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100" onClick={() => setOpen(!open)}>
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-1">
          {links.map(l => (
            <Link key={l.to} to={l.to} onClick={() => setOpen(false)}
              className={`block px-4 py-2.5 rounded-lg text-sm font-medium ${
                pathname === l.to ? 'bg-orange-50 text-orange-600' : 'text-gray-600 hover:bg-gray-50'
              }`}>
              {l.label}
            </Link>
          ))}
          {customer ? (
            <Link to="/customer/dashboard" onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-blue-700 bg-blue-50">
              <User className="w-3.5 h-3.5" /> My Orders ({customer.name.split(' ')[0]})
            </Link>
          ) : (
            <Link to="/customer/login" onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-gray-700 bg-gray-50">
              <User className="w-3.5 h-3.5" /> Customer Login
            </Link>
          )}
          <Link to="/request" onClick={() => setOpen(false)}
            className="block bg-orange-500 text-white text-sm font-semibold px-4 py-2.5 rounded-lg text-center mt-2">
            Get Quote
          </Link>
        </div>
      )}
    </nav>
  );
}
