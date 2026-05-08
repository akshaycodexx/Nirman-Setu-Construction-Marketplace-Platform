import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import AdminLayout from '../../components/AdminLayout';
import { Users, Search, ShieldAlert, ShieldCheck, ShieldX, ToggleLeft, ToggleRight, Package, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import useT from '../../i18n/useT';

const RISK_CONFIG = {
  green:  { label: 'Trusted',   cls: 'bg-green-100 text-green-700',  icon: ShieldCheck },
  yellow: { label: 'Caution',   cls: 'bg-yellow-100 text-yellow-700', icon: ShieldAlert },
  red:    { label: 'High Risk', cls: 'bg-red-100 text-red-700',      icon: ShieldX },
};

const RISK_BORDER = {
  green:  '',
  yellow: 'border-l-4 border-l-yellow-400',
  red:    'border-l-4 border-l-red-500',
};

export default function AdminCustomers() {
  const t = useT();
  const [customers, setCustomers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('all');
  const [page, setPage] = useState(1);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams();
      if (search) q.set('search', search);
      if (riskFilter !== 'all') q.set('risk', riskFilter);
      q.set('page', page);
      q.set('limit', 20);
      const { data } = await axios.get(`/api/admin/customers?${q}`);
      setCustomers(data.customers);
      setTotal(data.total);
    } catch { toast.error(t('admin.customers.loadFailed')); }
    setLoading(false);
  }, [search, riskFilter, page]);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  const handleBlock = async (id, isActive) => {
    try {
      const { data } = await axios.put(`/api/admin/customers/${id}/block`, { isActive });
      setCustomers(prev => prev.map(c => c._id === id ? { ...c, isActive: data.customer.isActive } : c));
      toast.success(isActive ? t('admin.customers.unblocked') : t('admin.customers.blocked'));
    } catch { toast.error(t('admin.common.actionFailed')); }
  };

  return (
    <AdminLayout>
      <div className="mb-5 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-orange-500" /> {t('admin.nav.customers')}
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">{t('admin.customers.registered', { n: total })}</p>
        </div>
        <button onClick={fetchCustomers} className="text-gray-500 hover:text-gray-800 p-2 rounded-lg hover:bg-gray-100">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && fetchCustomers()}
            placeholder={t('admin.customers.searchPh')}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs font-medium text-gray-500 flex items-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5" /> {t('admin.common.risk')}:
          </span>
          {['all', 'green', 'yellow', 'red'].map(r => (
            <button
              key={r}
              onClick={() => { setRiskFilter(r); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                riskFilter === r
                  ? r === 'all' ? 'bg-gray-900 text-white'
                    : r === 'green' ? 'bg-green-600 text-white'
                    : r === 'yellow' ? 'bg-yellow-500 text-white'
                    : 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {r === 'all' ? t('admin.common.all') : t(`admin.risk.${r}`)}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="divide-y">{[...Array(8)].map((_, i) => <div key={i} className="h-20 animate-pulse bg-gray-50 border-b border-gray-100" />)}</div>
        ) : customers.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p>{t('admin.customers.empty')}</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {customers.map(c => {
              const risk = RISK_CONFIG[c.riskLevel] || RISK_CONFIG.green;
              const RiskIcon = risk.icon;
              return (
                <div key={c._id} className={`px-5 py-4 ${RISK_BORDER[c.riskLevel] || ''}`}>
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-semibold text-gray-900">{c.name}</span>
                        <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${risk.cls}`}>
                          <RiskIcon className="w-3 h-3" /> {t(`admin.risk.${c.riskLevel || 'green'}`)}
                        </span>
                        {!c.isActive && (
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-200 text-gray-600">{t('admin.customers.blockedLabel')}</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">{c.phone}{c.email && ` · ${c.email}`}</p>

                      {/* Stats row */}
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Package className="w-3.5 h-3.5 text-gray-400" />
                          <span>{t('admin.common.ordersCount', { n: c.orderStats?.total ?? 0 })}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-green-600">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>{t('admin.common.deliveredCount', { n: c.orderStats?.delivered ?? 0 })}</span>
                        </div>
                        {c.cancelCount > 0 && (
                          <div className="flex items-center gap-1 text-xs text-red-500">
                            <XCircle className="w-3.5 h-3.5" />
                            <span>{t('admin.common.cancelledCount', { n: c.cancelCount })}</span>
                          </div>
                        )}
                        <span className="text-xs text-gray-400">
                          {t('admin.common.joined')} {new Date(c.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>

                      {/* Risk warning */}
                      {c.riskLevel === 'red' && (
                        <p className="mt-1.5 text-xs text-red-600 bg-red-50 rounded-lg px-2 py-1 inline-block">
                          Is customer ne {c.cancelCount} baar cancel kiya — orders manually verify karo
                        </p>
                      )}
                      {c.riskLevel === 'yellow' && (
                        <p className="mt-1.5 text-xs text-yellow-700 bg-yellow-50 rounded-lg px-2 py-1 inline-block">
                          {c.cancelCount} cancellations — dhyan se handle karo
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => handleBlock(c._id, !c.isActive)}
                      className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-xl border transition-colors ${
                        c.isActive
                          ? 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200'
                          : 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100'
                      }`}
                    >
                      {c.isActive
                        ? <><ToggleRight className="w-4 h-4" /> {t('admin.customers.block')}</>
                        : <><ToggleLeft className="w-4 h-4" /> {t('admin.customers.unblock')}</>}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pagination */}
      {total > 20 && (
        <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
          <span>{t('admin.common.pageOf', { page, total: Math.ceil(total / 20) })}</span>
          <div className="flex gap-2">
            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
              className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 disabled:opacity-40 hover:bg-gray-50">{t('admin.common.prev')}</button>
            <button disabled={page >= Math.ceil(total / 20)} onClick={() => setPage(p => p + 1)}
              className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 disabled:opacity-40 hover:bg-gray-50">{t('common.next')}</button>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
