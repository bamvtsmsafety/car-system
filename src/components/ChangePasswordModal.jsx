import { useState } from 'react';
import { X, Lock, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useT } from '../context/LanguageContext';

export function ChangePasswordModal({ onClose }) {
  const { changePassword } = useAuth();
  const t = useT();

  const [form, setForm] = useState({ current: '', newPw: '', confirm: '' });
  const [show, setShow] = useState({ current: false, newPw: false, confirm: false });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  const set = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }));
  const toggleShow = (field) => () => setShow((p) => ({ ...p, [field]: !p[field] }));

  const handleSave = async () => {
    setError('');
    if (!form.current || !form.newPw || !form.confirm) {
      setError(t('auth', 'fillAll'));
      return;
    }
    if (form.newPw.length < 6) {
      setError(t('auth', 'passwordTooShort'));
      return;
    }
    if (form.newPw !== form.confirm) {
      setError(t('auth', 'passwordMismatch'));
      return;
    }
    setSaving(true);
    const result = await changePassword(form.current, form.newPw);
    setSaving(false);
    if (!result.success) {
      setError(t('auth', result.error) || result.error);
    } else {
      setSuccess(true);
      setTimeout(onClose, 1800);
    }
  };

  const inp = 'w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 pr-10';

  const PasswordField = ({ field, label }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="relative">
        <input
          type={show[field] ? 'text' : 'password'}
          value={form[field]}
          onChange={set(field)}
          placeholder="••••••••"
          className={inp}
          autoComplete="off"
        />
        <button
          type="button"
          onClick={toggleShow(field)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          {show[field] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-slate-700 text-white">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4" />
            <h2 className="text-sm font-semibold">{t('auth', 'changePassword')}</h2>
          </div>
          <button onClick={onClose} className="text-slate-300 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {success ? (
            <div className="flex flex-col items-center gap-3 py-4 text-center">
              <CheckCircle2 className="w-12 h-12 text-emerald-500" />
              <p className="text-sm font-medium text-gray-800">{t('auth', 'passwordChanged')}</p>
            </div>
          ) : (
            <>
              <PasswordField field="current" label={t('auth', 'currentPassword')} />
              <PasswordField field="newPw"   label={t('auth', 'newPassword')} />
              <PasswordField field="confirm" label={t('auth', 'confirmPassword')} />

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-xs text-red-600">
                  {error}
                </div>
              )}

              <div className="flex gap-3 pt-1">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  {t('users', 'btnCancel')}
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-lg transition-colors"
                >
                  {saving ? '…' : t('users', 'btnSave')}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
