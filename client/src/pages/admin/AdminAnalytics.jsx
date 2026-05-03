import { useEffect, useState } from 'react';
import axios from 'axios';
import AdminLayout from '../../components/AdminLayout';
import { TrendingUp, BarChart2, MapPin, Award, IndianRupee, Package } from 'lucide-react';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const CAT_LABELS = {
  basic_materials: 'Basic Materials', structural: 'Structural', wood_carpentry: 'Wood & Carpentry',
  chemicals: 'Chemicals', paint_finishing: 'Paint & Finishing', flooring_tiling: 'Flooring & Tiling',
  doors_windows: 'Doors & Windows', interior_furniture: 'Interior & Furniture', electrical: 'Electrical',
  plumbing_sanitary: 'Plumbing & Sanitary', machinery: 'Machinery', transport: 'Transport',
  labour: 'Labour', contractors: 'Contractors', design_planning: 'Design & Planning',
  shuttering: 'Shuttering', water_utilities: 'Water & Utilities', smart_features: 'Smart Features',
  complete_services: 'Complete Services', commercial: 'Commercial', support_services: 'Support Services',
};

function BarChart({ data, valueKey, labelKey, color = 'bg-orange-500', prefix = '', suffix = '' }) {
  const max = Math.max(...data.map(d => d[valueKey]), 1);
  return (
    <div className="flex items-end gap-2 h-36 mt-2">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
          <div
            className={`w-full ${color} rounded-t-lg transition-all duration-300 min-h-[4px]`}
            style={{ height: `${Math.max((d[valueKey] / max) * 120, 4)}px` }}
          />
          <span className="text-[10px] text-gray-400 truncate w-full text-center">{d[labelKey]}</span>
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
            {prefix}{typeof d[valueKey] === 'number' ? d[valueKey].toLocaleString('en-IN') : d[valueKey]}{suffix}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AdminAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/admin/analytics')
      .then(r => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const monthly = (data?.monthly || []).map(m => ({
    ...m,
    label: `${MONTHS[m._id.month - 1]} ${String(m._id.year).slice(2)}`,
  }));

  const categories = data?.categories || [];
  const cities = data?.cities || [];
  const topSuppliers = data?.topSuppliers || [];
  const totalOrders = categories.reduce((s, c) => s + c.count, 0);
  const totalRevenue = monthly.reduce((s, m) => s + (m.revenue || 0), 0);
  const totalQuoted = monthly.reduce((s, m) => s + (m.quoted || 0), 0);
  const totalMonthlyOrders = monthly.reduce((s, m) => s + m.orders, 0);

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-orange-500" /> Analytics
        </h1>
        <p className="text-gray-500 text-sm mt-0.5">Revenue trends, category breakdown, city stats</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Revenue Collected', value: loading ? '—' : `₹${totalRevenue.toLocaleString('en-IN')}`, icon: IndianRupee, color: 'bg-green-500', sub: 'Advance payments (6 months)' },
          { label: 'Total Quoted Value', value: loading ? '—' : `₹${totalQuoted.toLocaleString('en-IN')}`, icon: TrendingUp, color: 'bg-orange-500', sub: 'All quotes (6 months)' },
          { label: 'Orders (6 months)', value: loading ? '—' : totalMonthlyOrders, icon: Package, color: 'bg-blue-500', sub: 'Total orders placed' },
          { label: 'Avg Order Value', value: loading || !totalOrders ? '—' : `₹${Math.round(totalQuoted / Math.max(totalOrders, 1)).toLocaleString('en-IN')}`, icon: BarChart2, color: 'bg-purple-500', sub: 'Per quoted order' },
        ].map(k => (
          <div key={k.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-gray-500">{k.label}</span>
              <div className={`${k.color} p-1.5 rounded-lg`}><k.icon className="w-3.5 h-3.5 text-white" /></div>
            </div>
            <p className="text-2xl font-black text-gray-900">{k.value}</p>
            <p className="text-xs text-gray-400 mt-1">{k.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        {/* Monthly Orders Chart */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-orange-500" /> Monthly Orders
          </h2>
          <p className="text-xs text-gray-400 mb-3">Last 6 months — hover for value</p>
          {loading ? (
            <div className="h-36 bg-gray-50 animate-pulse rounded-xl" />
          ) : monthly.length === 0 ? (
            <div className="h-36 flex items-center justify-center text-gray-400 text-sm">No data yet</div>
          ) : (
            <BarChart data={monthly} valueKey="orders" labelKey="label" color="bg-orange-400" />
          )}
        </div>

        {/* Monthly Revenue Chart */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
            <IndianRupee className="w-4 h-4 text-green-500" /> Monthly Revenue
          </h2>
          <p className="text-xs text-gray-400 mb-3">Advance collected — hover for value</p>
          {loading ? (
            <div className="h-36 bg-gray-50 animate-pulse rounded-xl" />
          ) : monthly.length === 0 ? (
            <div className="h-36 flex items-center justify-center text-gray-400 text-sm">No data yet</div>
          ) : (
            <BarChart data={monthly} valueKey="revenue" labelKey="label" color="bg-green-400" prefix="₹" />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
        {/* Category Breakdown */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Package className="w-4 h-4 text-orange-500" /> Category Breakdown
          </h2>
          {loading ? (
            <div className="space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="h-8 bg-gray-50 animate-pulse rounded-lg" />)}</div>
          ) : categories.length === 0 ? (
            <p className="text-gray-400 text-sm py-8 text-center">No orders yet</p>
          ) : (
            <div className="space-y-3">
              {categories.map(c => {
                const pct = totalOrders ? Math.round((c.count / totalOrders) * 100) : 0;
                return (
                  <div key={c._id}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="font-medium text-gray-800 capitalize">{CAT_LABELS[c._id] || c._id}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-gray-500">{c.count} orders</span>
                        {c.revenue > 0 && <span className="text-gray-400 text-xs">₹{c.revenue.toLocaleString('en-IN')}</span>}
                        <span className="text-xs font-semibold text-orange-600 w-8 text-right">{pct}%</span>
                      </div>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-orange-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* City Breakdown */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-orange-500" /> Top Cities
          </h2>
          {loading ? (
            <div className="space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="h-8 bg-gray-50 animate-pulse rounded-lg" />)}</div>
          ) : cities.length === 0 ? (
            <p className="text-gray-400 text-sm py-8 text-center">No data yet</p>
          ) : (
            <div className="space-y-3">
              {cities.map((c, i) => {
                const maxCount = cities[0]?.count || 1;
                return (
                  <div key={c._id} className="flex items-center gap-3">
                    <span className="text-xs font-bold text-gray-400 w-4">{i + 1}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="font-medium text-gray-800">{c._id || 'Unknown'}</span>
                        <span className="text-gray-500 text-xs">{c.count}</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full">
                        <div className="h-full bg-blue-400 rounded-full" style={{ width: `${(c.count / maxCount) * 100}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Top Suppliers */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Award className="w-4 h-4 text-orange-500" /> Top Suppliers (by Delivered Orders)
        </h2>
        {loading ? (
          <div className="space-y-2">{[...Array(3)].map((_, i) => <div key={i} className="h-12 bg-gray-50 animate-pulse rounded-xl" />)}</div>
        ) : topSuppliers.length === 0 ? (
          <p className="text-gray-400 text-sm py-8 text-center">Koi delivered order abhi tak nahi</p>
        ) : (
          <div className="divide-y divide-gray-50">
            {topSuppliers.map((s, i) => (
              <div key={s._id} className="flex items-center gap-4 py-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                  i === 0 ? 'bg-yellow-100 text-yellow-700' :
                  i === 1 ? 'bg-gray-100 text-gray-600' :
                  'bg-orange-50 text-orange-600'
                }`}>
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm">{s.name}</p>
                  {s.businessName && <p className="text-xs text-gray-400">{s.businessName}</p>}
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-gray-900">{s.delivered} delivered</p>
                  {s.revenue > 0 && <p className="text-xs text-gray-400">₹{s.revenue.toLocaleString('en-IN')} collected</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
