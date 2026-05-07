import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import WhatsAppButton from '../components/WhatsAppButton';
import { useCustomer } from '../context/CustomerContext';
import { useSupplier } from '../context/SupplierContext';
import {
  Package, Shield, Clock, Star, HardHat,
  ArrowRight, CheckCircle, ChevronRight,
  MessageSquare, Hammer, Calculator, FolderOpen,
  TrendingUp, Zap, IndianRupee, BadgeCheck, Users
} from 'lucide-react';

const categories = [
  { icon: '🧱', name: 'Cement', desc: 'OPC, PPC — all grades', tag: 'material' },
  { icon: '🪨', name: 'Balu / Sand', desc: 'River sand, M-sand', tag: 'material' },
  { icon: '⬛', name: 'Gitti / Aggregate', desc: '10mm, 20mm, 40mm', tag: 'material' },
  { icon: '🔩', name: 'Sariya / TMT', desc: 'Fe500, Fe550 grade steel', tag: 'material' },
  { icon: '🚜', name: 'JCB / Excavator', desc: 'Hourly / daily hire', tag: 'equipment' },
  { icon: '🚛', name: 'Truck / Dumper', desc: 'Material transport', tag: 'transport' },
];

const stats = [
  { value: '500+', label: 'Orders Delivered', icon: '📦' },
  { value: '50+', label: 'Verified Suppliers', icon: '✅' },
  { value: '98%', label: 'On-Time Delivery', icon: '⚡' },
  { value: '4.8★', label: 'Customer Rating', icon: '⭐' },
];

const steps = [
  { num: '01', title: 'Request Submit Karo', desc: 'Kya chahiye, kitna chahiye, kahan chahiye — simple form me batao.' },
  { num: '02', title: 'Best Quote Pao', desc: 'Verified suppliers se 2 ghante me best price quote milega.' },
  { num: '03', title: 'Confirm & Delivery', desc: 'Quote accept karo, advance do — hum delivery guarantee karte hain.' },
];

const features = [
  { icon: Shield, title: 'Verified Suppliers', desc: 'Har supplier KYC verified. Fake listing — zero tolerance.' },
  { icon: Clock, title: 'Fast Response', desc: '2 ghante me quote. Same-day delivery bhi available.' },
  { icon: Star, title: 'Best Price', desc: 'Direct supplier negotiation. Market se competitive rates.' },
  { icon: CheckCircle, title: 'Delivery Guarantee', desc: 'Advance de ke delivery nahi aayi — full refund.' },
];

const CAT_EMOJI = {
  cement: '🧱', sand: '🪨', aggregate: '⬛', steel: '🔩',
  brick: '🏗️', equipment: '🚜', labour: '👷', other: '📦',
};

