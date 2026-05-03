import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useCustomer } from '../context/CustomerContext';
import {
  Package, Truck, Settings, Shield, Clock, Star,
  ArrowRight, CheckCircle, Phone, ChevronRight, User, ClipboardList
} from 'lucide-react';

const categories = [
  { icon: '🧱', name: 'Cement', desc: 'OPC, PPC — all grades', tag: 'material' },
  { icon: '🪨', name: 'Balu / Sand', desc: 'River sand, M-sand', tag: 'material' },
  { icon: '⬛', name: 'Gitti / Aggregate', desc: '10mm, 20mm, 40mm', tag: 'material' },
  { icon: '🔩', name: 'Sariya / TMT', desc: 'Fe500, Fe550 grade steel', tag: 'material' },
  { icon: '🚜', name: 'JCB / Excavator', desc: 'Hourly / daily hire', tag: 'equipment' },
  { icon: '🚛', name: 'Truck / Dumper', desc: 'Material transport', tag: 'transport' },
];

const steps = [
  {
    num: '01',
    title: 'Requirement Submit Karo',
    desc: 'Simple form me batao — kya chahiye, kitna chahiye, kahan chahiye aur kab chahiye.',
  },
  {
    num: '02',
    title: 'Best Quote Milega',
    desc: 'Hum apne verified supplier network se best price negotiate karke tumhe quote bhejenge.',
  },
  {
    num: '03',
    title: 'Confirm & Delivery',
    desc: 'Quote accept karo, advance pay karo — hum delivery ensure karenge time pe.',
  },
];

const features = [
  { icon: Shield, title: 'Verified Suppliers', desc: 'Har supplier KYC verified. Fake listing zero tolerance.' },
  { icon: Clock, title: 'Fast Response', desc: '2 ghante ke andar quote. Same-day delivery available.' },
  { icon: Star, title: 'Best Price', desc: 'Direct supplier negotiation. Market se competitive rates guaranteed.' },
  { icon: CheckCircle, title: 'Delivery Guarantee', desc: 'Advance pay karo, delivery nahi aayi — full refund.' },
];

const stats = [
  { value: '500+', label: 'Orders Delivered' },
  { value: '50+', label: 'Verified Suppliers' },
  { value: '98%', label: 'On-Time Delivery' },
  { value: '4.8★', label: 'Customer Rating' },
];

