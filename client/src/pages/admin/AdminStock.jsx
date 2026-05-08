import { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import AdminLayout from '../../components/AdminLayout';
import { useAdmin } from '../../context/AdminContext';
import { Boxes, Search, Loader2, MapPin, CheckCircle, XCircle, Star, Filter } from 'lucide-react';
import useT from '../../i18n/useT';

const CATEGORIES = [
  { id: '', label: 'All Categories' },
  { id: 'cement',    label: 'Cement' },
  { id: 'sand',      label: 'Sand' },
  { id: 'aggregate', label: 'Aggregate' },
  { id: 'steel',     label: 'Steel' },
  { id: 'brick',     label: 'Brick' },
  { id: 'equipment', label: 'Equipment' },
  { id: 'transport', label: 'Transport' },
  { id: 'other',     label: 'Other' },
];

const CAT_COLOR = {
  cement: 'bg-gray-100 text-gray-700',
  sand: 'bg-yellow-100 text-yellow-700',
  aggregate: 'bg-stone-100 text-stone-700',
  steel: 'bg-blue-100 text-blue-700',
  brick: 'bg-red-100 text-red-700',
  equipment: 'bg-orange-100 text-orange-700',
  transport: 'bg-purple-100 text-purple-700',
  other: 'bg-green-100 text-green-700',
};

export default function AdminStock() {
  const { getAuthHeaders } = useAdmin();
  const t = useT();
  const [stock, setStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ q: '', category: '', city: '', available: '' });
  const [searching, setSearching] = useState(false);
  const setF = (k, v) => setFilters(f => ({ ...f, [k]: v }));

  const fetchStock = async (f = filters) => {
    setSearching(true);
    try {
      const params = new URLSearchParams();
      if (f.q) params.set('q', f.q);
      if (f.category) params.set('category', f.category);
      if (f.city) params.set('city', f.city);
      if (f.available) params.set('available', f.available);

      const { data } = await axios.get(`/api/stock/admin/all?${params}`, { headers: getAuthHeaders() });
      setStock(data.stock || []);
    } catch {
      toast.error(t('admin.stock.loadFailed'));
    } finally {
      setLoading(false);
      setSearching(false);
    }
  };

  useEffect(() => { fetchStock(); }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchStock(filters);
  };

  const availableCount = stock.filter(s => s.isAvailable).length;
  const uniqueSuppliers = new Set(stock.map(s => s.supplierId?._id)).size;

  return (
    <AdminLayout>
      <div className="space-y-5">

        {/* Header */}
        <div className="bg-gradient-to-r from-teal-600 to-emerald-600 rounded-2xl p-5 text-white">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 rounded-xl p-2.5">
              <Boxes className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold">{t('admin.nav.stock')}</h1>
              <p className="text-teal-100 text-sm mt-0.5">Dekho kiske paas kya available hai — order assign karne se pehle</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="bg-white/20 rounded-xl p-3 text-center">
              <p className="text-2xl font-black">{stock.length}</p>
              <p className="text-xs text-teal-100">{t('admin.stock.totalListings')}</p>
            </div>
            <div className="bg-white/20 rounded-xl p-3 text-center">
              <p className="text-2xl font-black">{availableCount}</p>
              <p className="text-xs text-teal-100">{t('admin.stock.availableNow')}</p>
            </div>
            <div className="bg-white/20 rounded-xl p-3 text-center">
              <p className="text-2xl font-black">{uniqueSuppliers}</p>
              <p className="text-xs text-teal-100">{t('admin.nav.suppliers')}</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <form onSubmit={handleSearch} className="bg-white rounded-2xl border border-gray-100 p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={filters.q}
                onChange={e => setF('q', e.target.value)}
                placeholder={t('admin.stock.searchPh')}
                className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
              />
            </div>
            <select value={filters.category} onChange={e => setF('category', e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400">
              {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
            <input
              value={filters.city}
              onChange={e => setF('city', e.target.value)}
              placeholder={t('admin.orders.cityPh')}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
            />
            <div className="flex gap-2">
              <select value={filters.available} onChange={e => setF('available', e.target.value)}
                className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400">
                <option value="">{t('admin.stock.allStatus')}</option>
                <option value="true">{t('admin.stock.availableOnly')}</option>
                <option value="false">{t('admin.stock.unavailable')}</option>
              </select>
              <button type="submit" disabled={searching}
                className="px-4 py-2.5 bg-teal-500 hover:bg-teal-600 text-white rounded-xl text-sm font-semibold transition-colors flex items-center gap-1.5">
                {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Filter className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </form>

        {/* Stock Table */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
          </div>
        ) : stock.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 py-16 text-center">
            <Boxes className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">{t('admin.stock.empty')}</p>
            <p className="text-gray-400 text-sm mt-1">Suppliers abhi tak stock list nahi kar rahe — unhe batao</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Material</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Supplier</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Qty / Price</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">City</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {stock.map(item => (
                  <tr key={item.stockId} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-semibold text-gray-900">{item.material}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {item.grade && <span className="text-xs text-gray-400">{item.grade}</span>}
                          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${CAT_COLOR[item.category] || 'bg-gray-100 text-gray-600'}`}>
                            {item.category}
                          </span>
                        </div>
                        {item.note && <p className="text-xs text-gray-400 mt-0.5 italic">{item.note}</p>}
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="font-medium text-gray-900">{item.supplierId?.name}</p>
                          {item.supplierId?.verifiedBadge && (
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          )}
                        </div>
                        {item.supplierId?.businessName && (
                          <p className="text-xs text-gray-400">{item.supplierId.businessName}</p>
                        )}
                        {item.supplierId?.rating?.totalCount > 0 && (
                          <div className="flex items-center gap-1 mt-0.5">
                            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                            <span className="text-xs text-gray-500">{item.supplierId.rating.average?.toFixed(1)} ({item.supplierId.rating.totalCount})</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-bold text-gray-900">{item.quantity.toLocaleString('en-IN')} {item.unit}</p>
                      <p className="text-xs text-green-600 font-semibold">₹{item.pricePerUnit.toLocaleString('en-IN')} / {item.unit}</p>
                      {item.minOrderQty > 1 && (
                        <p className="text-xs text-gray-400">Min: {item.minOrderQty} {item.unit}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <div className="flex items-center gap-1 text-gray-600 text-xs">
                        <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
                        {item.city}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {item.isAvailable ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold bg-green-100 text-green-700 px-2 py-1 rounded-full">
                          <CheckCircle className="w-3 h-3" /> Available
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold bg-gray-100 text-gray-500 px-2 py-1 rounded-full">
                          <XCircle className="w-3 h-3" /> Unavailable
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
