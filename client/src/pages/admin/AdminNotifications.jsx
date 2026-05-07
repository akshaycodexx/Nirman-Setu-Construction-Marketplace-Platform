import { useEffect, useState } from 'react';
import axios from 'axios';
import AdminLayout from '../../components/AdminLayout';
import { MessageSquare, Mail, Phone, CheckCircle, XCircle, AlertCircle, Loader2, RefreshCw } from 'lucide-react';

const CHANNEL_CONFIG = {
  whatsapp: { label: 'WhatsApp', icon: MessageSquare, color: 'bg-green-900 text-green-300', dot: 'bg-green-400' },
  sms:      { label: 'SMS',      icon: Phone,         color: 'bg-blue-900 text-blue-300',   dot: 'bg-blue-400' },
  email:    { label: 'Email',    icon: Mail,           color: 'bg-purple-900 text-purple-300', dot: 'bg-purple-400' },
};

const STATUS_CONFIG = {
  sent:    { icon: CheckCircle,  color: 'text-green-400', label: 'Sent' },
  failed:  { icon: XCircle,     color: 'text-red-400',   label: 'Failed' },
  skipped: { icon: AlertCircle, color: 'text-yellow-400', label: 'Skipped' },
};

const EVENT_LABELS = {
  rfq_bid_received:     'RFQ — Bid Received',
  rfq_accepted:         'RFQ — Quote Accepted',
  rfq_counter:          'RFQ — Counter Offer',
  labour_bid_received:  'Labour — Bid Received',
  labour_accepted:      'Labour — Booking Confirmed',
  labour_counter:       'Labour — Counter Offer',
  payment_received:     'Payment Received',
  order_confirmed:      'Order Confirmed',
  order_dispatched:     'Order Dispatched',
  order_delivered:      'Order Delivered',
  order_cancelled:      'Order Cancelled',
};

