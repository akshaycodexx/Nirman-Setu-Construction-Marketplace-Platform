import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useCustomer } from '../../context/CustomerContext';
import CustomerLayout from '../../components/CustomerLayout';
import {
  FolderOpen, Plus, X, Loader2, MapPin, IndianRupee,
  Package, Hammer, ArrowRight, CheckCircle, Pause, Archive,
  MoreVertical, Trash2, Edit3
} from 'lucide-react';

const STATUS_CONFIG = {
  active:    { label: 'Active',     color: 'bg-green-100 text-green-700',  icon: CheckCircle },
  paused:    { label: 'Paused',     color: 'bg-yellow-100 text-yellow-700', icon: Pause },
  completed: { label: 'Completed',  color: 'bg-blue-100 text-blue-700',    icon: Archive },
};

function CreateProjectModal({ onClose, onCreated }) {
  const { authHeader } = useCustomer();
  const [form, setForm] = useState({ name: '', description: '', city: '', address: '', estimatedBudget: '' });
  const [submitting, setSubmitting] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Project ka naam daalo'); return; }
    setSubmitting(true);
    try {
      const { data } = await axios.post('/api/projects', {
        ...form,
        estimatedBudget: form.estimatedBudget ? Number(form.estimatedBudget) : undefined,
      }, { headers: authHeader() });
      toast.success('Project create ho gaya!');
      onCreated(data.project);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50">
      <div className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl overflow-y-auto max-h-[85vh]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 sticky top-0 bg-white">
          <h2 className="font-bold text-gray-900">Naya Project Banao</h2>
          <button onClick={onClose}><X className="w-4 h-4 text-gray-400" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Project Name *</label>
            <input value={form.name} onChange={e => set('name', e.target.value)}
              placeholder="e.g. Ghar ka Nirman 2025, Factory Extension..."
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Description</label>
            <textarea value={form.description} onChange={e => set('description', e.target.value)}
              placeholder="Project ki thodi detail batao..."
              rows={2}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">City</label>
              <input value={form.city} onChange={e => set('city', e.target.value)}
                placeholder="Patna..."
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Budget (₹)</label>
              <input type="number" value={form.estimatedBudget} onChange={e => set('estimatedBudget', e.target.value)}
                placeholder="Total estimate"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Site Address</label>
            <input value={form.address} onChange={e => set('address', e.target.value)}
              placeholder="Construction site ka address"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>
          <button type="submit" disabled={submitting}
            className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white font-semibold py-3 rounded-xl text-sm">
            {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</> : <><Plus className="w-4 h-4" /> Create Project</>}
          </button>
        </form>
      </div>
    </div>
  );
}

