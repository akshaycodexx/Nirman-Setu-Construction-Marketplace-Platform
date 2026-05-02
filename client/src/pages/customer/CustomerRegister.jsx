import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useCustomer } from '../../context/CustomerContext';
import { HardHat, Eye, EyeOff, Loader2 } from 'lucide-react';

export default function CustomerRegister() {
  const { loginCustomer } = useCustomer();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', phone: '', email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      const { data } = await axios.post('/api/customer/register', form);
      loginCustomer(data.token, data.customer);
      toast.success(`Account created! Welcome, ${data.customer.name}!`);
      navigate('/customer/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full bg-gray-700 border border-gray-600 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500";

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-500 rounded-2xl mb-4">
            <HardHat className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Create Account</h1>
          <p className="text-gray-400 text-sm mt-1">Nirman Setu — Get Started</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-gray-800 rounded-2xl p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Full Name</label>
            <input type="text" required value={form.name} onChange={set('name')} placeholder="Ramesh Kumar" className={inputCls} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Phone Number</label>
            <input type="tel" required value={form.phone} onChange={set('phone')} placeholder="9876543210" className={inputCls} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Email <span className="text-gray-500 text-xs">(optional)</span></label>
            <input type="email" value={form.email} onChange={set('email')} placeholder="ramesh@example.com" className={inputCls} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                required
                value={form.password}
                onChange={set('password')}
                placeholder="Min 6 characters"
                className={`${inputCls} pr-10`}
              />
              <button type="button" onClick={() => setShowPass(s => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200">
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 mt-2">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating account...</> : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-gray-500 text-sm mt-4">
          Already have an account?{' '}
          <Link to="/customer/login" className="text-blue-400 hover:text-blue-300 font-medium">Login</Link>
        </p>
      </div>
    </div>
  );
}