export default function Home() {
  const { customer } = useCustomer();
  const { supplier } = useSupplier();
  const [rates, setRates] = useState([]);
  const [ratesLoading, setRatesLoading] = useState(true);
  const [showAllRates, setShowAllRates] = useState(false);

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
                Jharkhand ka #1 Construction Platform
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.1] mb-5">
                Construction ka<br />
                <span className="bg-gradient-to-r from-orange-400 to-orange-500 bg-clip-text text-transparent">
                  Bharosa — Ek Jagah
                </span>
              </h1>
              <p className="text-gray-300 text-lg md:text-xl leading-relaxed mb-8 max-w-lg">
                Cement, balu, gitti, sariya, JCB — verified suppliers se best price pe.
                Customer ya Supplier — dono ke liye ek poora platform.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mb-8">
                <Link to="/request"
                  className="inline-flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-7 py-3.5 rounded-xl transition-colors text-base shadow-xl shadow-orange-500/20">
                  Free Quote Lo <ArrowRight className="w-5 h-5" />
                </Link>
                <Link to={supplier ? '/supplier/dashboard' : '/supplier/register'}
                  className="inline-flex items-center justify-center gap-2 bg-emerald-500/15 border border-emerald-500/30 hover:bg-emerald-500/25 text-emerald-300 font-semibold px-7 py-3.5 rounded-xl transition-colors text-base">
                  <Package className="w-5 h-5" />
                  {supplier ? 'Supplier Dashboard' : 'Supplier Bano — Free'}
                </Link>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-green-400" /> Free quote</span>
                <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-green-400" /> Verified suppliers</span>
                <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-green-400" /> No hidden charges</span>
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
            Customer hain ya Supplier?
          </h2>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            Nirman Setu dono ke liye bana hai — material chahiye walo ke liye bhi, aur supply karne walo ke liye bhi.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Customer Portal */}
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-3xl p-8 text-white flex flex-col">
            <div className="w-13 h-13 bg-white/15 rounded-2xl flex items-center justify-center mb-5 w-14 h-14">
              <HardHat className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <div className="inline-block bg-blue-500/40 text-blue-100 text-xs font-bold px-3 py-1 rounded-full mb-3">For Customers</div>
              <h3 className="text-2xl md:text-3xl font-extrabold mb-2">Material Chahiye?</h3>
              <p className="text-blue-100 mb-6 leading-relaxed">
                Apni construction site ke liye sab kuch yahan milega — quote, karigar, tracking, sab ek jagah.
              </p>
              <ul className="space-y-2.5 mb-8">
                {[
                  'Free quote in 2 hours',
                  'Multiple suppliers compare karo',
                  'Karigar / labour book karo',
                  'Order live track karo',
                  'Project budget manage karo',
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
                {customer ? `Welcome back, ${customer.name.split(' ')[0]}! →` : 'Customer Register Karo — Free →'}
              </Link>
              {!customer && (
                <Link to="/customer/login"
                  className="block bg-white/10 border border-white/20 text-white font-medium py-3 rounded-xl text-center text-sm hover:bg-white/20 transition-colors">
                  Already Customer? Login
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
              <div className="inline-block bg-emerald-500/40 text-emerald-100 text-xs font-bold px-3 py-1 rounded-full mb-3">For Suppliers</div>
              <h3 className="text-2xl md:text-3xl font-extrabold mb-2">Supply Karte Ho?</h3>
              <p className="text-emerald-100 mb-6 leading-relaxed">
                Cement, balu, sariya, JCB — jo bhi supply karte ho, register karo aur daily new order leads pao.
              </p>
              <ul className="space-y-2.5 mb-8">
                {[
                  'Daily new order leads milenge',
                  '100% payment guarantee',
                  'Verified Supplier badge milega',
                  'Earnings dashboard & analytics',
                  'Bilkul free registration',
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
                {supplier ? `Dashboard — ${supplier.name.split(' ')[0]} →` : 'Supplier Bano — Bilkul Free →'}
              </Link>
              {!supplier && (
                <Link to="/supplier/login"
                  className="block bg-white/10 border border-white/20 text-white font-medium py-3 rounded-xl text-center text-sm hover:bg-white/20 transition-colors">
                  Already Supplier? Login
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
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">Kya Chahiye Tumhe?</h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">Construction ke liye zaroori har cheez — ek jagah</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {categories.map(cat => (
              <Link key={cat.name} to={`/request?category=${cat.tag}`}
                className="group bg-white border border-gray-100 hover:border-orange-200 hover:shadow-xl hover:shadow-orange-500/5 rounded-2xl p-5 transition-all duration-200">
                <div className="text-4xl mb-3">{cat.icon}</div>
                <h3 className="font-bold text-gray-900 mb-1 group-hover:text-orange-600 transition-colors">{cat.name}</h3>
                <p className="text-sm text-gray-500">{cat.desc}</p>
                <div className="mt-3 flex items-center gap-1 text-orange-500 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                  Quote lo <ChevronRight className="w-4 h-4" />
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link to="/request"
              className="inline-flex items-center gap-2 text-orange-500 hover:text-orange-600 font-semibold text-sm">
              Aur categories dekho <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">Kaise Kaam Karta Hai?</h2>
          <p className="text-gray-500 text-lg">Teen steps — aur material tumhare site pe</p>
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
            <h2 className="text-3xl md:text-4xl font-extrabold mb-3">Kyun Nirman Setu?</h2>
            <p className="text-gray-400 text-lg">Sirf connect nahi — hum guarantee karte hain</p>
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
          <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 text-xs font-bold px-3 py-1.5 rounded-full mb-3">✨ Naye Features</div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">
            Sirf Material Nahi — Poora Construction Manage Karo
          </h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">Quote compare karo, karigar book karo, budget track karo — sab ek jagah</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { icon: MessageSquare, color: 'bg-blue-500', ring: 'border-blue-100 hover:border-blue-200', accent: 'text-blue-600', title: 'Quote Compare', desc: 'Multiple suppliers ko ek sath RFQ bhejo — best price compare karo.', to: '/customer/quotes', cta: 'Quote Request Karo' },
            { icon: Hammer, color: 'bg-amber-500', ring: 'border-amber-100 hover:border-amber-200', accent: 'text-amber-600', title: 'Karigar Booking', desc: 'Mason, plumber, electrician — verified karigars site pe book karo.', to: '/customer/labour', cta: 'Karigar Dhundo' },
            { icon: Calculator, color: 'bg-green-500', ring: 'border-green-100 hover:border-green-200', accent: 'text-green-600', title: 'Material Estimator', desc: 'Area batao — cement, balu, gitti, sariya ka estimate milega.', to: '/customer/estimator', cta: 'Estimate Nikalo' },
            { icon: FolderOpen, color: 'bg-indigo-500', ring: 'border-indigo-100 hover:border-indigo-200', accent: 'text-indigo-600', title: 'Project Tracker', desc: 'Ghar, dukan, factory — saare orders ek project mein track karo.', to: '/customer/projects', cta: 'Project Banao' },
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
                50+ Suppliers Pehle Se Kama Rahe Hain
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold leading-tight mb-4">
                Apna Business Online Lao,<br />
                <span className="text-emerald-400">Zyada Orders Pao</span>
              </h2>
              <p className="text-gray-300 text-lg mb-8 leading-relaxed">
                Cement, sand, sariya, JCB — jo bhi supply karte ho, listing karo aur daily new customers connect karo. Koi commission nahi — seedha deal.
              </p>
              <div className="grid grid-cols-2 gap-4 mb-8">
                {[
                  { label: '₹50K–₹2L', sub: 'Monthly Potential' },
                  { label: '100%', sub: 'Payment Guarantee' },
                  { label: 'Verified', sub: 'Supplier Badge' },
                  { label: 'Free', sub: 'Registration' },
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
                  {supplier ? 'Go to Dashboard' : 'Supplier Ban Jao — Free'}
                </Link>
                {!supplier && (
                  <Link to="/supplier/login"
                    className="inline-flex items-center justify-center gap-2 bg-white/8 border border-white/15 hover:bg-white/15 text-white font-medium px-7 py-3.5 rounded-xl transition-colors">
                    Existing Supplier Login
                  </Link>
                )}
              </div>
            </div>

            {/* Right side — benefits visual */}
            <div className="space-y-4">
              {[
                { icon: BadgeCheck, color: 'text-emerald-400', bg: 'bg-emerald-500/10', title: 'Verified Supplier Badge', desc: 'KYC ke baad badge milega — customers zyada trust karte hain.' },
                { icon: IndianRupee, color: 'text-yellow-400', bg: 'bg-yellow-500/10', title: 'Fast Payments', desc: 'Delivery confirm hone ke 24 ghante ke andar payment settle.' },
                { icon: TrendingUp, color: 'text-blue-400', bg: 'bg-blue-500/10', title: 'Analytics & Insights', desc: 'Dekho kitna kama rahe ho, konse material zyada bikta hai.' },
                { icon: Users, color: 'text-purple-400', bg: 'bg-purple-500/10', title: 'Growing Network', desc: 'Har hafte naye customers — Jharkhand bhar mein reach badho.' },
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
                <Zap className="w-3 h-3" /> Live Rates
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">Aaj ke Material Rates</h2>
              <p className="text-gray-500 mt-1 text-sm">Jharkhand market ke current prices — order se pehle check karo</p>
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
                    {showAllRates ? 'Kam dikhao ↑' : `Aur ${rates.length - 8} rates dekho →`}
                  </button>
                </div>
              )}
              <p className="text-xs text-gray-400 text-center mt-4">* Indicative rates. Actual price quote confirm hone ke baad.</p>
            </>
          )}
        </section>
      )}

      {/* ─── FINAL CTA ─── */}
      <section className="relative bg-orange-500 py-16 md:py-20 text-white overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle at 10% 90%, rgba(0,0,0,0.12) 0%, transparent 50%), radial-gradient(circle at 90% 10%, rgba(255,255,255,0.08) 0%, transparent 40%)' }} />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-3">Abhi Start Karo — Bilkul Free</h2>
          <p className="text-orange-100 text-lg mb-8 max-w-xl mx-auto">
            2 ghante me best quote milega. Zero commitment. Just connect karo.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/request"
              className="inline-flex items-center justify-center gap-2 bg-white text-orange-600 font-extrabold px-8 py-3.5 rounded-xl hover:bg-orange-50 transition-colors shadow-lg text-sm">
              Free Quote Lo <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/supplier/register"
              className="inline-flex items-center justify-center gap-2 bg-white/15 border border-white/30 text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-white/25 transition-colors text-sm">
              <Package className="w-4 h-4" /> Supplier Bano
            </Link>
          </div>
        </div>
      </section>

      <Footer />
      <WhatsAppButton message="Hello! I need help with construction material/equipment order." />
    </div>
  );
}