function formatTime(date) {
  const d = new Date(date);
  const now = new Date();
  const diff = now - d;
  if (diff < 60000) return 'just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export default function AdminNotifications() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [channelFilter, setChannelFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);

  const token = localStorage.getItem('adminToken');
  const authHeader = { Authorization: `Bearer ${token}` };

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = { page };
      if (channelFilter) params.channel = channelFilter;
      if (statusFilter) params.status = statusFilter;
      const { data } = await axios.get('/api/admin/notification-log', { headers: authHeader, params });
      setLogs(data.logs || []);
      setTotal(data.total || 0);
      setPages(data.pages || 1);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLogs(); }, [channelFilter, statusFilter, page]);

  // Stats from current page
  const sentCount = logs.filter(l => l.status === 'sent').length;
  const failedCount = logs.filter(l => l.status === 'failed').length;
  const skippedCount = logs.filter(l => l.status === 'skipped').length;

  const waCount = logs.filter(l => l.channel === 'whatsapp').length;
  const smsCount = logs.filter(l => l.channel === 'sms').length;
  const emailCount = logs.filter(l => l.channel === 'email').length;

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">Notification Log</h1>
            <p className="text-gray-400 text-sm">WhatsApp · SMS · Email — sab channels ka record</p>
          </div>
          <button onClick={fetchLogs}
            className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-gray-200 px-3 py-2 rounded-xl text-sm font-medium transition-colors">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: 'Total', value: total, color: 'text-white' },
            { label: 'Sent', value: sentCount, color: 'text-green-400' },
            { label: 'Failed', value: failedCount, color: 'text-red-400' },
            { label: 'WhatsApp', value: waCount, color: 'text-green-300' },
            { label: 'SMS', value: smsCount, color: 'text-blue-300' },
            { label: 'Email', value: emailCount, color: 'text-purple-300' },
          ].map(s => (
            <div key={s.label} className="bg-gray-800 rounded-xl p-3 border border-gray-700 text-center">
              <p className="text-gray-400 text-xs mb-1">{s.label}</p>
              <p className={`text-xl font-black ${s.color}`}>{loading ? '—' : s.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap">
          <div className="flex gap-1">
            {['', 'whatsapp', 'sms', 'email'].map(c => (
              <button key={c}
                onClick={() => { setChannelFilter(c); setPage(1); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                  channelFilter === c ? 'bg-blue-500 text-white' : 'bg-gray-800 text-gray-400 border border-gray-700 hover:border-gray-500'
                }`}>
                {c || 'All Channels'}
              </button>
            ))}
          </div>
          <div className="flex gap-1">
            {['', 'sent', 'failed', 'skipped'].map(s => (
              <button key={s}
                onClick={() => { setStatusFilter(s); setPage(1); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                  statusFilter === s ? 'bg-blue-500 text-white' : 'bg-gray-800 text-gray-400 border border-gray-700 hover:border-gray-500'
                }`}>
                {s || 'All Status'}
              </button>
            ))}
          </div>
        </div>

        {/* Log table */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
          </div>
        ) : logs.length === 0 ? (
          <div className="bg-gray-800 rounded-2xl border border-gray-700 py-16 text-center">
            <MessageSquare className="w-10 h-10 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">Koi notifications log nahi mila</p>
            <p className="text-gray-500 text-sm mt-1">Jab koi quote/payment/order event hoga, yahan dikhega</p>
          </div>
        ) : (
          <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left px-4 py-3 text-gray-400 font-medium text-xs">Time</th>
                    <th className="text-left px-4 py-3 text-gray-400 font-medium text-xs">Channel</th>
                    <th className="text-left px-4 py-3 text-gray-400 font-medium text-xs">Event</th>
                    <th className="text-left px-4 py-3 text-gray-400 font-medium text-xs">Recipient</th>
                    <th className="text-left px-4 py-3 text-gray-400 font-medium text-xs">Status</th>
                    <th className="text-left px-4 py-3 text-gray-400 font-medium text-xs">Error</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {logs.map(log => {
                    const ch = CHANNEL_CONFIG[log.channel] || CHANNEL_CONFIG.email;
                    const st = STATUS_CONFIG[log.status] || STATUS_CONFIG.sent;
                    const ChIcon = ch.icon;
                    const StIcon = st.icon;
                    return (
                      <tr key={log._id} className="hover:bg-gray-750">
                        <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                          {formatTime(log.createdAt)}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${ch.color}`}>
                            <ChIcon className="w-3 h-3" /> {ch.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-300 text-xs">
                          {EVENT_LABELS[log.event] || log.event}
                        </td>
                        <td className="px-4 py-3 text-gray-400 text-xs font-mono truncate max-w-32">
                          {log.recipient}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 text-xs font-semibold ${st.color}`}>
                            <StIcon className="w-3 h-3" /> {st.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-red-400 text-xs truncate max-w-40">
                          {log.status === 'failed' ? (log.error || log.meta?.error || '—') : '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex justify-center gap-2">
            {Array.from({ length: Math.min(pages, 10) }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)}
                className={`w-8 h-8 rounded-lg text-sm font-semibold ${
                  page === p ? 'bg-blue-500 text-white' : 'bg-gray-800 text-gray-400 border border-gray-700 hover:border-gray-500'
                }`}>
                {p}
              </button>
            ))}
          </div>
        )}

        {/* Setup Guide */}
        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-5">
          <h3 className="text-white font-semibold mb-3 text-sm">Notification Channels Setup</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-green-900 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                <MessageSquare className="w-3.5 h-3.5 text-green-400" />
              </div>
              <div>
                <p className="text-gray-200 text-sm font-medium">WhatsApp Business API</p>
                <p className="text-gray-400 text-xs mt-0.5">
                  <span className="font-mono bg-gray-700 px-1 rounded">WHATSAPP_TOKEN</span> aur{' '}
                  <span className="font-mono bg-gray-700 px-1 rounded">WHATSAPP_PHONE_NUMBER_ID</span> .env mein set karo.
                  Meta Business Manager par templates approve karwao.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-900 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                <Phone className="w-3.5 h-3.5 text-blue-400" />
              </div>
              <div>
                <p className="text-gray-200 text-sm font-medium">SMS — Fast2SMS</p>
                <p className="text-gray-400 text-xs mt-0.5">
                  fast2sms.com par register karo → API → Dev API key copy karo →{' '}
                  <span className="font-mono bg-gray-700 px-1 rounded">FAST2SMS_API_KEY</span> .env mein daalo.
                  India mein instant delivery, koi template approval nahi chahiye.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-purple-900 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                <Mail className="w-3.5 h-3.5 text-purple-400" />
              </div>
              <div>
                <p className="text-gray-200 text-sm font-medium">Email — Gmail SMTP</p>
                <p className="text-gray-400 text-xs mt-0.5">
                  Gmail → Security → 2FA ON → App Passwords → 16-char password copy karo →{' '}
                  <span className="font-mono bg-gray-700 px-1 rounded">EMAIL_PASS</span> .env mein daalo.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
