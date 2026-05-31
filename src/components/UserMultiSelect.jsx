import { useState, useRef, useEffect } from 'react';
import { ChevronDown, X } from 'lucide-react';

/**
 * Multi-select dropdown for picking registered stakeholder users.
 *
 * Props
 * ─────
 * stakeholderUsers  – array of user objects from getStakeholderUsers()
 * selected          – array of currently-selected user objects
 * onChange(users)   – called with the new selection array
 * t                 – the useT() translation function
 * inputCls          – Tailwind class string for the trigger button
 */
export function UserMultiSelect({ stakeholderUsers, selected, onChange, t, inputCls }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const toggle = (user) => {
    const exists = selected.some((u) => u.id === user.id);
    onChange(exists ? selected.filter((u) => u.id !== user.id) : [...selected, user]);
  };

  return (
    <div className="relative" ref={ref}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`${inputCls} flex items-center justify-between text-left`}
      >
        <span className={selected.length === 0 ? 'text-gray-400' : 'text-gray-800'}>
          {selected.length === 0
            ? t('createCAR', 'selectFromUsers')
            : `${selected.length} ${t('createCAR', 'selectedCount')}`}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown list */}
      {open && (
        <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-56 overflow-y-auto">
          {stakeholderUsers.length === 0 ? (
            <p className="px-4 py-3 text-sm text-gray-400 italic">
              {t('createCAR', 'noStakeholders')}
            </p>
          ) : (
            stakeholderUsers.map((u) => {
              const isSelected = selected.some((s) => s.id === u.id);
              return (
                <label
                  key={u.id}
                  className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors border-b border-gray-50 last:border-0 ${
                    isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggle(u)}
                    className="rounded border-gray-300 text-blue-600 shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800">{u.name}</p>
                    <p className="text-xs text-gray-400 truncate">
                      {[u.position, u.orgName || u.organization].filter(Boolean).join(' · ')}
                    </p>
                  </div>
                </label>
              );
            })
          )}
        </div>
      )}

      {/* Selected chips */}
      {selected.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {selected.map((u) => (
            <div
              key={u.id}
              className="flex items-center gap-1.5 bg-blue-50 border border-blue-200 rounded-lg px-2.5 py-1.5 text-xs"
            >
              <span className="font-medium text-blue-800">{u.name}</span>
              {(u.position || u.orgName || u.organization) && (
                <span className="text-blue-500">
                  · {u.position || u.orgName || u.organization}
                </span>
              )}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange(selected.filter((s) => s.id !== u.id));
                }}
                className="ml-0.5 text-blue-400 hover:text-blue-700 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
