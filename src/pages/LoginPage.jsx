import { useState } from 'react';
import { Shield, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export function LoginPage() {
  const { login } = useAuth();
  const { t, lang, switchLang } = useLanguage();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError(t('auth', 'fillAll'));
      return;
    }
    setPending(true);
    setError('');
    const result = await login(username.trim(), password);
    setPending(false);
    if (!result.success) setError(t('auth', result.error));
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Top bar */}
      <header className="bg-slate-900 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-1.5 rounded-lg">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-sm leading-tight">{t('app', 'name')}</div>
                <div className="text-xs text-slate-400 leading-tight">{t('app', 'subtitle')}</div>
              </div>
            </div>
            <div className="flex items-center bg-slate-800 rounded-lg p-1 gap-0.5">
              {['en', 'th'].map((l) => (
                <button
                  key={l}
                  onClick={() => switchLang(l)}
                  className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${lang === l ? 'bg-white text-slate-900' : 'text-slate-400 hover:text-white'}`}
                >
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Card */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 w-full max-w-sm p-8">
          <div className="text-center mb-8">
            <div className="inline-flex bg-blue-600 p-3 rounded-xl mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">{t('auth', 'signIn')}</h1>
            <p className="text-sm text-gray-500 mt-1">{t('app', 'subtitle')}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth', 'username')}</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={t('auth', 'usernamePlaceholder')}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                autoComplete="username"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth', 'password')}</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 pr-10"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm text-red-600">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={pending}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white py-2.5 rounded-lg text-sm font-medium transition-colors"
            >
              {pending ? t('auth', 'signingIn') : t('auth', 'signInBtn')}
            </button>
          </form>

          {/* Demo credentials hint */}
          <div className="mt-6 p-3 bg-slate-50 rounded-lg text-xs text-gray-500 space-y-0.5">
            <p className="font-semibold text-gray-600 mb-1">{t('auth', 'demoAccounts')}</p>
            <p>admin / admin123 — {t('auth', 'demoAdmin')}</p>
            <p>safety1 / safety123 — {t('auth', 'demoSafety')}</p>
            <p>inspector1 / inspect123 — {t('auth', 'demoInspector')}</p>
            <p>stake1 / stake123 — {t('auth', 'demoStakeholder')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
