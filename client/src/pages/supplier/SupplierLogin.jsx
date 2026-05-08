import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useSupplier } from '../../context/SupplierContext';
import { HardHat, Eye, EyeOff, Loader2 } from 'lucide-react';
import useT from '../../i18n/useT';

export default function SupplierLogin() {
  const { loginSupplier } = useSupplier();
  const navigate = useNavigate();
  const t = useT();
  const [form, setForm] = useState({ phone: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await axios.post('/api/supplier/login', form);
      loginSupplier(data.token, data.supplier);
      toast.success(`Welcome, ${data.supplier.name}!`);
      navigate('/supplier/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-emerald-500 rounded-2xl mb-4">
            <HardHat className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">{t('auth.supp.login.title')}</h1>
          <p className="text-gray-400 text-sm mt-1">{t('auth.supp.login.sub')}</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-gray-800 rounded-2xl p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">{t('auth.phone')}</label>
            <div className="flex">
              <span className="inline-flex items-center px-3 bg-gray-700 border border-r-0 border-gray-600 rounded-l-xl text-gray-400 text-sm">+91</span>
              <input
                type="tel"
                maxLength={10}
                required
                value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value.replace(/\D/g, '') }))}
                placeholder="9876543210"
                className="flex-1 bg-gray-700 border border-gray-600 text-white rounded-r-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder-gray-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">{t('auth.password')}</label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                required
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                placeholder="••••••••"
                className="w-full bg-gray-700 border border-gray-600 text-white rounded-xl px-4 py-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder-gray-500"
              />
              <button type="button" onClick={() => setShowPass(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-600 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 mt-2"
          >
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> {t('auth.loggingIn')}</> : t('auth.loginBtn')}
          </button>
        </form>

        <p className="text-center text-gray-600 text-sm mt-4">{t('auth.suppNoAccount')}</p>
      </div>
    </div>
  );
}
