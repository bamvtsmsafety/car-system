import { useState } from 'react';
import { X, UserCog, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useT } from '../context/LanguageContext';
import { ORG_TYPES } from '../utils/constants';
import { ROLE_COLORS } from '../utils/auth';

export function EditProfileModal({ onClose }) {
  const { currentUser, updateUser } = useAuth();
  const t = useT();

  const [form, setForm] = useState({
    name:          currentUser?.name          || '',
    email:         currentUser?.email         || '',
    orgType:       currentUser?.orgType       || '',
    orgName:       currentUser?.orgName       || currentUser?.organization || '',
    department:    currentUser?.department    || '',
    position:      currentUser?.position      || '',
    contactNumber: currentUser?.contactNumber || '',
  });
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState(false);
  const [saving,  setSaving]  = useState(false);

  const set = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }));

  const handleSave = async () => {
    setError('');
    if (!form.name.trim()) {
      setError(t('users', 'fieldName') + ' is required');
      return;
    }
    setSaving(true);
    const result = await updateUser(currentUser.id, {
      name:          form.name.trim(),
      email:         form.email.trim(),
      orgType:       form.orgType,
      orgName:       form.orgName.trim(),
      organization:  form.orgName.trim(),   // keep backward-compat field in sync
      department:    form.department.trim(),
      position:      form.position.trim(),
      contactNumber: form.contactNumber.trim(),
    });
    setSaving(false);
    if (!result.success) {
      setError(result.error || 'Failed to save');
    } else {
      setSuccess(true);
      setTimeout(onClose, 1600);
    }
  };

  const inp = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400';
  const lbl = 'block text-sm font-medium text-gray-700 mb-1';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-slate-700 text-white">
          <div className="flex items-center gap-2">
            <UserCog className="w-4 h-4" />
            <h2 className="text-sm font-semibold">{t('auth', 'editProfile')}</h2>
          </div>
          <button onClick={onClose} className="text-slate-300 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto max-h-[80vh]">
          {success ? (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <CheckCircle2 className="w-12 h-12 text-emerald-500" />
              <p className="text-sm font-medium text-gray-800">{t('auth', 'profileSaved')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Roles — read-only chips */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-gray-500">{t('users', 'fieldRoles')}:</span>
                  <span className="text-xs text-gray-400 italic">(set by admin)</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(Array.isArray(currentUser?.roles) ? currentUser.roles : [currentUser?.role]).filter(Boolean).map((r) => (
                    <span key={r} className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${ROLE_COLORS[r] || 'bg-gray-100 text-gray-700'}`}>
                      {t('roles', r) || r}
                    </span>
                  ))}
                </div>
              </div>

              {/* ── Personal info ── */}
              <div>
                <label className={lbl}>{t('users', 'fieldName')} <span className="text-red-500">*</span></label>
                <input type="text" value={form.name} onChange={set('name')}
                  placeholder={t('users', 'fieldNamePlaceholder')} className={inp} autoFocus />
              </div>
              <div>
                <label className={lbl}>{t('users', 'fieldEmail')}</label>
                <input type="email" value={form.email} onChange={set('email')}
                  placeholder={t('users', 'fieldEmailPlaceholder')} className={inp} />
              </div>

              {/* ── Organization info ── */}
              <div className="pt-2 border-t border-gray-100">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  {t('users', 'fieldOrg')}
                </p>
                <div className="space-y-3">
                  <div>
                    <label className={lbl}>{t('users', 'fieldOrgType')}</label>
                    <select value={form.orgType} onChange={set('orgType')} className={inp}>
                      <option value="">—</option>
                      {ORG_TYPES.map((o) => <option key={o}>{o}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={lbl}>{t('users', 'fieldOrgName')}</label>
                    <input type="text" value={form.orgName} onChange={set('orgName')}
                      placeholder="e.g. Airports of Thailand PCL" className={inp} />
                  </div>
                  <div>
                    <label className={lbl}>{t('users', 'fieldDept')}</label>
                    <input type="text" value={form.department} onChange={set('department')}
                      placeholder="e.g. Airside Operations" className={inp} />
                  </div>
                  <div>
                    <label className={lbl}>{t('users', 'fieldPosition')}</label>
                    <input type="text" value={form.position} onChange={set('position')}
                      placeholder="e.g. Operations Manager" className={inp} />
                  </div>
                  <div>
                    <label className={lbl}>{t('users', 'fieldContact')}</label>
                    <input type="text" value={form.contactNumber} onChange={set('contactNumber')}
                      placeholder="e.g. +66-2-535-1111" className={inp} />
                  </div>
                </div>
              </div>

              {error && (
                <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}

              <div className="flex gap-3 pt-1">
                <button onClick={onClose}
                  className="flex-1 px-4 py-2 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
                  {t('users', 'btnCancel')}
                </button>
                <button onClick={handleSave} disabled={saving}
                  className="flex-1 px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-lg transition-colors">
                  {saving ? '…' : t('users', 'btnSave')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
