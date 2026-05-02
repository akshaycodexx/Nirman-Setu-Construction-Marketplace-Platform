import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useCustomer } from '../../context/CustomerContext';
import { HardHat, Eye, EyeOff, Loader2 } from 'lucide-react';

export default function CustomerLogin() {
  const { loginCustomer } = useCustomer();
  const navigate = useNavigate();
  const [form, setForm] = useState({ phone: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await axios.post('/api/customer/login', form);
      loginCustomer(data.token, data.customer);
      toast.success(`Welcome back, ${data.customer.name}!`);
      navigate('/customer/dashboard');
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
          <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-500 rounded-2xl mb-4">
            <HardHat className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Customer Login</h1>
          <p className="text-gray-400 text-sm mt-1">Nirman Setu — Your Orders</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-gray-800 rounded-2xl p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Phone Number</label>
            <input
              type="tel"
              required
              value={form.phone}
              onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
              placeholder="9876543210"
              className="w-full bg-gray-700 border border-gray-600 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                required
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                placeholder="••••••••"
                className="w-full bg-gray-700 border border-gray-600 text-white rounded-xl px-4 py-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500"
              />
              <button type="button" onClick={() => setShowPass(s => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200">
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 mt-2">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Logging in...</> : 'Login'}
          </button>
        </form>

        <p className="text-center text-gray-500 text-sm mt-4">
          New customer?{' '}
          <Link to="/customer/register" className="text-blue-400 hover:text-blue-300 font-medium">Create account</Link>
        </p>
      </div>
    </div>
  );
}
