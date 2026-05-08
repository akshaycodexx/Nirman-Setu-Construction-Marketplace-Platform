import { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import AdminLayout from '../../components/AdminLayout';
import { useAdmin } from '../../context/AdminContext';
import {
  TrendingUp, Plus, X, Loader2, Edit3, Trash2, ToggleLeft, ToggleRight,
  RefreshCw, IndianRupee, Tag
} from 'lucide-react';
import useT from '../../i18n/useT';

const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'cement', label: 'Cement', color: 'bg-gray-100 text-gray-700' },
  { id: 'sand', label: 'Sand', color: 'bg-yellow-100 text-yellow-700' },
  { id: 'aggregate', label: 'Aggregate', color: 'bg-stone-100 text-stone-700' },
  { id: 'steel', label: 'Steel', color: 'bg-blue-100 text-blue-700' },
  { id: 'brick', label: 'Brick', color: 'bg-red-100 text-red-700' },
  { id: 'equipment', label: 'Equipment', color: 'bg-orange-100 text-orange-700' },
  { id: 'labour', label: 'Labour', color: 'bg-purple-100 text-purple-700' },
  { id: 'other', label: 'Other', color: 'bg-green-100 text-green-700' },
];

const CAT_COLOR = Object.fromEntries(CATEGORIES.slice(1).map(c => [c.id, c.color]));

const EMPTY_FORM = { material: '', grade: '', unit: '', minRate: '', maxRate: '', category: 'cement', city: 'All Cities', note: '' };

