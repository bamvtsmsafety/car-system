import { Shield, ChevronDown, User } from 'lucide-react';
import { useCARContext } from '../context/CARContext';

const USERS = {
  safety: ['Safety Officer', 'Safety Manager', 'Safety Inspector', 'QA Auditor'],
  stakeholder: ['Airside Operations Mgr', 'Ground Handling Mgr', 'Terminal Ops Mgr', 'Engineering Mgr', 'Security Mgr'],
};

export function Header({ onNavigate }) {
  const { role, setRole, currentUser, setCurrentUser } = useCARContext();

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    setCurrentUser(USERS[newRole][0]);
  };

  return (
    <header className="bg-slate-900 text-white shadow-lg sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <button
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <div className="bg-blue-600 p-1.5 rounded-lg">
              <Shield className="w-5 h-5" />
            </div>
            <div className="text-left">
              <div className="font-bold text-sm leading-tight">Airport Safety Management</div>
              <div className="text-xs text-slate-400 leading-tight">Corrective Action Request System</div>
            </div>
          </button>

          <div className="flex items-center gap-3">
            {/* Role switcher */}
            <div className="flex items-center bg-slate-800 rounded-lg p-1 gap-1">
              <button
                onClick={() => handleRoleChange('safety')}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                  role === 'safety' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Safety Team
              </button>
              <button
                onClick={() => handleRoleChange('stakeholder')}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                  role === 'stakeholder' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Stakeholder
              </button>
            </div>

            {/* User selector */}
            <div className="relative group">
              <button className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 rounded-lg px-3 py-1.5 text-sm transition-colors">
                <User className="w-4 h-4 text-slate-400" />
                <span className="text-xs max-w-[140px] truncate">{currentUser}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>
              <div className="absolute right-0 top-full mt-1 w-52 bg-white rounded-lg shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                {USERS[role].map((u) => (
                  <button
                    key={u}
                    onClick={() => setCurrentUser(u)}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors first:rounded-t-lg last:rounded-b-lg ${
                      currentUser === u ? 'text-blue-600 font-medium bg-blue-50' : 'text-gray-700'
                    }`}
                  >
                    {u}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