function ProjectCard({ project, onDelete }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const st = STATUS_CONFIG[project.status] || STATUS_CONFIG.active;
  const StIcon = st.icon;

  const budgetUsed = project._totalQuoted || 0;
  const budgetPct = project.estimatedBudget ? Math.min(100, Math.round((budgetUsed / project.estimatedBudget) * 100)) : null;

  return (
    <Link to={`/customer/projects/${project.projectId}`}
      className="block bg-white rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all p-5">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${st.color}`}>
              <StIcon className="w-3 h-3" /> {st.label}
            </span>
          </div>
          <h3 className="font-bold text-gray-900 truncate">{project.name}</h3>
          {(project.city || project.address) && (
            <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
              <MapPin className="w-3 h-3 shrink-0" />
              <span className="truncate">{project.city}{project.city && project.address ? ', ' : ''}{project.address}</span>
            </p>
          )}
        </div>
        <div className="relative shrink-0" onClick={e => e.preventDefault()}>
          <button onClick={() => setMenuOpen(o => !o)}
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
            <MoreVertical className="w-4 h-4" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-8 bg-white border border-gray-100 rounded-xl shadow-lg z-10 w-36 overflow-hidden">
              <button onClick={() => { onDelete(project.projectId); setMenuOpen(false); }}
                className="flex items-center gap-2 w-full px-3 py-2.5 text-sm text-red-600 hover:bg-red-50">
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="bg-gray-50 rounded-xl p-2.5 text-center">
          <Package className="w-3.5 h-3.5 text-blue-400 mx-auto mb-0.5" />
          <p className="text-lg font-black text-gray-900">{project._ordersCount || 0}</p>
          <p className="text-[10px] text-gray-400">Orders</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-2.5 text-center">
          <Hammer className="w-3.5 h-3.5 text-amber-400 mx-auto mb-0.5" />
          <p className="text-lg font-black text-gray-900">{project._labourCount || 0}</p>
          <p className="text-[10px] text-gray-400">Karigar</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-2.5 text-center">
          <IndianRupee className="w-3.5 h-3.5 text-green-400 mx-auto mb-0.5" />
          <p className="text-sm font-black text-gray-900">
            {project._totalSpent ? `₹${(project._totalSpent / 1000).toFixed(0)}k` : '₹0'}
          </p>
          <p className="text-[10px] text-gray-400">Paid</p>
        </div>
      </div>

      {/* Budget bar */}
      {project.estimatedBudget && (
        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-gray-500">Budget used</span>
            <span className="font-semibold text-gray-700">
              ₹{budgetUsed.toLocaleString('en-IN')} / ₹{project.estimatedBudget.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${budgetPct > 90 ? 'bg-red-400' : budgetPct > 70 ? 'bg-yellow-400' : 'bg-green-400'}`}
              style={{ width: `${budgetPct}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-0.5 text-right">{budgetPct}% used</p>
        </div>
      )}

      <div className="flex items-center justify-end mt-2 text-xs text-blue-500 font-semibold">
        Details dekho <ArrowRight className="w-3 h-3 ml-1" />
      </div>
    </Link>
  );
}

export default function CustomerProjects() {
  const { authHeader } = useCustomer();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  const fetchProjects = async () => {
    try {
      const { data } = await axios.get('/api/projects', { headers: authHeader() });
      setProjects(data.projects || []);
    } catch {
      toast.error('Load nahi ho saka');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProjects(); }, []);

  const handleDelete = async (projectId) => {
    if (!window.confirm('Ye project delete karoge? Orders/karigar unlink ho jayenge (delete nahi honge).')) return;
    try {
      await axios.delete(`/api/projects/${projectId}`, { headers: authHeader() });
      setProjects(prev => prev.filter(p => p.projectId !== projectId));
      toast.success('Project delete ho gaya');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  const activeCount = projects.filter(p => p.status === 'active').length;
  const totalBudget = projects.reduce((s, p) => s + (p.estimatedBudget || 0), 0);
  const totalSpent = projects.reduce((s, p) => s + (p._totalSpent || 0), 0);

  return (
    <CustomerLayout>
      <div className="max-w-2xl mx-auto space-y-5">

        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-2xl p-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">My Projects</h1>
              <p className="text-indigo-100 text-sm mt-0.5">Sab orders aur karigar ek project mein track karo</p>
            </div>
            <button onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 bg-white text-indigo-600 font-semibold text-sm px-4 py-2 rounded-xl hover:bg-indigo-50 transition-colors shrink-0">
              <Plus className="w-4 h-4" /> New Project
            </button>
          </div>
          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="bg-white/20 rounded-xl p-3 text-center">
              <p className="text-2xl font-black">{projects.length}</p>
              <p className="text-xs text-indigo-100">Total</p>
            </div>
            <div className="bg-white/20 rounded-xl p-3 text-center">
              <p className="text-2xl font-black">{activeCount}</p>
              <p className="text-xs text-indigo-100">Active</p>
            </div>
            <div className="bg-white/20 rounded-xl p-3 text-center">
              <p className="text-lg font-black">{totalSpent ? `₹${(totalSpent / 1000).toFixed(0)}k` : '₹0'}</p>
              <p className="text-xs text-indigo-100">Paid Out</p>
            </div>
          </div>
        </div>

        {/* How it works */}
        <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4">
          <p className="text-xs font-bold text-indigo-800 mb-2">Project Tracker Kaise Use Karein?</p>
          <div className="grid grid-cols-3 gap-3">
            {[
              { step: '1', text: 'Project banao — naam, city, budget daalo' },
              { step: '2', text: 'Apne orders aur karigar bookings link karo' },
              { step: '3', text: 'Total budget, spending, progress sab ek jagah dekho' },
            ].map(s => (
              <div key={s.step} className="text-center">
                <div className="w-7 h-7 bg-indigo-500 text-white rounded-full flex items-center justify-center text-xs font-bold mx-auto mb-1">{s.step}</div>
                <p className="text-xs text-indigo-700">{s.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Projects list */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
          </div>
        ) : projects.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 py-16 text-center">
            <FolderOpen className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">Koi project nahi abhi</p>
            <p className="text-gray-400 text-sm mt-1">Pehla project banao — ghar, dukan, factory sab ka track rakho</p>
            <button onClick={() => setShowCreate(true)}
              className="mt-4 inline-flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors">
              <Plus className="w-4 h-4" /> New Project
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {projects.map(p => (
              <ProjectCard key={p._id} project={p} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>

      {showCreate && (
        <CreateProjectModal
          onClose={() => setShowCreate(false)}
          onCreated={(newProject) => {
            setProjects(prev => [{ ...newProject, _ordersCount: 0, _labourCount: 0, _totalSpent: 0, _totalQuoted: 0 }, ...prev]);
          }}
        />
      )}
    </CustomerLayout>
  );
}
