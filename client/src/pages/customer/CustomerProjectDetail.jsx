import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useCustomer } from '../../context/CustomerContext';
import CustomerLayout, { StatusBadge } from '../../components/CustomerLayout';
import {
  ArrowLeft, Package, Hammer, IndianRupee, MapPin, Plus, X, Loader2,
  CheckCircle, Trash2, Edit3, Save, FolderOpen, TrendingUp, AlertCircle,
  HardHat, Zap, Wrench, Paintbrush, Scissors, Layers, MoreHorizontal
} from 'lucide-react';

const JOB_ICONS = {
  mason: HardHat, carpenter: Hammer, electrician: Zap,
  plumber: Wrench, painter: Paintbrush, welder: Scissors,
  tiles: Layers, other: MoreHorizontal,
};

const JOB_LABELS = {
  mason: 'Raj Mistri', carpenter: 'Badhai', electrician: 'Bijli Wala',
  plumber: 'Nali Wala', painter: 'Rang Wala', welder: 'Welder',
  tiles: 'Tiles Wala', other: 'Other',
};

const STATUS_LABEL = { active: 'Active', paused: 'Paused', completed: 'Completed' };
const STATUS_COLOR = { active: 'bg-green-100 text-green-700', paused: 'bg-yellow-100 text-yellow-700', completed: 'bg-blue-100 text-blue-700' };

// ─── Link Order Modal ─────────────────────────────────────────────────────────

