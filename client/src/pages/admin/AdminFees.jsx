import { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import AdminLayout from '../../components/AdminLayout';
import { BadgeIndianRupee, CheckCircle, Clock, XCircle, Loader2, RefreshCw } from 'lucide-react';

const STATUS_STYLE = {
  pending: 'bg-amber-100 text-amber-700',
  paid: 'bg-green-100 text-green-700',
  waived: 'bg-gray-100 text-gray-600',
};

export default function AdminFees() {
  const [fees, setFees] = useState([]);
  const [summary, setSummary] = useState({ pending: { total: 0, count: 0 }, paid: { total: 0, count: 0 }, waived: { total: 0, count: 0 } });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [paidByFilter, setPaidByFilter] = useState('all');
  const [updating, setUpdating] = useState(null);

  const fetchFees = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (paidByFilter !== 'all') params.set('paidBy', paidByFilter);
      const { data } = await axios.get(`/api/admin/fees?${params}&limit=50`);
      setFees(data.fees);
      setSummary(data.summary);
    } catch { toast.error('Load failed'); }
    setLoading(false);
  };

  useEffect(() => { fetchFees(); }, [statusFilter, paidByFilter]);

  const handleStatus = async (fee, status) => {
    setUpdating(fee._id);
    try {
      const { data } = await axios.patch(`/api/admin/fees/${fee._id}/status`, { status, waivedReason: 'Admin waived' });
      setFees(f => f.map(x => x._id === fee._id ? data.fee : x));
      toast.success(status === 'paid' ? 'Paid mark ho gaya!' : 'Waived!');
      // refresh summary
      fetchFees();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    setUpdating(null);
  };

  const summaryCards = [
    { label: 'Pending', key: 'pending', icon: Clock, color: 'bg-amber-50 border-amber-200 text-amber-800' },
    { label: 'Collected', key: 'paid', icon: CheckCircle, color: 'bg-green-50 border-green-200 text-green-800' },
    { label: 'Waived', key: 'waived', icon: XCircle, color: 'bg-gray-50 border-gray-200 text-gray-700' },
  ];

  return (
    <AdminLayout>
      <div className="mb-5 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BadgeIndianRupee className="w-6 h-6 text-orange-500" /> Platform Fees
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">Har order ka platform charge track karo</p>
        </div>
        <button onClick={fetchFees} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 border border-gray-200 px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4 mb-5">
        {summaryCards.map(s => (
          <div key={s.key} className={`rounded-2xl border p-4 ${s.color}`}>
            <div className="flex items-center gap-2 mb-2">
              <s.icon className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wide opacity-70">{s.label}</span>
            </div>
            <p className="text-2xl font-black">₹{(summary[s.key]?.total || 0).toLocaleString('en-IN')}</p>
            <p className="text-xs opacity-60 mt-0.5">{summary[s.key]?.count || 0} fees</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <div className="flex gap-1 items-center">
          <span className="text-xs font-medium text-gray-500">Status:</span>
          {[['all', 'All'], ['pending', 'Pending'], ['paid', 'Paid'], ['waived', 'Waived']].map(([val, label]) => (
            <button key={val} onClick={() => setStatusFilter(val)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                statusFilter === val ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}>{label}</button>
          ))}
        </div>
        <div className="flex gap-1 items-center ml-4">
          <span className="text-xs font-medium text-gray-500">Kaun dega:</span>
          {[['all', 'All'], ['supplier', 'Supplier'], ['customer', 'Customer']].map(([val, label]) => (
            <button key={val} onClick={() => setPaidByFilter(val)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                paidByFilter === val ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}>{label}</button>
          ))}
        </div>
      </div>

      {/* Fee Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="divide-y">{[...Array(5)].map((_, i) => <div key={i} className="h-16 animate-pulse bg-gray-50" />)}</div>
        ) : fees.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <BadgeIndianRupee className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p>Koi fee record nahi mila</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {fees.map(fee => (
              <div key={fee._id} className="px-5 py-4 flex items-center gap-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-mono text-sm font-bold text-gray-900">{fee.orderRef}</span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${STATUS_STYLE[fee.status]}`}>
                      {fee.status}
                    </span>
                    <span className="text-xs text-gray-400 capitalize">
                      {fee.paidBy === 'supplier' ? '🏗️ Supplier' : '👤 Customer'} — {fee.payerName}
                    </span>
                  </div>
                  {fee.note && <p className="text-xs text-gray-400 italic">{fee.note}</p>}
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(fee.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    {fee.paidAt && ` · Paid ${new Date(fee.paidAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-lg font-black text-gray-900">₹{fee.amount.toLocaleString('en-IN')}</p>
                </div>
                {fee.status === 'pending' && (
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => handleStatus(fee, 'paid')}
                      disabled={updating === fee._id}
                      className="flex items-center gap-1 text-xs bg-green-50 hover:bg-green-100 text-green-700 font-medium px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {updating === fee._id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
                      Mark Paid
                    </button>
                    <button
                      onClick={() => handleStatus(fee, 'waived')}
                      disabled={updating === fee._id}
                      className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 font-medium px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                    >
                      Waive
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
