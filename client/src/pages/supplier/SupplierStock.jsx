import { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useSupplier } from '../../context/SupplierContext';
import SupplierLayout from '../../components/SupplierLayout';
import {
  Package, Plus, X, Loader2, Edit3, Trash2, ToggleLeft, ToggleRight,
  IndianRupee, MapPin, Tag, Boxes
} from 'lucide-react';
import useT from '../../i18n/useT';

const CATEGORY_KEYS = [
  { id: 'cement',    labelKey: 'suppstock.cat.cement',    color: 'bg-gray-100 text-gray-700' },
  { id: 'sand',      labelKey: 'suppstock.cat.sand',      color: 'bg-yellow-100 text-yellow-700' },
  { id: 'aggregate', labelKey: 'suppstock.cat.aggregate', color: 'bg-stone-100 text-stone-700' },
  { id: 'steel',     labelKey: 'suppstock.cat.steel',     color: 'bg-blue-100 text-blue-700' },
  { id: 'brick',     labelKey: 'suppstock.cat.brick',     color: 'bg-red-100 text-red-700' },
  { id: 'equipment', labelKey: 'suppstock.cat.equipment', color: 'bg-orange-100 text-orange-700' },
  { id: 'transport', labelKey: 'suppstock.cat.transport', color: 'bg-purple-100 text-purple-700' },
  { id: 'other',     labelKey: 'suppstock.cat.other',     color: 'bg-green-100 text-green-700' },
];
const CAT_COLOR = Object.fromEntries(CATEGORY_KEYS.map(c => [c.id, c.color]));

const EMPTY_FORM = {
  material: '', category: 'cement', grade: '', unit: '',
  quantity: '', pricePerUnit: '', minOrderQty: '1', city: '', note: '',
};

