import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import WhatsAppButton from '../components/WhatsAppButton';
import { useCustomer } from '../context/CustomerContext';
import { useSupplier } from '../context/SupplierContext';
import useT from '../i18n/useT';
import {
  Package, Shield, Clock, Star, HardHat,
  ArrowRight, CheckCircle, ChevronRight,
  MessageSquare, Hammer, Calculator, FolderOpen,
  TrendingUp, Zap, IndianRupee, BadgeCheck, Users
} from 'lucide-react';

const categories = [
  { icon: '🧱', name: 'Cement', desc: 'OPC, PPC — all grades', tag: 'basic_materials' },
  { icon: '🪨', name: 'Balu / Sand', desc: 'River sand, M-sand', tag: 'basic_materials' },
  { icon: '⬛', name: 'Gitti / Aggregate', desc: '10mm, 20mm, 40mm', tag: 'basic_materials' },
  { icon: '🔩', name: 'Sariya / TMT', desc: 'Fe500, Fe550 grade steel', tag: 'basic_materials' },
  { icon: '🚜', name: 'JCB / Excavator', desc: 'Hourly / daily hire', tag: 'machinery' },
  { icon: '🚛', name: 'Truck / Dumper', desc: 'Material transport', tag: 'transport' },
];

const STATS_KEYS = [
  { value: '500+', labelKey: 'home.stats.orders', icon: '📦' },
  { value: '50+', labelKey: 'home.stats.suppliers', icon: '✅' },
  { value: '98%', labelKey: 'home.stats.ontime', icon: '⚡' },
  { value: '4.8★', labelKey: 'home.stats.rating', icon: '⭐' },
];

const STEPS_KEYS = [
  { num: '01', titleKey: 'home.step1.title', descKey: 'home.step1.desc' },
  { num: '02', titleKey: 'home.step2.title', descKey: 'home.step2.desc' },
  { num: '03', titleKey: 'home.step3.title', descKey: 'home.step3.desc' },
];

const FEATURES_KEYS = [
  { icon: Shield, titleKey: 'home.feat1.title', descKey: 'home.feat1.desc' },
  { icon: Clock, titleKey: 'home.feat2.title', descKey: 'home.feat2.desc' },
  { icon: Star, titleKey: 'home.feat3.title', descKey: 'home.feat3.desc' },
  { icon: CheckCircle, titleKey: 'home.feat4.title', descKey: 'home.feat4.desc' },
];

const CAT_EMOJI = {
  cement: '🧱', sand: '🪨', aggregate: '⬛', steel: '🔩',
  brick: '🏗️', equipment: '🚜', labour: '👷', other: '📦',
};