export default function Home() {
  const { customer } = useCustomer();

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      {/* Hero */}
      <section className="relative bg-linear-to-br from-gray-900 via-gray-800 to-gray-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #f97316 0%, transparent 50%), radial-gradient(circle at 80% 20%, #f97316 0%, transparent 40%)' }}
        />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-20 md:py-28">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-orange-500/20 border border-orange-500/30 rounded-full px-4 py-1.5 text-orange-300 text-sm font-medium mb-6">
              <span className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" />
              Jharkhand ka #1 Construction Platform
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Construction Material{' '}
              <span className="text-orange-400">Ek Jagah,</span>{' '}
              Best Price Pe
            </h1>
            <p className="text-gray-300 text-lg md:text-xl leading-relaxed mb-8">
              Cement, balu, gitti, JCB, truck — sab kuch verified suppliers se.
              Hum beech me rehte hain taaki tumhe best deal mile aur delivery on time ho.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to="/request"
                className="inline-flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-7 py-3.5 rounded-xl transition-colors text-lg shadow-lg shadow-orange-500/25"
              >
                Free Quote Lo <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/track"
                className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 font-medium px-7 py-3.5 rounded-xl transition-colors"
              >
                Order Track Karo
              </Link>
            </div>
            <p className="mt-5 text-gray-500 text-sm flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-green-400" />
              Free quote • No hidden charges • 100% verified suppliers
            </p>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-orange-500">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-white">
            {stats.map(s => (
              <div key={s.label}>
                <div className="text-2xl font-bold">{s.value}</div>
                <div className="text-orange-100 text-sm">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section id="categories" className="max-w-6xl mx-auto px-4 sm:px-6 py-16 md:py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Kya Chahiye Tumhe?
          </h2>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            Construction ke liye zaroori har cheez — ek jagah milegi
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {categories.map(cat => (
            <Link
              key={cat.name}
              to={`/request?category=${cat.tag}`}
              className="group bg-white border border-gray-100 hover:border-orange-200 hover:shadow-lg hover:shadow-orange-500/5 rounded-2xl p-5 transition-all duration-200"
            >
              <div className="text-4xl mb-3">{cat.icon}</div>
              <h3 className="font-bold text-gray-900 mb-1 group-hover:text-orange-600 transition-colors">
                {cat.name}
              </h3>
              <p className="text-sm text-gray-500">{cat.desc}</p>
              <div className="mt-3 flex items-center gap-1 text-orange-500 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                Quote lo <ChevronRight className="w-4 h-4" />
              </div>
            </Link>
          ))}
        </div>
        <div className="text-center mt-8">
          <Link
            to="/request"
            className="inline-flex items-center gap-2 text-orange-500 hover:text-orange-600 font-semibold"
          >
            Aur categories dekhein <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="bg-gray-50 py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Kaise Kaam Karta Hai?
            </h2>
            <p className="text-gray-500 text-lg">Teen simple steps — aur material tumhare site pe</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {steps.map((s, i) => (
              <div key={s.num} className="relative">
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-orange-200 z-0" style={{ width: 'calc(100% - 4rem)' }} />
                )}
                <div className="relative bg-white rounded-2xl p-6 shadow-sm border border-gray-100 z-10">
                  <div className="text-5xl font-black text-orange-100 leading-none mb-3">{s.num}</div>
                  <h3 className="font-bold text-gray-900 text-lg mb-2">{s.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features / Why us */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 md:py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Kyun Nirman Setu?
          </h2>
          <p className="text-gray-500 text-lg">Sirf connect nahi — hum guarantee karte hain</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map(f => (
            <div key={f.title} className="bg-linear-to-b from-orange-50 to-white border border-orange-100 rounded-2xl p-6 text-center">
              <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                <f.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Customer Portal CTA */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-10">
        <div className="bg-linear-to-r from-blue-600 to-blue-500 rounded-3xl p-8 md:p-10 text-white flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <p className="text-blue-200 text-sm font-medium mb-1">Existing Customer?</p>
            <h3 className="text-2xl font-bold mb-1">
              {customer ? `Welcome back, ${customer.name.split(' ')[0]}!` : 'Apne Orders Track Karo'}
            </h3>
            <p className="text-blue-100 text-sm">
              {customer
                ? 'Dashboard mein apne saare orders dekho, payment karo, status track karo.'
                : 'Login karke apne saare orders ek jagah dekho — status, quotes, payments sab.'}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            {customer ? (
              <>
                <Link to="/customer/dashboard"
                  className="flex items-center gap-2 bg-white text-blue-700 font-bold px-6 py-3 rounded-xl hover:bg-blue-50 transition-colors text-sm whitespace-nowrap">
                  <ClipboardList className="w-4 h-4" /> My Dashboard
                </Link>
                <Link to="/request"
                  className="flex items-center gap-2 bg-blue-700/40 border border-white/30 text-white font-medium px-6 py-3 rounded-xl hover:bg-blue-700/60 transition-colors text-sm whitespace-nowrap">
                  + New Order
                </Link>
              </>
            ) : (
              <>
                <Link to="/customer/login"
                  className="flex items-center gap-2 bg-white text-blue-700 font-bold px-6 py-3 rounded-xl hover:bg-blue-50 transition-colors text-sm whitespace-nowrap">
                  <User className="w-4 h-4" /> Login
                </Link>
                <Link to="/customer/register"
                  className="flex items-center gap-2 bg-blue-700/40 border border-white/30 text-white font-medium px-6 py-3 rounded-xl hover:bg-blue-700/60 transition-colors text-sm whitespace-nowrap">
                  Create Account
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-linear-to-r from-orange-500 to-orange-600 py-14 mx-4 sm:mx-6 rounded-3xl mb-8 max-w-6xl md:mx-auto">
        <div className="px-6 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">
            Abhi Quote Lo — Bilkul Free
          </h2>
          <p className="text-orange-100 text-lg mb-8 max-w-xl mx-auto">
            2 ghante ke andar best price quote milega. Koi commitment nahi — sirf best deal.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/request"
              className="inline-flex items-center justify-center gap-2 bg-white text-orange-600 font-bold px-8 py-3.5 rounded-xl hover:bg-orange-50 transition-colors shadow-lg"
            >
              Order Request Karo <ArrowRight className="w-5 h-5" />
            </Link>
            <a
              href="tel:+910000000000"
              className="inline-flex items-center justify-center gap-2 bg-orange-700/40 border border-white/30 text-white font-medium px-8 py-3.5 rounded-xl hover:bg-orange-700/60 transition-colors"
            >
              <Phone className="w-5 h-5" /> Call Karo
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
