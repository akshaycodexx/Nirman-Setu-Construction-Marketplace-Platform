import { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import AdminLayout from '../../components/AdminLayout';
import { Users, Plus, CheckCircle, XCircle, Clock, Search, X, Loader2, ToggleLeft, ToggleRight, Eye, Star, IndianRupee, TrendingUp, UserCheck, UserX } from 'lucide-react';

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
  const CATS = [
    { id: 'basic_materials', label: '🧱 Basic Materials' },
    { id: 'structural', label: '🏗️ Structural' },
    { id: 'wood_carpentry', label: '🪵 Wood & Carpentry' },
    { id: 'chemicals', label: '🧪 Chemicals' },
    { id: 'paint_finishing', label: '🎨 Paint & Finishing' },
    { id: 'flooring_tiling', label: '🪟 Flooring & Tiling' },
    { id: 'doors_windows', label: '🚪 Doors & Windows' },
    { id: 'interior_furniture', label: '🛋️ Interior & Furniture' },
    { id: 'electrical', label: '💡 Electrical' },
    { id: 'plumbing_sanitary', label: '🚿 Plumbing & Sanitary' },
    { id: 'machinery', label: '🚜 Machinery (Rental)' },
    { id: 'transport', label: '🚚 Transport' },
    { id: 'labour', label: '👷 Labour' },
    { id: 'contractors', label: '🧑‍💼 Contractors' },
    { id: 'design_planning', label: '📐 Design & Planning' },
    { id: 'shuttering', label: '🔩 Shuttering' },
    { id: 'water_utilities', label: '💧 Water & Utilities' },
    { id: 'smart_features', label: '🔌 Smart Features' },
    { id: 'complete_services', label: '🏡 Complete Services' },
    { id: 'commercial', label: '🏢 Commercial' },
    { id: 'support_services', label: '🧠 Support Services' },
  ];

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
            <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto pr-1">
              {CATS.map(cat => (
                <button type="button" key={cat.id} onClick={() => toggleCat(cat.id)}
                  className={`py-1.5 px-2 rounded-lg text-xs font-medium text-left border-2 transition-colors ${
                    form.categories.includes(cat.id) ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-gray-100 text-gray-500 hover:border-gray-200'
                  }`}>{cat.label}</button>
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

            {/* Scorecard */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" /> Supplier Scorecard
              </p>
              <div className="grid grid-cols-3 gap-2 mb-2">
                <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-3 text-center">
                  <div className="flex items-center justify-center gap-0.5 mb-0.5">
                    <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-400" />
                    <p className="text-xl font-bold text-yellow-800">{data.stats.avgRating ?? 'N/A'}</p>
                  </div>
                  <p className="text-xs text-yellow-600">{data.stats.ratingCount ? `${data.stats.ratingCount} review${data.stats.ratingCount !== 1 ? 's' : ''}` : 'No ratings'}</p>
                </div>
                <div className="bg-green-50 border border-green-100 rounded-xl p-3 text-center">
                  <p className="text-xl font-bold text-green-800">
                    {data.stats.total > 0 ? `${Math.round((data.stats.delivered / data.stats.total) * 100)}%` : 'N/A'}
                  </p>
                  <p className="text-xs text-green-600">Delivery Rate</p>
                </div>
                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 text-center">
                  <p className="text-lg font-bold text-indigo-800">₹{(data.stats.earnings || 0).toLocaleString('en-IN')}</p>
                  <p className="text-xs text-indigo-600">Paid Out</p>
                </div>
              </div>
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
  const [pendingRegs, setPendingRegs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [areaFilter, setAreaFilter] = useState('');
  const [availFilter, setAvailFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [detailId, setDetailId] = useState(null);
  const [approvingId, setApprovingId] = useState(null);

  const fetchPendingRegs = async () => {
    try {
      const { data } = await axios.get('/api/admin/suppliers?selfRegistered=true&isActive=false&kycStatus=pending');
      setPendingRegs(data.suppliers);
    } catch {}
  };

  const fetchSuppliers = async ({ q = '', area = '', avail = 'all' } = {}) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (q) params.set('search', q);
      if (area) params.set('area', area);
      if (avail !== 'all') params.set('availability', avail);
      const { data } = await axios.get(`/api/admin/suppliers?${params}`);
      setSuppliers(data.suppliers.filter(s => !(s.selfRegistered && !s.isActive && s.kycStatus === 'pending')));
    } catch {}
    setLoading(false);
  };

  const handleApprove = async (id) => {
    setApprovingId(id);
    try {
      await axios.put(`/api/admin/suppliers/${id}/kyc`, { kycStatus: 'verified' });
      await axios.put(`/api/admin/suppliers/${id}/toggle`);
      toast.success('Supplier approved!');
      setPendingRegs(r => r.filter(s => s._id !== id));
      fetchSuppliers();
    } catch { toast.error('Failed'); }
    setApprovingId(null);
  };

  const handleRejectReg = async (id) => {
    setApprovingId(id + '_reject');
    try {
      await axios.put(`/api/admin/suppliers/${id}/kyc`, { kycStatus: 'rejected' });
      toast.success('Registration rejected');
      setPendingRegs(r => r.filter(s => s._id !== id));
    } catch { toast.error('Failed'); }
    setApprovingId(null);
  };

  useEffect(() => { fetchSuppliers(); fetchPendingRegs(); }, []);

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

      {/* Pending self-registrations */}
      {pendingRegs.length > 0 && (
        <div className="bg-white rounded-2xl border border-blue-200 shadow-sm overflow-hidden mb-5">
          <div className="px-5 py-4 border-b border-blue-100 bg-blue-50 flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-500" />
            <h2 className="font-semibold text-blue-800">Pending Registrations ({pendingRegs.length})</h2>
            <span className="text-xs text-blue-500 ml-1">— Suppliers ne khud apply kiya, approval pending hai</span>
          </div>
          <div className="divide-y divide-gray-50">
            {pendingRegs.map(sup => (
              <div key={sup._id} className="px-5 py-4 flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-semibold text-gray-900">{sup.name}</span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">Self Registered</span>
                  </div>
                  <p className="text-sm text-gray-500">
                    {sup.phone}
                    {sup.email && ` · ${sup.email}`}
                    {sup.businessName && ` · ${sup.businessName}`}
                  </p>
                  {sup.categories?.length > 0 && (
                    <div className="flex gap-1 mt-1.5 flex-wrap">
                      {sup.categories.map(c => (
                        <span key={c} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full capitalize">{c}</span>
                      ))}
                      {sup.serviceAreas?.slice(0, 3).map(a => (
                        <span key={a} className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">{a}</span>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    Applied: {new Date(sup.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => setDetailId(sup._id)}
                    className="flex items-center gap-1 text-xs bg-gray-50 hover:bg-gray-100 text-gray-600 px-2.5 py-1.5 rounded-lg font-medium transition-colors">
                    <Eye className="w-3.5 h-3.5" /> View
                  </button>
                  <button
                    onClick={() => handleApprove(sup._id)}
                    disabled={approvingId === sup._id || approvingId === sup._id + '_reject'}
                    className="flex items-center gap-1 text-xs bg-green-50 hover:bg-green-100 text-green-700 px-2.5 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-50">
                    {approvingId === sup._id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserCheck className="w-3.5 h-3.5" />}
                    Approve
                  </button>
                  <button
                    onClick={() => handleRejectReg(sup._id)}
                    disabled={approvingId === sup._id || approvingId === sup._id + '_reject'}
                    className="flex items-center gap-1 text-xs bg-red-50 hover:bg-red-100 text-red-700 px-2.5 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-50">
                    {approvingId === sup._id + '_reject' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserX className="w-3.5 h-3.5" />}
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search + Filters */}
      <div className="space-y-2 mb-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && fetchSuppliers({ q: search, area: areaFilter, avail: availFilter })}
              placeholder="Search by name, phone, business name..."
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>
          <input
            type="text"
            value={areaFilter}
            onChange={e => setAreaFilter(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && fetchSuppliers({ q: search, area: areaFilter, avail: availFilter })}
            placeholder="Filter by area/city..."
            className="w-40 px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>
        <div className="flex gap-2 items-center">
          <span className="text-xs font-medium text-gray-500">Availability:</span>
          {[['all', 'All'], ['true', 'Available'], ['false', 'Busy']].map(([val, label]) => (
            <button
              key={val}
              onClick={() => { setAvailFilter(val); fetchSuppliers({ q: search, area: areaFilter, avail: val }); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                availFilter === val
                  ? val === 'true' ? 'bg-green-600 text-white' : val === 'false' ? 'bg-red-500 text-white' : 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {label}
            </button>
          ))}
          <button
            onClick={() => fetchSuppliers({ q: search, area: areaFilter, avail: availFilter })}
            className="ml-auto px-3 py-1.5 rounded-lg text-xs font-medium bg-orange-500 text-white hover:bg-orange-600 transition-colors"
          >
            Search
          </button>
        </div>
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
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        sup.availability ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {sup.availability ? 'Available' : 'Busy'}
                      </span>
                      {!sup.isActive && <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-600">Suspended</span>}
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