function RateModal({ initial, onClose, onSave }) {
  const [form, setForm] = useState(initial || EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const isEdit = !!initial?.rateId;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.material.trim() || !form.unit.trim() || !form.minRate || !form.maxRate) {
      toast.error('Material, unit, min aur max rate required hai');
      return;
    }
    if (Number(form.minRate) > Number(form.maxRate)) {
      toast.error('Min rate max rate se zyada nahi ho sakta');
      return;
    }
    setSaving(true);
    try {
      await onSave(form);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50">
      <div className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl overflow-y-auto max-h-[90vh]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 sticky top-0 bg-white">
          <h2 className="font-bold text-gray-900">{isEdit ? 'Rate Edit Karo' : 'Naya Rate Daalo'}</h2>
          <button onClick={onClose}><X className="w-4 h-4 text-gray-400" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1">Material Name *</label>
              <input value={form.material} onChange={e => set('material', e.target.value)}
                placeholder="e.g. Cement (OPC 53), River Sand..."
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Grade / Type</label>
              <input value={form.grade} onChange={e => set('grade', e.target.value)}
                placeholder="OPC 53, Fe500, 20mm..."
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Unit *</label>
              <input value={form.unit} onChange={e => set('unit', e.target.value)}
                placeholder="bag, CFT, kg, piece..."
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Min Rate (₹) *</label>
              <input type="number" value={form.minRate} onChange={e => set('minRate', e.target.value)}
                placeholder="350"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Max Rate (₹) *</label>
              <input type="number" value={form.maxRate} onChange={e => set('maxRate', e.target.value)}
                placeholder="420"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Category</label>
              <select value={form.category} onChange={e => set('category', e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400">
                {CATEGORIES.slice(1).map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">City</label>
              <input value={form.city} onChange={e => set('city', e.target.value)}
                placeholder="All Cities / Patna..."
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1">Note (optional)</label>
              <input value={form.note} onChange={e => set('note', e.target.value)}
                placeholder="Extra info, e.g. inclusive of delivery..."
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
            </div>
          </div>
          <button type="submit" disabled={saving}
            className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white font-semibold py-3 rounded-xl text-sm">
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : isEdit ? 'Rate Update Karo' : 'Rate Add Karo'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function AdminRates() {
  const { getAuthHeaders } = useAdmin();
  const t = useT();
  const [rates, setRates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [catFilter, setCatFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editRate, setEditRate] = useState(null);

  const fetchRates = async () => {
    try {
      const { data } = await axios.get('/api/rates/admin', { headers: getAuthHeaders() });
      setRates(data.rates || []);
    } catch {
      toast.error(t('admin.rates.loadFailed'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRates(); }, []);

  const handleSeed = async () => {
    setSeeding(true);
    try {
      const { data } = await axios.post('/api/rates/admin/seed', {}, { headers: getAuthHeaders() });
      toast.success(data.message);
      fetchRates();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Seed failed');
    } finally {
      setSeeding(false);
    }
  };

  const handleCreate = async (form) => {
    const { data } = await axios.post('/api/rates/admin', form, { headers: getAuthHeaders() });
    setRates(prev => [...prev, data.rate]);
    toast.success('Rate add ho gaya!');
  };

  const handleUpdate = async (form) => {
    const { data } = await axios.put(`/api/rates/admin/${editRate.rateId}`, form, { headers: getAuthHeaders() });
    setRates(prev => prev.map(r => r.rateId === editRate.rateId ? data.rate : r));
    toast.success('Rate update ho gaya!');
  };

  const handleToggle = async (rate) => {
    try {
      const { data } = await axios.put(`/api/rates/admin/${rate.rateId}`, { isActive: !rate.isActive }, { headers: getAuthHeaders() });
      setRates(prev => prev.map(r => r.rateId === rate.rateId ? data.rate : r));
    } catch {
      toast.error('Toggle failed');
    }
  };

  const handleDelete = async (rateId) => {
    if (!window.confirm('Is rate ko delete karo?')) return;
    try {
      await axios.delete(`/api/rates/admin/${rateId}`, { headers: getAuthHeaders() });
      setRates(prev => prev.filter(r => r.rateId !== rateId));
      toast.success('Rate delete ho gaya');
    } catch {
      toast.error('Delete failed');
    }
  };

  const filtered = catFilter === 'all' ? rates : rates.filter(r => r.category === catFilter);
  const activeCount = rates.filter(r => r.isActive).length;

  return (
    <AdminLayout>
      <div className="space-y-5">

        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl p-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold flex items-center gap-2">
                <TrendingUp className="w-5 h-5" /> {t('admin.nav.rates')}
              </h1>
              <p className="text-orange-100 text-sm mt-0.5">Live market rates — customers aur estimator mein dikhega</p>
            </div>
            <div className="flex gap-2">
              {rates.length === 0 && (
                <button onClick={handleSeed} disabled={seeding}
                  className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white text-sm font-semibold px-3 py-2 rounded-xl transition-colors">
                  {seeding ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                  {t('admin.rates.seedDefaults')}
                </button>
              )}
              <button onClick={() => { setEditRate(null); setShowModal(true); }}
                className="flex items-center gap-2 bg-white text-orange-600 font-semibold text-sm px-4 py-2 rounded-xl hover:bg-orange-50 transition-colors shrink-0">
                <Plus className="w-4 h-4" /> {t('admin.rates.addRate')}
              </button>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="bg-white/20 rounded-xl p-3 text-center">
              <p className="text-2xl font-black">{rates.length}</p>
              <p className="text-xs text-orange-100">{t('admin.rates.totalRates')}</p>
            </div>
            <div className="bg-white/20 rounded-xl p-3 text-center">
              <p className="text-2xl font-black">{activeCount}</p>
              <p className="text-xs text-orange-100">{t('admin.rates.active')}</p>
            </div>
            <div className="bg-white/20 rounded-xl p-3 text-center">
              <p className="text-2xl font-black">{new Set(rates.map(r => r.category)).size}</p>
              <p className="text-xs text-orange-100">{t('admin.orders.category')}</p>
            </div>
          </div>
        </div>

        {/* Category filter */}
        <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
          {CATEGORIES.map(c => (
            <button key={c.id} onClick={() => setCatFilter(c.id)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                catFilter === c.id
                  ? 'bg-orange-500 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}>
              {c.label}
              {c.id !== 'all' && (
                <span className="ml-1 opacity-70">
                  ({rates.filter(r => r.category === c.id).length})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Rates list */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 py-16 text-center">
            <IndianRupee className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">Koi rate nahi mila</p>
            {rates.length === 0 && (
              <button onClick={handleSeed} disabled={seeding}
                className="mt-4 inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-5 py-2.5 rounded-xl text-sm">
                {seeding ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                Default Rates Load Karo
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Material</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Unit</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Rate Range</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">City</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(rate => (
                  <tr key={rate.rateId} className={`hover:bg-gray-50 transition-colors ${!rate.isActive ? 'opacity-50' : ''}`}>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-semibold text-gray-900">{rate.material}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {rate.grade && <span className="text-xs text-gray-400">{rate.grade}</span>}
                          <span className={`inline-flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${CAT_COLOR[rate.category] || 'bg-gray-100 text-gray-600'}`}>
                            <Tag className="w-2.5 h-2.5" /> {rate.category}
                          </span>
                        </div>
                        {rate.note && <p className="text-xs text-gray-400 mt-0.5 italic">{rate.note}</p>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 hidden sm:table-cell">{rate.unit}</td>
                    <td className="px-4 py-3">
                      <span className="font-bold text-gray-900">₹{rate.minRate.toLocaleString('en-IN')}</span>
                      <span className="text-gray-400 mx-1">–</span>
                      <span className="font-bold text-gray-900">₹{rate.maxRate.toLocaleString('en-IN')}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 hidden md:table-cell text-xs">{rate.city}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => handleToggle(rate)} title={rate.isActive ? 'Active — click to deactivate' : 'Inactive — click to activate'}>
                        {rate.isActive
                          ? <ToggleRight className="w-5 h-5 text-green-500" />
                          : <ToggleLeft className="w-5 h-5 text-gray-300" />
                        }
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <button onClick={() => { setEditRate(rate); setShowModal(true); }}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDelete(rate.rateId)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Last updated note */}
        {rates.length > 0 && (
          <p className="text-xs text-gray-400 text-right">
            Last updated: {new Date(Math.max(...rates.map(r => new Date(r.updatedAt)))).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </p>
        )}
      </div>

      {showModal && (
        <RateModal
          initial={editRate}
          onClose={() => { setShowModal(false); setEditRate(null); }}
          onSave={editRate ? handleUpdate : handleCreate}
        />
      )}
    </AdminLayout>
  );
}
