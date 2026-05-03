import { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useSupplier } from '../../context/SupplierContext';
import SupplierLayout from '../../components/SupplierLayout';
import { Building2, Loader2, CheckCircle, Lock, Eye, EyeOff } from 'lucide-react';

export default function SupplierProfile() {
  const { supplier, getAuthHeaders, loginSupplier } = useSupplier();
  const [form, setForm] = useState({
    email: supplier?.email || '',
    businessName: supplier?.businessName || '',
  });
  const [pass, setPass] = useState({ current: '', newPass: '', confirm: '' });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [changingPass, setChangingPass] = useState(false);

  const inputCls = "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-white";

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await axios.patch('/api/supplier/profile', {
        email: form.email,
        businessName: form.businessName,
      }, { headers: getAuthHeaders() });
      const token = localStorage.getItem('supplierToken');
      loginSupplier(token, { ...supplier, ...data.supplier });
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (pass.newPass !== pass.confirm) { toast.error('New passwords do not match'); return; }
    if (pass.newPass.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setChangingPass(true);
    try {
      await axios.patch('/api/supplier/profile', {
        currentPassword: pass.current,
        newPassword: pass.newPass,
      }, { headers: getAuthHeaders() });
      setPass({ current: '', newPass: '', confirm: '' });
      toast.success('Password changed successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Password change failed');
    } finally {
      setChangingPass(false);
    }
  };

  return (
    <SupplierLayout>
      <div className="max-w-xl mx-auto space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
            <Building2 className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">{supplier?.name}</h1>
            <p className="text-gray-500 text-sm">{supplier?.phone}</p>
          </div>
        </div>

        {/* KYC badge */}
        <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium ${
          supplier?.kycStatus === 'verified' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
        }`}>
          <CheckCircle className="w-4 h-4" />
          KYC Status: <span className="capitalize font-bold">{supplier?.kycStatus}</span>
          {supplier?.verifiedBadge && <span className="ml-auto bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">✓ Verified</span>}
        </div>

        {/* Profile info */}
        <form onSubmit={handleProfileSave} className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
          <h2 className="font-semibold text-gray-800">Profile Info</h2>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Business Name</label>
            <input type="text" value={form.businessName}
              onChange={e => setForm(f => ({ ...f, businessName: e.target.value }))}
              placeholder="Your company / shop name" className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Email <span className="text-gray-400">(for notifications)</span></label>
            <input type="email" value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              placeholder="supplier@email.com" className={inputCls} />
          </div>

          {/* Read-only info */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">Categories</p>
              <p className="text-sm text-gray-800 capitalize">{supplier?.categories?.join(', ') || '—'}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">Service Areas</p>
              <p className="text-sm text-gray-800">{supplier?.serviceAreas?.join(', ') || '—'}</p>
            </div>
          </div>

          <button type="submit" disabled={saving}
            className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white font-semibold py-3 rounded-xl text-sm transition-colors flex items-center justify-center gap-2">
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : 'Save Changes'}
          </button>
        </form>

        {/* Password change */}
        <form onSubmit={handlePasswordChange} className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
          <h2 className="font-semibold text-gray-800 flex items-center gap-2">
            <Lock className="w-4 h-4 text-gray-500" /> Change Password
          </h2>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Current Password</label>
            <div className="relative">
              <input type={showCurrent ? 'text' : 'password'} required value={pass.current}
                onChange={e => setPass(p => ({ ...p, current: e.target.value }))}
                className={`${inputCls} pr-10`} />
              <button type="button" onClick={() => setShowCurrent(s => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">New Password</label>
            <div className="relative">
              <input type={showNew ? 'text' : 'password'} required value={pass.newPass}
                onChange={e => setPass(p => ({ ...p, newPass: e.target.value }))}
                placeholder="Min 6 characters" className={`${inputCls} pr-10`} />
              <button type="button" onClick={() => setShowNew(s => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Confirm New Password</label>
            <input type="password" required value={pass.confirm}
              onChange={e => setPass(p => ({ ...p, confirm: e.target.value }))}
              className={inputCls} />
          </div>
          <button type="submit" disabled={changingPass}
            className="w-full bg-gray-800 hover:bg-gray-900 disabled:bg-gray-300 text-white font-semibold py-3 rounded-xl text-sm transition-colors flex items-center justify-center gap-2">
            {changingPass ? <><Loader2 className="w-4 h-4 animate-spin" /> Changing...</> : 'Change Password'}
          </button>
        </form>
      </div>
    </SupplierLayout>
  );
}
