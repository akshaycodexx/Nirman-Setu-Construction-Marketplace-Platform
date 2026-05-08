import { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAdmin } from '../../context/AdminContext';
import AdminLayout from '../../components/AdminLayout';
import { Settings, Lock, Loader2, User } from 'lucide-react';
import useT from '../../i18n/useT';

export default function AdminSettings() {
  const { admin } = useAdmin();
  const t = useT();
  const [pass, setPass] = useState({ current: '', newPass: '', confirm: '' });
  const [changing, setChanging] = useState(false);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (pass.newPass !== pass.confirm) { toast.error(t('admin.settings.passMismatch')); return; }
    if (pass.newPass.length < 6) { toast.error(t('admin.settings.passMin')); return; }
    setChanging(true);
    try {
      await axios.put('/api/admin/change-password', {
        currentPassword: pass.current,
        newPassword: pass.newPass,
      });
      setPass({ current: '', newPass: '', confirm: '' });
      toast.success(t('admin.settings.passChanged'));
    } catch (err) {
      toast.error(err.response?.data?.message || t('admin.settings.passFailed'));
    } finally {
      setChanging(false);
    }
  };

  const inputCls = "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white";

  return (
    <AdminLayout>
      <div className="max-w-xl mx-auto space-y-5">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Settings className="w-6 h-6 text-orange-500" /> {t('admin.nav.settings')}
        </h1>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-3">
          <h2 className="font-semibold text-gray-800 flex items-center gap-2">
            <User className="w-4 h-4 text-gray-500" /> {t('admin.settings.accountInfo')}
          </h2>
          <div className="text-sm space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-500">{t('admin.settings.name')}</span>
              <span className="font-medium text-gray-900">{admin?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">{t('admin.login.email')}</span>
              <span className="font-medium text-gray-900">{admin?.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">{t('admin.settings.role')}</span>
              <span className="font-medium text-gray-900 capitalize">{admin?.role || 'Admin'}</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleChangePassword} className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
          <h2 className="font-semibold text-gray-800 flex items-center gap-2">
            <Lock className="w-4 h-4 text-gray-500" /> {t('admin.settings.changePassword')}
          </h2>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">{t('admin.settings.currentPassword')}</label>
            <input type="password" required value={pass.current}
              onChange={e => setPass(p => ({ ...p, current: e.target.value }))}
              className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">{t('admin.settings.newPassword')}</label>
            <input type="password" required value={pass.newPass}
              onChange={e => setPass(p => ({ ...p, newPass: e.target.value }))}
              placeholder={t('admin.settings.min6')} className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">{t('admin.settings.confirmPassword')}</label>
            <input type="password" required value={pass.confirm}
              onChange={e => setPass(p => ({ ...p, confirm: e.target.value }))}
              className={inputCls} />
          </div>
          <button type="submit" disabled={changing}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white font-semibold py-3 rounded-xl text-sm transition-colors flex items-center justify-center gap-2">
            {changing ? <><Loader2 className="w-4 h-4 animate-spin" /> {t('admin.settings.changing')}</> : t('admin.settings.changePassword')}
          </button>
        </form>
      </div>
    </AdminLayout>
  );
}
