import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useCustomer } from '../../context/CustomerContext';
import CustomerLayout from '../../components/CustomerLayout';
import { Bell, Package, IndianRupee, CheckCircle, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import useT from '../../i18n/useT';

const TYPE_CONFIG_BASE = {
  quote:     { icon: Package,      bg: 'bg-blue-100',   color: 'text-blue-600',   labelKey: 'notif.quote' },
  payment:   { icon: IndianRupee,  bg: 'bg-green-100',  color: 'text-green-600',  labelKey: 'notif.payment' },
  complaint: { icon: CheckCircle,  bg: 'bg-purple-100', color: 'text-purple-600', labelKey: 'notif.complaint' },
  status:    { icon: AlertCircle,  bg: 'bg-orange-100', color: 'text-orange-600', labelKey: 'notif.statusUpdate' },
};

export default function CustomerNotifications() {
  const { authHeader } = useCustomer();
  const t = useT();
  const TYPE_CONFIG = Object.fromEntries(
    Object.entries(TYPE_CONFIG_BASE).map(([k, v]) => [k, { ...v, label: t(v.labelKey) }])
  );
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/customer/notifications', { headers: authHeader() })
      .then(r => setNotifs(r.data.notifications || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <CustomerLayout>
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-blue-500" />
          <h1 className="text-xl font-bold text-gray-900">{t('notif.title')}</h1>
          <span className="text-xs text-gray-400 ml-1">{t('notif.last48h')}</span>
        </div>

        {loading ? (
          <div className="py-16 text-center">
            <Loader2 className="w-6 h-6 text-gray-400 animate-spin mx-auto" />
          </div>
        ) : notifs.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 py-16 text-center">
            <Bell className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 text-sm font-medium">{t('notif.empty')}</p>
            <p className="text-gray-400 text-xs mt-1">{t('notif.emptySub')}</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden divide-y divide-gray-50">
            {notifs.map(n => {
              const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG.status;
              const Icon = cfg.icon;
              return (
                <Link key={n._id} to={`/customer/orders/${n.orderId}`}
                  className="flex items-start gap-4 px-5 py-4 hover:bg-gray-50 transition-colors group">
                  <div className={`w-9 h-9 ${cfg.bg} rounded-full flex items-center justify-center shrink-0 mt-0.5`}>
                    <Icon className={`w-4 h-4 ${cfg.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{cfg.label}</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-900">
                      {t('notif.order', { id: n.orderId, status: n.status?.replace('_', ' ') })}
                    </p>
                    {n.note && <p className="text-xs text-gray-500 mt-0.5 truncate">{n.note}</p>}
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(n.at).toLocaleString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-blue-400 shrink-0 mt-2" />
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </CustomerLayout>
  );
}
