import { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import AdminLayout from '../../components/AdminLayout';
import { Users, Plus, CheckCircle, XCircle, Clock, Search, X, Loader2, ToggleLeft, ToggleRight, Eye } from 'lucide-react';

const KYC_COLORS = {
  verified: 'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
  rejected: 'bg-red-100 text-red-700',
};

function AddSupplierModal({ onClose, onAdded }) {
  const [form, setForm] = useState({
    name: '', phone: '', password: '', businessName: '',
    categories: [], serviceAreas: '', notes: '',
  });
  const [loading, setLoading] = useState(false);
  const CATS = ['material', 'transport', 'equipment'];

  const toggleCat = (cat) => {
    setForm(f => ({
      ...f,
      categories: f.categories.includes(cat)
        ? f.categories.filter(c => c !== cat)
        : [...f.categories, cat],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        serviceAreas: form.serviceAreas.split(',').map(s => s.trim()).filter(Boolean),
      };
      const { data } = await axios.post('/api/admin/suppliers', payload);
      toast.success(`Supplier added: ${data.supplier.name}`);
      onAdded(data.supplier);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add supplier');
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">Add New Supplier</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Name *</label>
              <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Ramesh Kumar"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Phone *</label>
              <input required maxLength={10} value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value.replace(/\D/g, '') }))}
                placeholder="9876543210"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Password *</label>
            <input required type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              placeholder="Min 6 characters"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Business Name</label>
            <input value={form.businessName} onChange={e => setForm(f => ({ ...f, businessName: e.target.value }))}
              placeholder="e.g. Ramesh Sand Supplier"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-2">Categories</label>
            <div className="flex gap-2">
              {CATS.map(cat => (
                <button type="button" key={cat} onClick={() => toggleCat(cat)}
                  className={`flex-1 py-2 rounded-xl text-xs font-medium capitalize border-2 transition-colors ${
                    form.categories.includes(cat) ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-gray-100 text-gray-500'
                  }`}>{cat}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Service Areas (comma separated)</label>
            <input value={form.serviceAreas} onChange={e => setForm(f => ({ ...f, serviceAreas: e.target.value }))}
              placeholder="Doranda, Kanke, Ranchi"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Notes (internal)</label>
            <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              placeholder="Reliable for bulk cement orders..."
              rows={2}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-200 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Adding...</> : <><Plus className="w-4 h-4" /> Add Supplier</>}
          </button>
        </form>
      </div>
    </div>
  );
}

function SupplierDetailModal({ supplierId, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newPass, setNewPass] = useState('');
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    axios.get(`/api/admin/suppliers/${supplierId}`)
      .then(r => setData(r.data))
      .catch(() => toast.error('Failed to load supplier'))
      .finally(() => setLoading(false));
  }, [supplierId]);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPass.length < 6) { toast.error('Min 6 characters'); return; }
    setResetting(true);
    try {
      await axios.put(`/api/admin/suppliers/${supplierId}/reset-password`, { newPassword: newPass });
      setNewPass('');
      toast.success('Password reset!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">Supplier Detail</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        </div>
        {loading ? (
          <div className="p-10 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" /></div>
        ) : data ? (
          <div className="p-5 space-y-5">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Profile</p>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Name</span><span className="font-medium">{data.supplier.name}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Phone</span><span className="font-medium">{data.supplier.phone}</span></div>
                {data.supplier.email && <div className="flex justify-between"><span className="text-gray-500">Email</span><span className="font-medium">{data.supplier.email}</span></div>}
                {data.supplier.businessName && <div className="flex justify-between"><span className="text-gray-500">Business</span><span className="font-medium">{data.supplier.businessName}</span></div>}
                <div className="flex justify-between"><span className="text-gray-500">KYC</span>
                  <span className={`font-semibold capitalize ${data.supplier.kycStatus === 'verified' ? 'text-green-600' : 'text-yellow-600'}`}>{data.supplier.kycStatus}</span>
                </div>
                <div className="flex justify-between"><span className="text-gray-500">Categories</span><span className="font-medium capitalize">{data.supplier.categories?.join(', ') || '—'}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Areas</span><span className="font-medium">{data.supplier.serviceAreas?.join(', ') || '—'}</span></div>
                {data.supplier.notes && <div className="flex justify-between"><span className="text-gray-500">Notes</span><span className="font-medium text-gray-700 italic">{data.supplier.notes}</span></div>}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Order Stats</p>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: 'Total', value: data.stats.total },
                  { label: 'Confirmed', value: data.stats.confirmed },
                  { label: 'Dispatched', value: data.stats.dispatched },
                  { label: 'Delivered', value: data.stats.delivered },
                ].map(s => (
                  <div key={s.label} className="bg-gray-50 rounded-xl p-3 text-center">
                    <p className="text-xl font-bold text-gray-900">{s.value}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {data.recentOrders?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Recent Orders</p>
                <div className="divide-y divide-gray-50 border border-gray-100 rounded-xl overflow-hidden">
                  {data.recentOrders.map(o => (
                    <div key={o._id} className="px-3 py-2.5 flex justify-between text-sm">
                      <span className="font-mono text-gray-700">{o.orderId}</span>
                      <span className="capitalize text-gray-500">{o.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={handleResetPassword} className="border-t border-gray-100 pt-5">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Reset Password</p>
              <div className="flex gap-2">
                <input
                  type="password"
                  value={newPass}
                  onChange={e => setNewPass(e.target.value)}
                  placeholder="New password (min 6)"
                  className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
                <button type="submit" disabled={resetting || newPass.length < 6}
                  className="bg-red-50 hover:bg-red-100 text-red-700 font-semibold px-4 py-2.5 rounded-xl text-sm disabled:opacity-40 transition-colors flex items-center gap-2">
                  {resetting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Reset'}
                </button>
              </div>
            </form>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default function AdminSuppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [detailId, setDetailId] = useState(null);

  const fetchSuppliers = async (q = '') => {
    setLoading(true);
    try {
      const { data } = await axios.get(`/api/admin/suppliers${q ? `?search=${q}` : ''}`);
      setSuppliers(data.suppliers);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchSuppliers(); }, []);

  const handleKyc = async (id, kycStatus) => {
    try {
      const { data } = await axios.put(`/api/admin/suppliers/${id}/kyc`, { kycStatus });
      setSuppliers(s => s.map(sup => sup._id === id ? data.supplier : sup));
      toast.success(`KYC ${kycStatus}`);
    } catch { toast.error('Failed'); }
  };

  const handleToggle = async (id) => {
    try {
      const { data } = await axios.put(`/api/admin/suppliers/${id}/toggle`);
      setSuppliers(s => s.map(sup => sup._id === id ? { ...sup, isActive: data.isActive } : sup));
    } catch { toast.error('Failed'); }
  };

  return (
    <AdminLayout>
      {showModal && (
        <AddSupplierModal
          onClose={() => setShowModal(false)}
          onAdded={sup => setSuppliers(s => [sup, ...s])}
        />
      )}
      {detailId && (
        <SupplierDetailModal
          supplierId={detailId}
          onClose={() => setDetailId(null)}
        />
      )}

      <div className="mb-5 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-orange-500" /> Suppliers
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">{suppliers.length} registered suppliers</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Supplier
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && fetchSuppliers(search)}
          placeholder="Search by name, phone, business name..."
          className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
        />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="divide-y">{[...Array(5)].map((_, i) => <div key={i} className="h-16 animate-pulse bg-gray-50" />)}</div>
        ) : suppliers.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p>Koi supplier nahi mila</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {suppliers.map(sup => (
              <div key={sup._id} className="px-5 py-4">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-semibold text-gray-900">{sup.name}</span>
                      {sup.verifiedBadge && <CheckCircle className="w-4 h-4 text-green-500" />}
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${KYC_COLORS[sup.kycStatus]}`}>
                        {sup.kycStatus}
                      </span>
                      {!sup.isActive && <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">Suspended</span>}
                    </div>
                    <p className="text-sm text-gray-500">
                      {sup.phone} {sup.businessName && `· ${sup.businessName}`}
                    </p>
                    {sup.categories?.length > 0 && (
                      <div className="flex gap-1 mt-1.5 flex-wrap">
                        {sup.categories.map(c => (
                          <span key={c} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full capitalize">{c}</span>
                        ))}
                        {sup.serviceAreas?.length > 0 && sup.serviceAreas.slice(0, 3).map(a => (
                          <span key={a} className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">{a}</span>
                        ))}
                      </div>
                    )}
                    {sup.notes && <p className="text-xs text-gray-400 mt-1 italic">{sup.notes}</p>}
                  </div>

                  <div className="flex flex-col gap-1.5 shrink-0">
                    <button onClick={() => setDetailId(sup._id)}
                      className="flex items-center gap-1 text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 px-2.5 py-1.5 rounded-lg font-medium transition-colors">
                      <Eye className="w-3.5 h-3.5" /> View
                    </button>
                    {sup.kycStatus === 'pending' && (
                      <div className="flex gap-1">
                        <button onClick={() => handleKyc(sup._id, 'verified')} className="flex items-center gap-1 text-xs bg-green-50 hover:bg-green-100 text-green-700 px-2.5 py-1.5 rounded-lg font-medium transition-colors">
                          <CheckCircle className="w-3.5 h-3.5" /> Verify
                        </button>
                        <button onClick={() => handleKyc(sup._id, 'rejected')} className="flex items-center gap-1 text-xs bg-red-50 hover:bg-red-100 text-red-700 px-2.5 py-1.5 rounded-lg font-medium transition-colors">
                          <XCircle className="w-3.5 h-3.5" /> Reject
                        </button>
                      </div>
                    )}
                    {sup.kycStatus === 'verified' && (
                      <button onClick={() => handleKyc(sup._id, 'pending')} className="text-xs bg-yellow-50 text-yellow-700 px-2.5 py-1.5 rounded-lg font-medium">
                        Reset KYC
                      </button>
                    )}
                    <button onClick={() => handleToggle(sup._id)}
                      className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg font-medium transition-colors ${
                        sup.isActive ? 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600' : 'bg-green-50 text-green-700 hover:bg-green-100'
                      }`}>
                      {sup.isActive ? <><ToggleRight className="w-3.5 h-3.5" /> Active</> : <><ToggleLeft className="w-3.5 h-3.5" /> Suspended</>}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