function StockModal({ initial, onClose, onSave }) {
  const t = useT();
  const categories = CATEGORY_KEYS.map(c => ({ ...c, label: t(c.labelKey) }));
  const [form, setForm] = useState(initial ? {
    ...initial,
    quantity: String(initial.quantity),
    pricePerUnit: String(initial.pricePerUnit),
    minOrderQty: String(initial.minOrderQty || 1),
  } : EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const isEdit = !!initial?.stockId;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.material.trim() || !form.unit.trim() || !form.quantity || !form.pricePerUnit || !form.city.trim()) {
      toast.error(t('suppstock.reqFields'));
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
          <h2 className="font-bold text-gray-900">{isEdit ? t('suppstock.modal.edit') : t('suppstock.modal.add')}</h2>
          <button onClick={onClose}><X className="w-4 h-4 text-gray-400" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">{t('suppstock.modal.material')}</label>
            <input value={form.material} onChange={e => set('material', e.target.value)}
              placeholder={t('suppstock.modal.materialPh')}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">{t('suppstock.modal.category')}</label>
              <select value={form.category} onChange={e => set('category', e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400">
                {categories.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">{t('suppstock.modal.grade')}</label>
              <input value={form.grade} onChange={e => set('grade', e.target.value)}
                placeholder={t('suppstock.modal.gradePh')}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">{t('suppstock.modal.unit')}</label>
              <input value={form.unit} onChange={e => set('unit', e.target.value)}
                placeholder={t('suppstock.modal.unitPh')}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">{t('suppstock.modal.city')}</label>
              <input value={form.city} onChange={e => set('city', e.target.value)}
                placeholder={t('suppstock.modal.cityPh')}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">{t('suppstock.modal.qty')}</label>
              <input type="number" min="0" value={form.quantity} onChange={e => set('quantity', e.target.value)}
                placeholder="500"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">{t('suppstock.modal.price')}</label>
              <input type="number" min="0" value={form.pricePerUnit} onChange={e => set('pricePerUnit', e.target.value)}
                placeholder="360"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1">{t('suppstock.modal.minOrder')}</label>
              <input type="number" min="1" value={form.minOrderQty} onChange={e => set('minOrderQty', e.target.value)}
                placeholder="10"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">{t('suppstock.modal.note')}</label>
            <input value={form.note} onChange={e => set('note', e.target.value)}
              placeholder={t('suppstock.modal.notePh')}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" />
          </div>
          <button type="submit" disabled={saving}
            className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-300 text-white font-semibold py-3 rounded-xl text-sm">
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> {t('suppstock.modal.saving')}</> : isEdit ? t('suppstock.modal.update') : t('suppstock.modal.addBtn')}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function SupplierStock() {
  const { getAuthHeaders } = useSupplier();
  const t = useT();
  const categories = CATEGORY_KEYS.map(c => ({ ...c, label: t(c.labelKey) }));
  const [stock, setStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [catFilter, setCatFilter] = useState('all');

  const fetchStock = async () => {
    try {
      const { data } = await axios.get('/api/stock/my', { headers: getAuthHeaders() });
      setStock(data.stock || []);
    } catch {
      toast.error(t('suppstock.loadFail'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStock(); }, []);

  const handleCreate = async (form) => {
    const { data } = await axios.post('/api/stock', form, { headers: getAuthHeaders() });
    setStock(prev => [...prev, data.item]);
    toast.success(t('suppstock.added'));
  };

  const handleUpdate = async (form) => {
    const { data } = await axios.put(`/api/stock/${editItem.stockId}`, form, { headers: getAuthHeaders() });
    setStock(prev => prev.map(s => s.stockId === editItem.stockId ? data.item : s));
    toast.success(t('suppstock.updated'));
  };

  const handleToggle = async (item) => {
    try {
      const { data } = await axios.patch(`/api/stock/${item.stockId}/toggle`, {}, { headers: getAuthHeaders() });
      setStock(prev => prev.map(s => s.stockId === item.stockId ? data.item : s));
    } catch {
      toast.error(t('suppstock.toggleFail'));
    }
  };

  const handleDelete = async (stockId) => {
    if (!window.confirm(t('suppstock.deleteConfirm'))) return;
    try {
      await axios.delete(`/api/stock/${stockId}`, { headers: getAuthHeaders() });
      setStock(prev => prev.filter(s => s.stockId !== stockId));
      toast.success(t('suppstock.deleted'));
    } catch {
      toast.error(t('suppstock.deleteFail'));
    }
  };

  const filtered = catFilter === 'all' ? stock : stock.filter(s => s.category === catFilter);
  const availableCount = stock.filter(s => s.isAvailable).length;
  const totalValue = stock.reduce((sum, s) => sum + s.quantity * s.pricePerUnit, 0);

  return (
    <SupplierLayout>
      <div className="max-w-3xl mx-auto space-y-5">

        <div className="bg-linear-to-r from-emerald-600 to-teal-600 rounded-2xl p-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold flex items-center gap-2">
                <Boxes className="w-5 h-5" /> {t('suppstock.title')}
              </h1>
              <p className="text-emerald-100 text-sm mt-0.5">{t('suppstock.sub')}</p>
            </div>
            <button onClick={() => { setEditItem(null); setShowModal(true); }}
              className="flex items-center gap-2 bg-white text-emerald-700 font-semibold text-sm px-4 py-2 rounded-xl hover:bg-emerald-50 transition-colors shrink-0">
              <Plus className="w-4 h-4" /> {t('suppstock.addStock')}
            </button>
          </div>
          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="bg-white/20 rounded-xl p-3 text-center">
              <p className="text-2xl font-black">{stock.length}</p>
              <p className="text-xs text-emerald-100">{t('suppstock.totalItems')}</p>
            </div>
            <div className="bg-white/20 rounded-xl p-3 text-center">
              <p className="text-2xl font-black">{availableCount}</p>
              <p className="text-xs text-emerald-100">{t('suppstock.available')}</p>
            </div>
            <div className="bg-white/20 rounded-xl p-3 text-center">
              <p className="text-lg font-black">₹{(totalValue / 1000).toFixed(0)}k</p>
              <p className="text-xs text-emerald-100">{t('suppstock.stockValue')}</p>
            </div>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {[{ id: 'all', label: t('suppstock.all') }, ...categories].map(c => (
            <button key={c.id} onClick={() => setCatFilter(c.id)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                catFilter === c.id
                  ? 'bg-emerald-500 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}>
              {c.label}
              {c.id !== 'all' && (
                <span className="ml-1 opacity-70">({stock.filter(s => s.category === c.id).length})</span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 py-16 text-center">
            <Package className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">{t('suppstock.noStock')}</p>
            <p className="text-gray-400 text-sm mt-1">{t('suppstock.noStockSub')}</p>
            <button onClick={() => { setEditItem(null); setShowModal(true); }}
              className="mt-4 inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-5 py-2.5 rounded-xl text-sm">
              <Plus className="w-4 h-4" /> {t('suppstock.addFirst')}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(item => (
              <div key={item.stockId}
                className={`bg-white rounded-2xl border transition-all p-4 ${item.isAvailable ? 'border-gray-100' : 'border-gray-100 opacity-60'}`}>
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-bold text-gray-900">{item.material}</span>
                      {item.grade && <span className="text-xs text-gray-400">{item.grade}</span>}
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${CAT_COLOR[item.category] || 'bg-gray-100 text-gray-600'}`}>
                        {item.category}
                      </span>
                      {!item.isAvailable && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-100 text-red-600">{t('suppstock.unavailable')}</span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
                      <div className="bg-gray-50 rounded-xl p-2 text-center">
                        <p className="text-base font-black text-gray-900">{item.quantity.toLocaleString('en-IN')}</p>
                        <p className="text-[10px] text-gray-400">{t('suppstock.qtyAvail', { qty: '', unit: item.unit }).trim()}</p>
                      </div>
                      <div className="bg-green-50 rounded-xl p-2 text-center">
                        <p className="text-base font-black text-green-700">₹{item.pricePerUnit.toLocaleString('en-IN')}</p>
                        <p className="text-[10px] text-gray-400">{t('suppstock.perUnit', { unit: item.unit })}</p>
                      </div>
                      <div className="bg-blue-50 rounded-xl p-2 text-center">
                        <p className="text-base font-black text-blue-700">{item.minOrderQty}</p>
                        <p className="text-[10px] text-gray-400">{t('suppstock.minOrder')}</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-2 text-center flex items-center justify-center gap-1">
                        <MapPin className="w-3 h-3 text-gray-400" />
                        <p className="text-xs text-gray-600 font-medium truncate">{item.city}</p>
                      </div>
                    </div>

                    {item.note && <p className="text-xs text-gray-400 mt-2 italic">{item.note}</p>}
                  </div>

                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <button onClick={() => handleToggle(item)}>
                      {item.isAvailable
                        ? <ToggleRight className="w-6 h-6 text-emerald-500" />
                        : <ToggleLeft className="w-6 h-6 text-gray-300" />
                      }
                    </button>
                    <button onClick={() => { setEditItem(item); setShowModal(true); }}
                      className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDelete(item.stockId)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <StockModal
          initial={editItem}
          onClose={() => { setShowModal(false); setEditItem(null); }}
          onSave={editItem ? handleUpdate : handleCreate}
        />
      )}
    </SupplierLayout>
  );
}
