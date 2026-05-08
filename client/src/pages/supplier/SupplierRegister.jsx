import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { HardHat, Loader2, CheckCircle, Eye, EyeOff } from 'lucide-react';
import useT from '../../i18n/useT';

const CATEGORIES = [
  { value: 'basic_materials', label: 'Basic Materials (Cement, Sand, Bricks)' },
  { value: 'structural', label: 'Structural (Steel, Iron)' },
  { value: 'wood_carpentry', label: 'Wood & Carpentry' },
  { value: 'chemicals', label: 'Chemicals & Adhesives' },
  { value: 'paint_finishing', label: 'Paint & Finishing' },
  { value: 'flooring_tiling', label: 'Flooring & Tiling' },
  { value: 'doors_windows', label: 'Doors & Windows' },
  { value: 'interior_furniture', label: 'Interior & Furniture' },
  { value: 'electrical', label: 'Electrical' },
  { value: 'plumbing_sanitary', label: 'Plumbing & Sanitary' },
  { value: 'machinery', label: 'Machinery & Equipment' },
  { value: 'transport', label: 'Transport & Logistics' },
  { value: 'labour', label: 'Labour' },
  { value: 'contractors', label: 'Contractors' },
  { value: 'design_planning', label: 'Design & Planning' },
  { value: 'shuttering', label: 'Shuttering' },
];

const inp = 'w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white';

export default function SupplierRegister() {
  const navigate = useNavigate();
  const t = useT();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({
    name: '', phone: '', email: '', password: '',
    businessName: '', categories: [], serviceAreas: '',
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const toggleCat = (cat) => set('categories',
    form.categories.includes(cat)
      ? form.categories.filter(c => c !== cat)
      : [...form.categories, cat]
  );

  const handleSubmit = async () => {
    if (!form.name || !form.phone || !form.password) { toast.error('Naam, phone aur password zaroori hain'); return; }
    if (form.password.length < 6) { toast.error('Password kam se kam 6 characters ka hona chahiye'); return; }
    if (form.categories.length === 0) { toast.error('Kam se kam ek category select karo'); return; }
    setSubmitting(true);
    try {
      await axios.post('/api/supplier/register', {
        ...form,
        serviceAreas: form.serviceAreas.split(',').map(s => s.trim()).filter(Boolean),
      });
      setDone(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    }
    setSubmitting(false);
  };

  if (done) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-emerald-500" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">{t('auth.suppReg.done.title')}</h2>
        <p className="text-gray-500 text-sm mb-6">{t('auth.suppReg.done.sub')}</p>
        <Link to="/supplier/login" className="block w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 rounded-xl text-sm transition-colors">
          {t('auth.suppReg.loginBtn')}
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="bg-emerald-500 p-2 rounded-xl">
              <HardHat className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-black text-gray-900">Nirman Setu</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{t('auth.supp.reg.title')}</h1>
          <p className="text-gray-500 text-sm mt-1">{t('suppReg.network')} — {t('suppReg.adminApproval')}</p>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-6">
          {[1, 2].map(s => (
            <div key={s} className={`flex-1 h-1.5 rounded-full transition-colors ${step >= s ? 'bg-emerald-500' : 'bg-gray-200'}`} />
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          {step === 1 ? (
            <div className="space-y-4">
              <h2 className="font-bold text-gray-800 mb-4">{t('suppReg.step1')}</h2>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">{t('suppReg.yourName')} *</label>
                <input className={inp} value={form.name} onChange={e => set('name', e.target.value)} placeholder="Ramesh Kumar" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">{t('auth.phone')} *</label>
                <input className={inp} type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="9876543210" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">{t('auth.email')} ({t('common.optional')})</label>
                <input className={inp} type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="ramesh@example.com" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">{t('suppReg.businessName')} ({t('common.optional')})</label>
                <input className={inp} value={form.businessName} onChange={e => set('businessName', e.target.value)} placeholder="Ramesh Cement Store" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">{t('auth.password')} *</label>
                <div className="relative">
                  <input className={inp} type={showPass ? 'text' : 'password'} value={form.password} onChange={e => set('password', e.target.value)} placeholder="Min 6 characters" />
                  <button type="button" onClick={() => setShowPass(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <button onClick={() => {
                if (!form.name || !form.phone || !form.password) { toast.error('Sabhi zaroori fields bharo'); return; }
                setStep(2);
              }} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 rounded-xl text-sm transition-colors">
                {t('suppReg.nextBtn')}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <h2 className="font-bold text-gray-800 mb-4">{t('suppReg.step2')}</h2>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-2">{t('suppReg.supplyWhat')} *</label>
                <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto pr-1">
                  {CATEGORIES.map(c => (
                    <label key={c.value} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border cursor-pointer transition-colors ${
                      form.categories.includes(c.value) ? 'bg-emerald-50 border-emerald-400' : 'border-gray-200 hover:border-emerald-200'
                    }`}>
                      <input type="checkbox" checked={form.categories.includes(c.value)} onChange={() => toggleCat(c.value)} className="accent-emerald-500" />
                      <span className="text-sm text-gray-700">{c.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">{t('suppReg.serviceAreas')}</label>
                <input className={inp} value={form.serviceAreas} onChange={e => set('serviceAreas', e.target.value)} placeholder="Ranchi, Dhanbad, Bokaro" />
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={() => setStep(1)} className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-xl text-sm font-medium hover:bg-gray-50">
                  {t('suppReg.backBtn')}
                </button>
                <button onClick={handleSubmit} disabled={submitting}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-200 text-white font-semibold py-3 rounded-xl text-sm transition-colors flex items-center justify-center gap-2">
                  {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> {t('auth.suppReg.submitting')}</> : t('auth.suppReg.btn')}
                </button>
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-sm text-gray-500 mt-4">
          {t('suppReg.haveAccount')}{' '}
          <Link to="/supplier/login" className="text-emerald-600 font-medium hover:underline">{t('suppReg.loginLink')}</Link>
        </p>
      </div>
    </div>
  );
}