export default function Home() {
  const { customer } = useCustomer();
  const { supplier } = useSupplier();
  const t = useT();
  const [rates, setRates] = useState([]);
  const [ratesLoading, setRatesLoading] = useState(true);
  const [showAllRates, setShowAllRates] = useState(false);

  const stats = STATS_KEYS.map(s => ({ ...s, label: t(s.labelKey) }));
  const steps = STEPS_KEYS.map(s => ({ ...s, title: t(s.titleKey), desc: t(s.descKey) }));
  const features = FEATURES_KEYS.map(f => ({ ...f, title: t(f.titleKey), desc: t(f.descKey) }));

  useEffect(() => {
    axios.get('/api/rates').then(r => setRates(r.data.rates || [])).catch(() => {}).finally(() => setRatesLoading(false));
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      {/* ─── HERO ─── */}
      <section className="relative bg-gray-950 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-30"
          style={{ backgroundImage: 'radial-gradient(circle at 15% 60%, #f97316 0%, transparent 45%), radial-gradient(circle at 85% 15%, #f97316 0%, transparent 35%)' }} />
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 md:py-28 lg:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left — copy */}
            <div>
              <div className="inline-flex items-center gap-2 bg-orange-500/15 border border-orange-500/25 rounded-full px-4 py-1.5 text-orange-300 text-sm font-medium mb-6">
                <span className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" />
                {t('home.badge')}
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.1] mb-5">
                {t('home.heroTitle')}<br />
                <span className="bg-gradient-to-r from-orange-400 to-orange-500 bg-clip-text text-transparent">
                  {t('home.heroOrange')}
                </span>
              </h1>
              <p className="text-gray-300 text-lg md:text-xl leading-relaxed mb-8 max-w-lg">
                {t('home.heroSub')}
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mb-8">
                <Link to="/request"
                  className="inline-flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-7 py-3.5 rounded-xl transition-colors text-base shadow-xl shadow-orange-500/20">
                  {t('home.cta1')} <ArrowRight className="w-5 h-5" />
                </Link>
                <Link to={supplier ? '/supplier/dashboard' : '/supplier/register'}
                  className="inline-flex items-center justify-center gap-2 bg-emerald-500/15 border border-emerald-500/30 hover:bg-emerald-500/25 text-emerald-300 font-semibold px-7 py-3.5 rounded-xl transition-colors text-base">
                  <Package className="w-5 h-5" />
                  {supplier ? t('home.cta2SupplierDash') : t('home.cta2Supplier')}
                </Link>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-green-400" /> {t('home.trust1')}</span>
                <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-green-400" /> {t('home.trust2')}</span>
                <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-green-400" /> {t('home.trust3')}</span>
              </div>
            </div>

            {/* Right — platform highlights */}
            <div className="hidden lg:block">
              <div className="relative w-80 ml-auto space-y-3">
                <div className="absolute -inset-6 bg-orange-500/10 blur-3xl rounded-full" />
                {[
                  { emoji: '🧱', title: 'Material Quote', desc: 'Cement, balu, gitti, sariya — free quote lo', color: 'border-orange-500/20' },
                  { emoji: '🚜', title: 'Equipment Hire', desc: 'JCB, truck, crane — daily/hourly booking', color: 'border-yellow-500/20' },
                  { emoji: '👷', title: 'Karigar Booking', desc: 'Mason, plumber, electrician — on demand', color: 'border-blue-500/20' },
                  { emoji: '📊', title: 'Project Tracker', desc: 'Sab orders ek jagah — status live', color: 'border-indigo-500/20' },
                ].map(item => (
                  <div key={item.title}
                    className={`relative bg-white/5 backdrop-blur-sm border ${item.color} rounded-2xl px-5 py-4 flex items-center gap-4`}>
                    <span className="text-3xl shrink-0">{item.emoji}</span>
                    <div>
                      <p className="text-white text-sm font-semibold">{item.title}</p>
                      <p className="text-gray-400 text-xs mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── STATS ─── */}
      <section className="bg-orange-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-center text-white">
            {stats.map(s => (
              <div key={s.label} className="py-3">
                <div className="text-2xl font-extrabold tracking-tight">{s.value}</div>
                <div className="text-orange-100 text-xs font-medium mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── DUAL PORTAL ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-20">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">
            {t('home.portal.title')}
          </h2>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            {t('home.portal.sub')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Customer Portal */}
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-3xl p-8 text-white flex flex-col">
            <div className="w-13 h-13 bg-white/15 rounded-2xl flex items-center justify-center mb-5 w-14 h-14">
              <HardHat className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <div className="inline-block bg-blue-500/40 text-blue-100 text-xs font-bold px-3 py-1 rounded-full mb-3">{t('home.cust.tag')}</div>
              <h3 className="text-2xl md:text-3xl font-extrabold mb-2">{t('home.cust.title')}</h3>
              <p className="text-blue-100 mb-6 leading-relaxed">{t('home.cust.sub')}</p>
              <ul className="space-y-2.5 mb-8">
                {[
                  t('home.cust.feat1'),
                  t('home.cust.feat2'),
                  t('home.cust.feat3'),
                  t('home.cust.feat4'),
                  t('home.cust.feat5'),
                ].map(item => (
                  <li key={item} className="flex items-center gap-2.5 text-sm text-blue-100">
                    <CheckCircle className="w-4 h-4 text-blue-300 shrink-0" /> {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-2.5">
              <Link to={customer ? '/customer/dashboard' : '/customer/register'}
                className="block bg-white text-blue-700 font-extrabold py-3.5 rounded-xl text-center text-sm hover:bg-blue-50 transition-colors">
                {customer ? t('home.cust.dashCta', { name: customer.name.split(' ')[0] }) : t('home.cust.regCta')}
              </Link>
              {!customer && (
                <Link to="/customer/login"
                  className="block bg-white/10 border border-white/20 text-white font-medium py-3 rounded-xl text-center text-sm hover:bg-white/20 transition-colors">
                  {t('home.cust.loginCta')}
                </Link>
              )}
            </div>
          </div>

          {/* Supplier Portal */}
          <div className="bg-gradient-to-br from-emerald-700 to-emerald-800 rounded-3xl p-8 text-white flex flex-col">
            <div className="w-14 h-14 bg-white/15 rounded-2xl flex items-center justify-center mb-5">
              <Package className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <div className="inline-block bg-emerald-500/40 text-emerald-100 text-xs font-bold px-3 py-1 rounded-full mb-3">{t('home.supp.tag')}</div>
              <h3 className="text-2xl md:text-3xl font-extrabold mb-2">{t('home.supp.title')}</h3>
              <p className="text-emerald-100 mb-6 leading-relaxed">{t('home.supp.sub')}</p>
              <ul className="space-y-2.5 mb-8">
                {[
                  t('home.supp.feat1'),
                  t('home.supp.feat2'),
                  t('home.supp.feat3'),
                  t('home.supp.feat4'),
                  t('home.supp.feat5'),
                ].map(item => (
                  <li key={item} className="flex items-center gap-2.5 text-sm text-emerald-100">
                    <CheckCircle className="w-4 h-4 text-emerald-300 shrink-0" /> {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-2.5">
              <Link to={supplier ? '/supplier/dashboard' : '/supplier/register'}
                className="block bg-white text-emerald-700 font-extrabold py-3.5 rounded-xl text-center text-sm hover:bg-emerald-50 transition-colors">
                {supplier ? t('home.supp.dashCta', { name: supplier.name.split(' ')[0] }) : t('home.supp.regCta')}
              </Link>
              {!supplier && (
                <Link to="/supplier/login"
                  className="block bg-white/10 border border-white/20 text-white font-medium py-3 rounded-xl text-center text-sm hover:bg-white/20 transition-colors">
                  {t('home.supp.loginCta')}
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ─── CATEGORIES ─── */}
      <section id="categories" className="bg-gray-50 py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">{t('home.catTitle')}</h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">{t('home.catSub')}</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {categories.map(cat => (
              <Link key={cat.name} to={`/request?category=${cat.tag}`}
                className="group bg-white border border-gray-100 hover:border-orange-200 hover:shadow-xl hover:shadow-orange-500/5 rounded-2xl p-5 transition-all duration-200">
                <div className="text-4xl mb-3">{cat.icon}</div>
                <h3 className="font-bold text-gray-900 mb-1 group-hover:text-orange-600 transition-colors">{cat.name}</h3>
                <p className="text-sm text-gray-500">{cat.desc}</p>
                <div className="mt-3 flex items-center gap-1 text-orange-500 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                  {t('home.catQuote')} <ChevronRight className="w-4 h-4" />
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link to="/request"
              className="inline-flex items-center gap-2 text-orange-500 hover:text-orange-600 font-semibold text-sm">
              {t('home.catMore')} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">{t('home.howTitle')}</h2>
          <p className="text-gray-500 text-lg">{t('home.howSub')}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          <div className="hidden md:block absolute top-10 left-[calc(16.67%+2rem)] right-[calc(16.67%+2rem)] h-0.5 bg-gradient-to-r from-orange-200 via-orange-300 to-orange-200" />
          {steps.map(s => (
            <div key={s.num} className="bg-white border border-gray-100 rounded-2xl p-7 shadow-sm hover:shadow-md transition-shadow relative z-10">
              <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center mb-5">
                <span className="text-white font-extrabold text-sm">{s.num}</span>
              </div>
              <h3 className="font-extrabold text-gray-900 text-lg mb-2">{s.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── WHY NIRMAN SETU ─── */}
      <section className="bg-gray-950 py-16 md:py-20 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-3">{t('home.whyTitle')}</h2>
            <p className="text-gray-400 text-lg">{t('home.whySub')}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map(f => (
              <div key={f.title} className="bg-white/5 border border-white/8 rounded-2xl p-6 hover:bg-white/8 transition-colors">
                <div className="w-11 h-11 bg-orange-500 rounded-xl flex items-center justify-center mb-4">
                  <f.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-bold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── NEW SERVICES ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-20">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 text-xs font-bold px-3 py-1.5 rounded-full mb-3">{t('home.services.badge')}</div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">
            {t('home.services.title')}
          </h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">{t('home.services.sub')}</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { icon: MessageSquare, color: 'bg-blue-500', ring: 'border-blue-100 hover:border-blue-200', accent: 'text-blue-600', title: t('home.s1.title'), desc: t('home.s1.desc'), to: '/customer/quotes', cta: t('home.s1.cta') },
            { icon: Hammer, color: 'bg-amber-500', ring: 'border-amber-100 hover:border-amber-200', accent: 'text-amber-600', title: t('home.s2.title'), desc: t('home.s2.desc'), to: '/customer/labour', cta: t('home.s2.cta') },
            { icon: Calculator, color: 'bg-green-500', ring: 'border-green-100 hover:border-green-200', accent: 'text-green-600', title: t('home.s3.title'), desc: t('home.s3.desc'), to: '/customer/estimator', cta: t('home.s3.cta') },
            { icon: FolderOpen, color: 'bg-indigo-500', ring: 'border-indigo-100 hover:border-indigo-200', accent: 'text-indigo-600', title: t('home.s4.title'), desc: t('home.s4.desc'), to: '/customer/projects', cta: t('home.s4.cta') },
          ].map(s => (
            <Link key={s.title} to={customer ? s.to : '/customer/register'}
              className={`group bg-white border ${s.ring} rounded-2xl p-6 flex flex-col hover:shadow-lg transition-all duration-200`}>
              <div className={`w-11 h-11 ${s.color} rounded-xl flex items-center justify-center mb-4`}>
                <s.icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">{s.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed flex-1">{s.desc}</p>
              <div className={`mt-4 flex items-center gap-1 text-sm font-semibold ${s.accent} opacity-70 group-hover:opacity-100 transition-opacity`}>
                {s.cta} <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ─── SUPPLIER JOIN SECTION ─── */}
      <section className="relative bg-gray-950 py-16 md:py-20 text-white overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle at 85% 40%, rgba(5,150,105,0.08) 0%, transparent 50%)' }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-emerald-500/15 border border-emerald-500/25 rounded-full px-4 py-1.5 text-emerald-300 text-sm font-medium mb-6">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                {t('home.join.badge')}
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold leading-tight mb-4">
                {t('home.join.title')}<br />
                <span className="text-emerald-400">{t('home.join.orange')}</span>
              </h2>
              <p className="text-gray-300 text-lg mb-8 leading-relaxed">
                {t('home.join.sub')}
              </p>
              <div className="grid grid-cols-2 gap-4 mb-8">
                {[
                  { label: t('home.join.earn1'), sub: t('home.join.earn1sub') },
                  { label: t('home.join.earn2'), sub: t('home.join.earn2sub') },
                  { label: t('home.join.earn3'), sub: t('home.join.earn3sub') },
                  { label: t('home.join.earn4'), sub: t('home.join.earn4sub') },
                ].map(s => (
                  <div key={s.label} className="bg-white/5 border border-white/8 rounded-xl p-4">
                    <p className="text-2xl font-extrabold text-emerald-400">{s.label}</p>
                    <p className="text-gray-400 text-sm mt-0.5">{s.sub}</p>
                  </div>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link to={supplier ? '/supplier/dashboard' : '/supplier/register'}
                  className="inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-7 py-3.5 rounded-xl transition-colors shadow-xl shadow-emerald-500/15">
                  <Package className="w-5 h-5" />
                  {supplier ? t('home.join.dashCta') : t('home.join.regCta')}
                </Link>
                {!supplier && (
                  <Link to="/supplier/login"
                    className="inline-flex items-center justify-center gap-2 bg-white/8 border border-white/15 hover:bg-white/15 text-white font-medium px-7 py-3.5 rounded-xl transition-colors">
                    {t('home.join.loginCta')}
                  </Link>
                )}
              </div>
            </div>

            {/* Right side — benefits visual */}
            <div className="space-y-4">
              {[
                { icon: BadgeCheck, color: 'text-emerald-400', bg: 'bg-emerald-500/10', title: t('home.join.b1.title'), desc: t('home.join.b1.desc') },
                { icon: IndianRupee, color: 'text-yellow-400', bg: 'bg-yellow-500/10', title: t('home.join.b2.title'), desc: t('home.join.b2.desc') },
                { icon: TrendingUp, color: 'text-blue-400', bg: 'bg-blue-500/10', title: t('home.join.b3.title'), desc: t('home.join.b3.desc') },
                { icon: Users, color: 'text-purple-400', bg: 'bg-purple-500/10', title: t('home.join.b4.title'), desc: t('home.join.b4.desc') },
              ].map(b => (
                <div key={b.title} className="flex items-start gap-4 bg-white/4 border border-white/8 rounded-2xl p-5 hover:bg-white/7 transition-colors">
                  <div className={`w-10 h-10 ${b.bg} rounded-xl flex items-center justify-center shrink-0`}>
                    <b.icon className={`w-5 h-5 ${b.color}`} />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{b.title}</p>
                    <p className="text-gray-400 text-sm mt-0.5">{b.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── LIVE RATES ─── */}
      {(ratesLoading || rates.length > 0) && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
          <div className="flex items-start justify-between mb-8">
            <div>
              <div className="inline-flex items-center gap-1.5 bg-green-100 text-green-700 text-xs font-bold px-3 py-1.5 rounded-full mb-3">
                <Zap className="w-3 h-3" /> {t('home.rates.badge')}
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">{t('home.rates.title')}</h2>
              <p className="text-gray-500 mt-1 text-sm">{t('home.rates.sub')}</p>
            </div>
            <TrendingUp className="w-10 h-10 text-green-400 hidden md:block mt-2" />
          </div>

          {ratesLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => <div key={i} className="h-28 bg-gray-100 rounded-2xl animate-pulse" />)}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {(showAllRates ? rates : rates.slice(0, 8)).map(rate => (
                  <div key={rate.rateId}
                    className="bg-white border border-gray-100 hover:border-green-200 hover:shadow-lg transition-all rounded-2xl p-4 group">
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-2xl">{CAT_EMOJI[rate.category] || '📦'}</span>
                      <span className="text-[10px] font-semibold text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded-full capitalize">{rate.city}</span>
                    </div>
                    <p className="font-bold text-gray-900 text-sm leading-tight">{rate.material}</p>
                    {rate.grade && <p className="text-xs text-gray-400 mt-0.5">{rate.grade}</p>}
                    <p className="text-green-600 font-extrabold text-base mt-2">
                      ₹{rate.minRate.toLocaleString('en-IN')} – ₹{rate.maxRate.toLocaleString('en-IN')}
                    </p>
                    <p className="text-xs text-gray-400">per {rate.unit}</p>
                  </div>
                ))}
              </div>
              {rates.length > 8 && (
                <div className="text-center mt-6">
                  <button onClick={() => setShowAllRates(s => !s)}
                    className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-semibold text-sm">
                    {showAllRates ? t('home.rates.less') : t('home.rates.more', { n: rates.length - 8 })}
                  </button>
                </div>
              )}
              <p className="text-xs text-gray-400 text-center mt-4">{t('home.rates.note')}</p>
            </>
          )}
        </section>
      )}

      {/* ─── FINAL CTA ─── */}
      <section className="relative bg-orange-500 py-16 md:py-20 text-white overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle at 10% 90%, rgba(0,0,0,0.12) 0%, transparent 50%), radial-gradient(circle at 90% 10%, rgba(255,255,255,0.08) 0%, transparent 40%)' }} />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-3">{t('home.cta.title')}</h2>
          <p className="text-orange-100 text-lg mb-8 max-w-xl mx-auto">{t('home.cta.sub')}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/request"
              className="inline-flex items-center justify-center gap-2 bg-white text-orange-600 font-extrabold px-8 py-3.5 rounded-xl hover:bg-orange-50 transition-colors shadow-lg text-sm">
              {t('home.cta.btn1')} <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/supplier/register"
              className="inline-flex items-center justify-center gap-2 bg-white/15 border border-white/30 text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-white/25 transition-colors text-sm">
              <Package className="w-4 h-4" /> {t('home.cta.btn2')}
            </Link>
          </div>
        </div>
      </section>

      <Footer />
      <WhatsAppButton message="Hello! I need help with construction material/equipment order." />
    </div>
  );
}
