import { useState, useRef, useEffect } from 'react';
import { LogOut, User, Users, Shield, Lock, ChevronDown, UserCog } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { isAdmin, getPrimaryRole } from '../utils/auth';
import { ChangePasswordModal } from './ChangePasswordModal';
import { EditProfileModal } from './EditProfileModal';

export function Header({ onNavigate }) {
  const { currentUser, logout } = useAuth();
  const { lang, switchLang, t } = useLanguage();

  const [menuOpen, setMenuOpen] = useState(false);
  const [showChangePw, setShowChangePw] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const menuRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <>
      <header className="bg-slate-900 text-white shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <button
              onClick={() => onNavigate('dashboard')}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <div className="bg-blue-600 p-1.5 rounded-lg">
                <Shield className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="font-bold text-sm leading-tight">{t('app', 'name')}</div>
                <div className="text-xs text-slate-400 leading-tight">{t('app', 'subtitle')}</div>
              </div>
            </button>

            {/* Right-side controls */}
            <div className="flex items-center gap-2">
              {/* Language toggle */}
              <div className="flex items-center bg-slate-800 rounded-lg p-1 gap-0.5">
                {['en', 'th'].map((l) => (
                  <button
                    key={l}
                    onClick={() => switchLang(l)}
                    className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                      lang === l ? 'bg-white text-slate-900' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {l.toUpperCase()}
                  </button>
                ))}
              </div>

              {/* Users link — admin only */}
              {isAdmin(currentUser?.roles || [currentUser?.role]) && (
                <button
                  onClick={() => onNavigate('users')}
                  className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white transition-colors"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{t('header', 'users')}</span>
                </button>
              )}

              {/* User chip → dropdown */}
              {currentUser && (
                <div className="relative" ref={menuRef}>
                  <button
                    onClick={() => setMenuOpen((v) => !v)}
                    className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 rounded-lg px-3 py-1.5 transition-colors"
                  >
                    <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <div className="text-left hidden sm:block">
                      <p className="text-xs font-medium text-white leading-tight max-w-[130px] truncate">
                        {currentUser.name}
                      </p>
                      <p className="text-[10px] text-slate-400 leading-tight">
                        {t('roles', getPrimaryRole(currentUser.roles || [currentUser.role]))}
                      </p>
                    </div>
                    <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown */}
                  {menuOpen && (
                    <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
                      {/* User info header */}
                      <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-800 truncate">{currentUser.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{currentUser.email}</p>
                      </div>
                      {/* Edit Profile */}
                      <button
                        onClick={() => { setShowEditProfile(true); setMenuOpen(false); }}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                      >
                        <UserCog className="w-3.5 h-3.5" />
                        {t('auth', 'editProfile')}
                      </button>
                      {/* Change Password */}
                      <button
                        onClick={() => { setShowChangePw(true); setMenuOpen(false); }}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                      >
                        <Lock className="w-3.5 h-3.5" />
                        {t('auth', 'changePassword')}
                      </button>
                      {/* Logout */}
                      <button
                        onClick={logout}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors border-t border-gray-100"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        {t('header', 'logout')}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Modals */}
      {showEditProfile && <EditProfileModal onClose={() => setShowEditProfile(false)} />}
      {showChangePw    && <ChangePasswordModal onClose={() => setShowChangePw(false)} />}
    </>
  );
}
