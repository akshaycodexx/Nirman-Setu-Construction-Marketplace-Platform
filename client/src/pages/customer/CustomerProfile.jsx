import { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useCustomer } from '../../context/CustomerContext';
import CustomerLayout from '../../components/CustomerLayout';
import { User, Loader2, CheckCircle } from 'lucide-react';

export default function CustomerProfile() {
  const { customer, loginCustomer, authHeader } = useCustomer();
  const [form, setForm] = useState({
    name: customer?.name || '',
    email: customer?.email || '',
    city: customer?.address?.city || '',
    area: customer?.address?.area || '',
    pincode: customer?.address?.pincode || '',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const set = (field) => (e) => {
    setForm(f => ({ ...f, [field]: e.target.value }));
    setSaved(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await axios.patch('/api/customer/profile', {
        name: form.name,
        email: form.email,
        address: { city: form.city, area: form.area, pincode: form.pincode },
      }, { headers: authHeader() });

      // Update context with new data
      const token = localStorage.getItem('customerToken');
      loginCustomer(token, { _id: data._id, name: data.name, phone: data.phone, email: data.email });
      setSaved(true);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const inputCls = "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-white";

  return (
    <CustomerLayout>
      <div className="max-w-xl mx-auto space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
            <User className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">My Profile</h1>
            <p className="text-gray-500 text-sm">{customer?.phone}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Full Name</label>
            <input type="text" required value={form.name} onChange={set('name')} className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Email</label>
            <input type="email" value={form.email} onChange={set('email')} placeholder="your@email.com" className={inputCls} />
          </div>

          <hr className="border-gray-100" />
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Default Delivery Address</p>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">City</label>
              <input type="text" value={form.city} onChange={set('city')} placeholder="Patna" className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Pincode</label>
              <input type="text" value={form.pincode} onChange={set('pincode')} placeholder="800001" className={inputCls} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Area / Locality</label>
            <input type="text" value={form.area} onChange={set('area')} placeholder="Gandhi Maidan, Near XYZ" className={inputCls} />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white font-semibold py-3 rounded-xl text-sm transition-colors flex items-center justify-center gap-2 mt-2"
          >
            {saving ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
            ) : saved ? (
              <><CheckCircle className="w-4 h-4" /> Saved!</>
            ) : (
              'Save Changes'
            )}
          </button>
        </form>

        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Account Info</p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Phone</span>
              <span className="font-medium text-gray-900">{customer?.phone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Member since</span>
              <span className="font-medium text-gray-900">
                {customer?.createdAt
                  ? new Date(customer.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
                  : '—'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
}
