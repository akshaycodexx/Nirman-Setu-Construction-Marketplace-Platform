import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, HardHat, User, ChevronDown, Package, Truck, Globe } from 'lucide-react';
import { useCustomer } from '../context/CustomerContext';
import { useSupplier } from '../context/SupplierContext';
import { useLang, LANGUAGES } from '../context/LanguageContext';
import useT from '../i18n/useT';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [supplierDropdown, setSupplierDropdown] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const { pathname } = useLocation();
  const { customer } = useCustomer();
  const { supplier } = useSupplier();
  const { lang, changeLang } = useLang();
  const t = useT();
  const langRef = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (langRef.current && !langRef.current.contains(e.target)) setLangOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const navLinks = [
    { to: '/#categories', label: t('nav.materials') },
    { to: '/request', label: t('nav.getQuote') },
    { to: '/track', label: t('nav.trackOrder') },
    { to: '/blog',  label: t('nav.blog') },
  ];

  const currentLang = LANGUAGES.find(l => l.code === lang) || LANGUAGES[0];

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

          {/* Desktop nav links */}
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

          {/* Desktop right */}
          <div className="hidden md:flex items-center gap-2">

            {/* Language picker */}
            <div className="relative" ref={langRef}>
              <button
                onClick={() => setLangOpen(o => !o)}
                className="flex items-center gap-1.5 px-2.5 py-2 text-sm font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors"
                title={t('nav.language')}
              >
                <Globe className="w-4 h-4" />
                <span className="text-xs font-semibold">{currentLang.native}</span>
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

            <div className="w-px h-5 bg-gray-200" />

            {/* Supplier portal */}
            <div className="relative" onMouseLeave={() => setSupplierDropdown(false)}>
              <button
                onMouseEnter={() => setSupplierDropdown(true)}
                onClick={() => setSupplierDropdown(s => !s)}
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <Package className="w-3.5 h-3.5" />
                {supplier ? supplier.name.split(' ')[0] : t('nav.supplier')}
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${supplierDropdown ? 'rotate-180' : ''}`} />
              </button>
              {supplierDropdown && (
                <div className="absolute right-0 top-10 w-52 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 overflow-hidden py-1">
                  {supplier ? (
                    <Link to="/supplier/dashboard" onClick={() => setSupplierDropdown(false)}
                      className="flex items-center gap-2.5 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 font-medium">
                      <Package className="w-4 h-4 text-emerald-500" /> {t('nav.supplierDash')}
                    </Link>
                  ) : (
                    <>
                      <Link to="/supplier/login" onClick={() => setSupplierDropdown(false)}
                        className="flex items-center gap-2.5 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 font-medium">
                        <Package className="w-4 h-4 text-emerald-500" /> {t('nav.supplierLogin')}
                      </Link>
                      <Link to="/supplier/register" onClick={() => setSupplierDropdown(false)}
                        className="flex items-center gap-2.5 px-4 py-3 text-sm text-emerald-600 hover:bg-emerald-50 font-semibold border-t border-gray-50">
                        <Truck className="w-4 h-4" /> {t('nav.joinSupplier')}
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
                <User className="w-3.5 h-3.5" /> {t('nav.login')}
              </Link>
            )}

            <Link to="/request"
              className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold px-5 py-2 rounded-xl transition-colors shadow-sm shadow-orange-200">
              {t('nav.freeQuote')}
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
            {/* Language selector mobile */}
            <div className="px-4 py-2">
              <p className="text-xs text-gray-400 font-medium mb-2 uppercase tracking-wide">{t('nav.language')}</p>
              <div className="flex flex-wrap gap-2">
                {LANGUAGES.map(l => (
                  <button key={l.code} onClick={() => changeLang(l.code)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
                      lang === l.code ? 'bg-orange-500 text-white border-orange-500' : 'bg-gray-50 text-gray-600 border-gray-200'
                    }`}>
                    {l.flag} {l.native}
                  </button>
                ))}
              </div>
            </div>

            {/* Customer */}
            {customer ? (
              <Link to="/customer/dashboard" onClick={() => setOpen(false)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-blue-700 bg-blue-50">
                <User className="w-4 h-4" /> {t('nav.myAccount')} ({customer.name.split(' ')[0]})
              </Link>
            ) : (
              <Link to="/customer/login" onClick={() => setOpen(false)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-700 bg-gray-50">
                <User className="w-4 h-4" /> {t('nav.customerLogin')}
              </Link>
            )}

            {/* Supplier */}
            {supplier ? (
              <Link to="/supplier/dashboard" onClick={() => setOpen(false)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-emerald-700 bg-emerald-50">
                <Package className="w-4 h-4" /> {t('nav.supplierDash')} ({supplier.name.split(' ')[0]})
              </Link>
            ) : (
              <>
                <Link to="/supplier/login" onClick={() => setOpen(false)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-700 bg-gray-50">
                  <Package className="w-4 h-4" /> {t('nav.supplierLogin')}
                </Link>
                <Link to="/supplier/register" onClick={() => setOpen(false)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-emerald-700 bg-emerald-50">
                  <Truck className="w-4 h-4" /> {t('nav.joinSupplier')}
                </Link>
              </>
            )}

            <Link to="/request" onClick={() => setOpen(false)}
              className="block bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold px-4 py-3 rounded-xl text-center">
              {t('nav.freeQuote')}
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