function LinkOrderModal({ projectId, linkedIds, onClose, onLinked }) {
  const { authHeader } = useCustomer();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [linking, setLinking] = useState(null);

  useEffect(() => {
    axios.get('/api/customer/orders', { headers: authHeader() })
      .then(r => setOrders((Array.isArray(r.data) ? r.data : []).filter(o => !linkedIds.includes(o.orderId))))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleLink = async (orderId) => {
    setLinking(orderId);
    try {
      await axios.post(`/api/projects/${projectId}/link-order`, { orderId }, { headers: authHeader() });
      toast.success('Order linked!');
      onLinked(orderId);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setLinking(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50">
      <div className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl overflow-y-auto max-h-[75vh]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 sticky top-0 bg-white">
          <h2 className="font-bold text-gray-900">Order Link Karo</h2>
          <button onClick={onClose}><X className="w-4 h-4 text-gray-400" /></button>
        </div>
        <div className="p-4 space-y-2">
          {loading ? <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-gray-400" /></div>
            : orders.length === 0 ? (
              <p className="text-center text-gray-400 py-8 text-sm">Koi unlinkable order nahi</p>
            ) : (
              orders.map(o => (
                <div key={o.orderId} className="flex items-center justify-between border border-gray-100 rounded-xl p-3">
                  <div>
                    <p className="font-mono font-bold text-gray-900 text-sm">{o.orderId}</p>
                    <p className="text-xs text-gray-500 capitalize mt-0.5">{o.category?.replace('_', ' ')} · <StatusBadge status={o.status} /></p>
                  </div>
                  <button onClick={() => handleLink(o.orderId)} disabled={linking === o.orderId}
                    className="flex items-center gap-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-200 text-white text-xs font-semibold px-3 py-1.5 rounded-lg">
                    {linking === o.orderId ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />} Link
                  </button>
                </div>
              ))
            )}
        </div>
      </div>
    </div>
  );
}

// ─── Link Labour Modal ────────────────────────────────────────────────────────

function LinkLabourModal({ projectId, linkedIds, onClose, onLinked }) {
  const { authHeader } = useCustomer();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [linking, setLinking] = useState(null);

  useEffect(() => {
    axios.get('/api/labour/my-requests', { headers: authHeader() })
      .then(r => setRequests((r.data.requests || []).filter(req => !linkedIds.includes(req.requestId))))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleLink = async (requestId) => {
    setLinking(requestId);
    try {
      await axios.post(`/api/projects/${projectId}/link-labour`, { requestId }, { headers: authHeader() });
      toast.success('Labour request linked!');
      onLinked(requestId);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setLinking(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50">
      <div className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl overflow-y-auto max-h-[75vh]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 sticky top-0 bg-white">
          <h2 className="font-bold text-gray-900">Karigar Request Link Karo</h2>
          <button onClick={onClose}><X className="w-4 h-4 text-gray-400" /></button>
        </div>
        <div className="p-4 space-y-2">
          {loading ? <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-gray-400" /></div>
            : requests.length === 0 ? (
              <p className="text-center text-gray-400 py-8 text-sm">Koi unlinkable karigar request nahi</p>
            ) : (
              requests.map(req => {
                const Icon = JOB_ICONS[req.jobType] || Hammer;
                return (
                  <div key={req.requestId} className="flex items-center justify-between border border-gray-100 rounded-xl p-3">
                    <div>
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <Icon className="w-3.5 h-3.5 text-amber-500" />
                        <p className="font-semibold text-gray-900 text-sm">{req.jobTitle}</p>
                      </div>
                      <p className="text-xs text-gray-500">{JOB_LABELS[req.jobType] || req.jobType} · {req.city} · <span className="capitalize">{req.status}</span></p>
                    </div>
                    <button onClick={() => handleLink(req.requestId)} disabled={linking === req.requestId}
                      className="flex items-center gap-1 bg-amber-500 hover:bg-amber-600 disabled:bg-gray-200 text-white text-xs font-semibold px-3 py-1.5 rounded-lg">
                      {linking === req.requestId ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />} Link
                    </button>
                  </div>
                );
              })
            )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function CustomerProjectDetail() {
  const { projectId } = useParams();
  const { authHeader } = useCustomer();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLinkOrder, setShowLinkOrder] = useState(false);
  const [showLinkLabour, setShowLinkLabour] = useState(false);
  const [editingStatus, setEditingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [unlinking, setUnlinking] = useState(null);

  const fetchData = async () => {
    try {
      const { data: d } = await axios.get(`/api/projects/${projectId}`, { headers: authHeader() });
      setData(d);
      setNewStatus(d.project.status);
    } catch {
      toast.error('Project nahi mila');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [projectId]);

  const handleStatusUpdate = async () => {
    try {
      await axios.put(`/api/projects/${projectId}`, { status: newStatus }, { headers: authHeader() });
      setData(prev => ({ ...prev, project: { ...prev.project, status: newStatus } }));
      setEditingStatus(false);
      toast.success('Status update ho gaya');
    } catch { toast.error('Update failed'); }
  };

  const handleUnlinkOrder = async (orderId) => {
    setUnlinking(orderId);
    try {
      await axios.delete(`/api/projects/${projectId}/unlink-order`, { data: { orderId }, headers: authHeader() });
      toast.success('Order unlinked');
      fetchData();
    } catch { toast.error('Failed'); }
    finally { setUnlinking(null); }
  };

  const handleUnlinkLabour = async (requestId) => {
    setUnlinking(requestId);
    try {
      await axios.delete(`/api/projects/${projectId}/unlink-labour`, { data: { requestId }, headers: authHeader() });
      toast.success('Labour request unlinked');
      fetchData();
    } catch { toast.error('Failed'); }
    finally { setUnlinking(null); }
  };

  if (loading) return <CustomerLayout><div className="flex items-center justify-center py-24"><Loader2 className="w-6 h-6 text-gray-400 animate-spin" /></div></CustomerLayout>;
  if (!data) return <CustomerLayout><div className="text-center py-24"><AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" /><p className="text-gray-600">Project nahi mila</p><Link to="/customer/projects" className="text-blue-500 text-sm mt-2 block">← Projects par wapas jao</Link></div></CustomerLayout>;

  const { project, orders, labourRequests, summary } = data;
  const budgetPct = project.estimatedBudget ? Math.min(100, Math.round((summary.totalQuoted / project.estimatedBudget) * 100)) : null;
  const linkedOrderIds = project.linkedOrders.map(lo => lo.orderId);
  const linkedLabourIds = project.linkedLabour.map(ll => ll.requestId);

  return (
    <CustomerLayout>
      <div className="max-w-2xl mx-auto space-y-5">

        {/* Header */}
        <div className="flex items-center gap-3">
          <Link to="/customer/projects" className="p-1.5 rounded-lg hover:bg-gray-200">
            <ArrowLeft className="w-4 h-4 text-gray-600" />
          </Link>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-gray-900 truncate">{project.name}</h1>
              {editingStatus ? (
                <div className="flex items-center gap-1">
                  <select value={newStatus} onChange={e => setNewStatus(e.target.value)}
                    className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none">
                    <option value="active">Active</option>
                    <option value="paused">Paused</option>
                    <option value="completed">Completed</option>
                  </select>
                  <button onClick={handleStatusUpdate} className="p-1 bg-blue-500 text-white rounded-lg"><Save className="w-3 h-3" /></button>
                  <button onClick={() => setEditingStatus(false)} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-3 h-3 text-gray-400" /></button>
                </div>
              ) : (
                <button onClick={() => setEditingStatus(true)}
                  className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLOR[project.status]}`}>
                  {STATUS_LABEL[project.status]}
                  <Edit3 className="w-2.5 h-2.5" />
                </button>
              )}
            </div>
            {(project.city || project.address) && (
              <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3" />
                {project.city}{project.city && project.address ? ', ' : ''}{project.address}
              </p>
            )}
          </div>
        </div>

        {/* Budget Summary */}
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-2xl p-5 text-white">
          <div className="flex items-center justify-between mb-3">
            <p className="text-indigo-100 text-sm">Total Budget Overview</p>
            <TrendingUp className="w-4 h-4 text-indigo-200" />
          </div>
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div>
              <p className="text-indigo-200 text-xs">Quoted Value</p>
              <p className="text-xl font-black">₹{summary.totalQuoted?.toLocaleString('en-IN') || '0'}</p>
            </div>
            <div>
              <p className="text-indigo-200 text-xs">Paid Out</p>
              <p className="text-xl font-black">₹{summary.totalSpent?.toLocaleString('en-IN') || '0'}</p>
            </div>
            <div>
              <p className="text-indigo-200 text-xs">Karigar Total</p>
              <p className="text-xl font-black">₹{summary.labourTotal?.toLocaleString('en-IN') || '0'}</p>
            </div>
          </div>
          {project.estimatedBudget && (
            <>
              <div className="flex items-center justify-between text-xs text-indigo-200 mb-1">
                <span>Budget used</span>
                <span>₹{summary.totalQuoted?.toLocaleString('en-IN')} / ₹{project.estimatedBudget?.toLocaleString('en-IN')} ({budgetPct}%)</span>
              </div>
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${budgetPct > 90 ? 'bg-red-400' : budgetPct > 70 ? 'bg-yellow-300' : 'bg-green-400'}`}
                  style={{ width: `${budgetPct}%` }}
                />
              </div>
            </>
          )}
        </div>

        {/* Orders Section */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <Package className="w-4 h-4 text-blue-500" /> Material Orders
              <span className="text-xs font-semibold bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">{orders.length}</span>
            </h2>
            <button onClick={() => setShowLinkOrder(true)}
              className="flex items-center gap-1 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors">
              <Plus className="w-3 h-3" /> Link Order
            </button>
          </div>
          {orders.length === 0 ? (
            <div className="py-10 text-center">
              <Package className="w-8 h-8 text-gray-200 mx-auto mb-2" />
              <p className="text-gray-400 text-sm">Koi order linked nahi</p>
              <button onClick={() => setShowLinkOrder(true)}
                className="mt-2 text-xs text-blue-500 font-medium hover:underline">+ Order link karo</button>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {orders.map(o => (
                <div key={o.orderId} className="flex items-center justify-between px-5 py-3.5">
                  <Link to={`/customer/orders/${o.orderId}`} className="flex-1 min-w-0 group">
                    <p className="font-mono font-bold text-gray-900 text-sm group-hover:text-blue-600 transition-colors">{o.orderId}</p>
                    <p className="text-xs text-gray-500 capitalize mt-0.5">
                      {o.category?.replace('_', ' ')}
                      {o.quote?.amount && <span className="ml-1 text-gray-400">· ₹{o.quote.amount.toLocaleString('en-IN')}</span>}
                    </p>
                  </Link>
                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    <StatusBadge status={o.status} />
                    <button onClick={() => handleUnlinkOrder(o.orderId)} disabled={unlinking === o.orderId}
                      className="p-1 text-gray-300 hover:text-red-400 transition-colors">
                      {unlinking === o.orderId ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Labour Section */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <Hammer className="w-4 h-4 text-amber-500" /> Karigar Bookings
              <span className="text-xs font-semibold bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full">{labourRequests.length}</span>
            </h2>
            <button onClick={() => setShowLinkLabour(true)}
              className="flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-lg transition-colors">
              <Plus className="w-3 h-3" /> Link Karigar
            </button>
          </div>
          {labourRequests.length === 0 ? (
            <div className="py-10 text-center">
              <Hammer className="w-8 h-8 text-gray-200 mx-auto mb-2" />
              <p className="text-gray-400 text-sm">Koi karigar request linked nahi</p>
              <button onClick={() => setShowLinkLabour(true)}
                className="mt-2 text-xs text-amber-500 font-medium hover:underline">+ Karigar link karo</button>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {labourRequests.map(l => {
                const Icon = JOB_ICONS[l.jobType] || Hammer;
                const acceptedQuote = l.quotes?.find(q => q.status === 'accepted');
                return (
                  <div key={l.requestId} className="flex items-center justify-between px-5 py-3.5">
                    <Link to="/customer/labour" className="flex-1 min-w-0 group">
                      <div className="flex items-center gap-1.5">
                        <Icon className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <p className="font-semibold text-gray-900 text-sm group-hover:text-amber-600 transition-colors truncate">{l.jobTitle}</p>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {JOB_LABELS[l.jobType] || l.jobType} · {l.city}
                        {acceptedQuote && <span className="ml-1 text-gray-400">· ₹{acceptedQuote.currentRate?.toLocaleString('en-IN')}</span>}
                      </p>
                    </Link>
                    <div className="flex items-center gap-2 shrink-0 ml-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${
                        l.status === 'accepted' ? 'bg-green-100 text-green-700'
                          : l.status === 'open' ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}>{l.status}</span>
                      <button onClick={() => handleUnlinkLabour(l.requestId)} disabled={unlinking === l.requestId}
                        className="p-1 text-gray-300 hover:text-red-400 transition-colors">
                        {unlinking === l.requestId ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Notes */}
        {project.description && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-1">Project Notes</h2>
            <p className="text-gray-600 text-sm">{project.description}</p>
          </div>
        )}
      </div>

      {showLinkOrder && (
        <LinkOrderModal
          projectId={projectId}
          linkedIds={linkedOrderIds}
          onClose={() => setShowLinkOrder(false)}
          onLinked={() => fetchData()}
        />
      )}
      {showLinkLabour && (
        <LinkLabourModal
          projectId={projectId}
          linkedIds={linkedLabourIds}
          onClose={() => setShowLinkLabour(false)}
          onLinked={() => fetchData()}
        />
      )}
    </CustomerLayout>
  );
}
