import { useState, useMemo } from 'react';
import {
  ArrowLeft, Plus, Edit2, Trash2, UserCheck, UserX, X, Eye, EyeOff, Users,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useT } from '../context/LanguageContext';
import { ROLES, ROLE_COLORS } from '../utils/auth';
import { STAKEHOLDER_ORG } from '../utils/constants';

const ROLE_KEYS = Object.keys(ROLES);

const inp = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400';
const lbl = 'block text-sm font-medium text-gray-700 mb-1';

function RoleBadge({ role }) {
  const t = useT();
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${ROLE_COLORS[role] || 'bg-gray-100 text-gray-700'}`}>
      {t('roles', role) || role}
    </span>
  );
}

function UserForm({ initial, isEdit, onSave, onCancel }) {
  const t = useT();
  const [form, setForm] = useState({
    name: initial?.name || '',
    username: initial?.username || '',
    password: '',
    email: initial?.email || '',
    role: initial?.role || 'stakeholder',
    organization: initial?.organization || STAKEHOLDER_ORG[0],
    isActive: initial?.isActive ?? true,
  });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const set = (field) => (e) =>
    setForm((p) => ({ ...p, [field]: e.target?.type === 'checkbox' ? e.target.checked : e.target.value }));

  const handleSave = async () => {
    if (!form.name.trim() || !form.username.trim()) { setError('Name and username are required'); return; }
    if (!isEdit && !form.password) { setError('Password is required'); return; }
    setSaving(true);
    setError('');
    const result = await onSave(form);
    setSaving(false);
    if (!result.success) {
      setError(t('users', result.error) || result.error);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-5">
      <div className="px-5 py-3 bg-slate-700 text-white flex items-center justify-between">
        <h3 className="text-sm font-semibold">{isEdit ? t('users', 'editUser') : t('users', 'createUser')}</h3>
        <button onClick={onCancel} className="text-slate-300 hover:text-white transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={lbl}>{t('users', 'fieldName')} <span className="text-red-500">*</span></label>
          <input type="text" value={form.name} onChange={set('name')} placeholder={t('users', 'fieldNamePlaceholder')} className={inp} />
        </div>
        <div>
          <label className={lbl}>{t('users', 'fieldUsername')} <span className="text-red-500">*</span></label>
          <input type="text" value={form.username} onChange={set('username')} placeholder={t('users', 'fieldUsernamePlaceholder')} className={inp} />
        </div>
        <div>
          <label className={lbl}>{isEdit ? t('users', 'fieldPasswordEdit') : t('users', 'fieldPassword') + ' *'}</label>
          <div className="relative">
            <input
              type={showPw ? 'text' : 'password'}
              value={form.password}
              onChange={set('password')}
              placeholder={isEdit ? '••••••••' : ''}
              className={`${inp} pr-10`}
            />
            <button type="button" onClick={() => setShowPw((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <div>
          <label className={lbl}>{t('users', 'fieldEmail')}</label>
          <input type="email" value={form.email} onChange={set('email')} placeholder={t('users', 'fieldEmailPlaceholder')} className={inp} />
        </div>
        <div>
          <label className={lbl}>{t('users', 'fieldRole')} <span className="text-red-500">*</span></label>
          <select value={form.role} onChange={set('role')} className={inp}>
            {ROLE_KEYS.map((r) => (
              <option key={r} value={r}>{ROLES[r]}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={lbl}>{t('users', 'fieldOrg')}</label>
          <select value={form.organization} onChange={set('organization')} className={inp}>
            {STAKEHOLDER_ORG.map((o) => <option key={o}>{o}</option>)}
            <option value="Safety Department">Safety Department</option>
            <option value="Administration">Administration</option>
          </select>
        </div>
        {isEdit && (
          <div className="sm:col-span-2 flex items-center gap-2">
            <input type="checkbox" id="isActive" checked={form.isActive} onChange={set('isActive')} className="rounded border-gray-300 text-blue-600" />
            <label htmlFor="isActive" className="text-sm text-gray-700">{t('users', 'fieldActive')}</label>
          </div>
        )}
        {error && <p className="sm:col-span-2 text-xs text-red-500">{error}</p>}
        <div className="sm:col-span-2 flex gap-3 justify-end pt-1">
          <button onClick={onCancel} className="px-4 py-2 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
            {t('users', 'btnCancel')}
          </button>
          <button onClick={handleSave} disabled={saving} className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-60">
            {t('users', 'btnSave')}
          </button>
        </div>
      </div>
    </div>
  );
}

export function UserManagement({ onNavigate }) {
  const t = useT();
  const { users, currentUser, createUser, updateUser, deleteUser } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState(null); // user object being edited
  const [filterRole, setFilterRole] = useState('');

  const filtered = useMemo(() => {
    if (!filterRole) return users;
    return users.filter((u) => u.role === filterRole);
  }, [users, filterRole]);

  const handleCreate = async (form) => {
    const result = await createUser(form);
    if (result.success) setShowForm(false);
    return result;
  };

  const handleEdit = async (form) => {
    const changes = { ...form };
    if (!changes.password) delete changes.password;
    const result = await updateUser(editTarget.id, changes);
    if (result.success) setEditTarget(null);
    return result;
  };

  const handleDelete = (user) => {
    if (user.id === currentUser?.id) return; // can't delete yourself
    if (confirm(t('users', 'confirmDelete') + ` (${user.name})`)) {
      deleteUser(user.id);
    }
  };

  const handleToggleActive = (user) => {
    if (user.id === currentUser?.id) return;
    updateUser(user.id, { isActive: !user.isActive });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Page header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => onNavigate('dashboard')} className="text-gray-400 hover:text-gray-600 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900">{t('users', 'pageTitle')}</h1>
          <p className="text-sm text-gray-500 mt-0.5">{t('users', 'pageSubtitle')}</p>
        </div>
        {!showForm && !editTarget && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" /> {t('users', 'newUser')}
          </button>
        )}
      </div>

      {/* Stat chip */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-4 mb-5">
        <div className="bg-slate-700 p-3 rounded-xl">
          <Users className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900">{users.length}</p>
          <p className="text-xs text-gray-500">{t('users', 'totalUsers')}</p>
        </div>
      </div>

      {/* Create form */}
      {showForm && (
        <UserForm isEdit={false} onSave={handleCreate} onCancel={() => setShowForm(false)} />
      )}

      {/* Edit form */}
      {editTarget && (
        <UserForm initial={editTarget} isEdit onSave={handleEdit} onCancel={() => setEditTarget(null)} />
      )}

      {/* Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-50 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-700">
            {t('users', 'totalUsers')} ({filtered.length})
          </h2>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-600"
          >
            <option value="">{t('users', 'filterAll')}</option>
            {ROLE_KEYS.map((r) => (
              <option key={r} value={r}>{ROLES[r]}</option>
            ))}
          </select>
        </div>

        {filtered.length === 0 ? (
          <div className="py-12 text-center text-gray-400 text-sm">{t('users', 'noUsers')}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-500 uppercase tracking-wide border-b border-gray-100">
                  <th className="text-left px-5 py-3 font-medium">{t('users', 'colName')}</th>
                  <th className="text-left px-4 py-3 font-medium">{t('users', 'colUsername')}</th>
                  <th className="text-left px-4 py-3 font-medium">{t('users', 'colRole')}</th>
                  <th className="text-left px-4 py-3 font-medium">{t('users', 'colOrg')}</th>
                  <th className="text-left px-4 py-3 font-medium">{t('users', 'colStatus')}</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((user) => {
                  const isSelf = user.id === currentUser?.id;
                  return (
                    <tr key={user.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="font-medium text-gray-900">{user.name}</div>
                        <div className="text-xs text-gray-400">{user.email}</div>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-xs text-gray-600">{user.username}</td>
                      <td className="px-4 py-3.5"><RoleBadge role={user.role} /></td>
                      <td className="px-4 py-3.5 text-xs text-gray-600 max-w-[150px] truncate">{user.organization}</td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${user.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                          {user.isActive ? t('users', 'active') : t('users', 'inactive')}
                        </span>
                        {isSelf && <span className="ml-2 text-xs text-gray-400">(you)</span>}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1 justify-end">
                          <button
                            onClick={() => { setShowForm(false); setEditTarget(user); }}
                            className="p-1.5 rounded text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          {!isSelf && (
                            <>
                              <button
                                onClick={() => handleToggleActive(user)}
                                className={`p-1.5 rounded transition-colors ${user.isActive ? 'text-gray-400 hover:text-amber-600 hover:bg-amber-50' : 'text-gray-400 hover:text-emerald-600 hover:bg-emerald-50'}`}
                                title={user.isActive ? 'Deactivate' : 'Activate'}
                              >
                                {user.isActive ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                              </button>
                              <button
                                onClick={() => handleDelete(user)}
                                className="p-1.5 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
