import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Send, Save, ChevronDown, X } from 'lucide-react';
import { useCARContext } from '../context/CARContext';
import { useAuth } from '../context/AuthContext';
import { useT } from '../context/LanguageContext';
import { FileUpload } from '../components/FileUpload';
import { CAR_TYPES, PRIORITY_LEVELS } from '../utils/constants';

const today = () => new Date().toISOString().split('T')[0];
const thirtyDaysLater = () => {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d.toISOString().split('T')[0];
};

const Field = ({ label, required, error, children, hint }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
    {hint && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
    {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
  </div>
);

// ── Multi-select stakeholder picker ───────────────────────────────────────────
function UserMultiSelect({ stakeholderUsers, selected, onChange, t, inputCls }) {
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
      {/* Trigger button */}
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
        <ChevronDown className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-56 overflow-y-auto">
          {stakeholderUsers.length === 0 ? (
            <p className="px-4 py-3 text-sm text-gray-400 italic">{t('createCAR', 'noStakeholders')}</p>
          ) : (
            stakeholderUsers.map((u) => {
              const isSelected = selected.some((s) => s.id === u.id);
              return (
                <label
                  key={u.id}
                  className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors border-b border-gray-50 last:border-0 ${isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
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
                <span className="text-blue-500">· {u.position || u.orgName || u.organization}</span>
              )}
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onChange(selected.filter((s) => s.id !== u.id)); }}
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

export function CreateCAR({ onNavigate }) {
  const { createCAR, issueCAR } = useCARContext();
  const { getStakeholderUsers } = useAuth();
  const t = useT();
  const stakeholderUsers = getStakeholderUsers();

  const [form, setForm] = useState({
    title: '',
    carType: 'Safety Case',
    priority: 'Medium',
    referenceNumber: '',
    incidentDate: today(),
    findingLocation: '',
    findingNarrative: '',
    responsibleUsers:  [],    // array of user objects (multi-select)
    responsiblePerson: '',    // manual entry fallback
    dueDate: thirtyDaysLater(),
    findingAttachments: [],
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const set = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target?.value ?? e }));

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = t('createCAR', 'fieldTitle') + ' is required';
    if (!form.findingNarrative.trim()) e.findingNarrative = t('createCAR', 'fieldNarrative') + ' is required';
    if (form.responsibleUsers.length === 0 && !form.responsiblePerson.trim()) {
      e.responsiblePerson = t('createCAR', 'fieldPerson') + ' is required';
    }
    if (!form.dueDate) e.dueDate = t('createCAR', 'fieldDue') + ' is required';
    return e;
  };

  const handleSaveDraft = () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSubmitting(true);
    createCAR(form);
    onNavigate('dashboard');
  };

  const handleIssue = () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSubmitting(true);
    const car = createCAR(form);
    issueCAR(car.id);
    onNavigate('dashboard');
  };

  const input = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => onNavigate('dashboard')} className="text-gray-400 hover:text-gray-600 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">{t('createCAR', 'pageTitle')}</h1>
          <p className="text-sm text-gray-500 mt-0.5">{t('createCAR', 'pageSubtitle')}</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Section 1 — Finding info */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-3 bg-slate-700 text-white">
            <h2 className="text-sm font-semibold">{t('createCAR', 'sec1Title')}</h2>
          </div>
          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Field label={t('createCAR', 'fieldTitle')} required error={errors.title}>
                <input type="text" value={form.title} onChange={set('title')} placeholder={t('createCAR', 'fieldTitlePlaceholder')} className={input} />
              </Field>
            </div>
            <Field label={t('createCAR', 'fieldType')} required>
              <select value={form.carType} onChange={set('carType')} className={input}>
                {CAR_TYPES.map((type) => (
                  <option key={type} value={type}>{t('carTypes', type)}</option>
                ))}
              </select>
            </Field>
            <Field label={t('createCAR', 'fieldPriority')} required>
              <select value={form.priority} onChange={set('priority')} className={input}>
                {PRIORITY_LEVELS.map((p) => (
                  <option key={p} value={p}>{t('priority', p)}</option>
                ))}
              </select>
            </Field>
            <Field label={t('createCAR', 'fieldRef')} hint={t('createCAR', 'fieldRefHint')}>
              <input type="text" value={form.referenceNumber} onChange={set('referenceNumber')} placeholder={t('createCAR', 'fieldRefPlaceholder')} className={input} />
            </Field>
            <Field label={t('createCAR', 'fieldDate')}>
              <input type="date" value={form.incidentDate} onChange={set('incidentDate')} className={input} />
            </Field>
            <div className="sm:col-span-2">
              <Field label={t('createCAR', 'fieldLocation')} hint={t('createCAR', 'fieldLocationHint')}>
                <input type="text" value={form.findingLocation} onChange={set('findingLocation')} placeholder={t('createCAR', 'fieldLocationPlaceholder')} className={input} />
              </Field>
            </div>
            <div className="sm:col-span-2">
              <Field label={t('createCAR', 'fieldNarrative')} required error={errors.findingNarrative} hint={t('createCAR', 'fieldNarrativeHint')}>
                <textarea rows={5} value={form.findingNarrative} onChange={set('findingNarrative')} placeholder={t('createCAR', 'fieldNarrativePlaceholder')} className={`${input} resize-none`} />
              </Field>
            </div>
            <div className="sm:col-span-2">
              <Field label={t('createCAR', 'fieldAttachments')} hint={t('createCAR', 'fieldAttachmentsHint')}>
                <FileUpload
                  files={form.findingAttachments}
                  onChange={(files) => setForm((p) => ({ ...p, findingAttachments: files }))}
                  label={t('createCAR', 'attachLabel')}
                  maxMB={20}
                />
              </Field>
            </div>
          </div>
        </section>

        {/* Section 2 — Responsible Party */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-3 bg-amber-600 text-white">
            <h2 className="text-sm font-semibold">{t('createCAR', 'sec2Title')}</h2>
          </div>
          <div className="p-5 space-y-4">
            {/* Multi-select picker */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('createCAR', 'responsiblePersons')} <span className="text-red-500">*</span>
              </label>
              <UserMultiSelect
                stakeholderUsers={stakeholderUsers}
                selected={form.responsibleUsers}
                onChange={(users) => setForm((p) => ({ ...p, responsibleUsers: users, responsiblePerson: '' }))}
                t={t}
                inputCls={input}
              />
            </div>

            {/* Manual name entry — only visible when no users selected from list */}
            {form.responsibleUsers.length === 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('createCAR', 'fieldPerson')} {stakeholderUsers.length === 0 && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="text"
                  value={form.responsiblePerson}
                  onChange={set('responsiblePerson')}
                  placeholder={t('createCAR', 'fieldPersonPlaceholder')}
                  className={input}
                />
                {errors.responsiblePerson && (
                  <p className="mt-1 text-xs text-red-500">{errors.responsiblePerson}</p>
                )}
              </div>
            )}

            {/* Due date */}
            <Field label={t('createCAR', 'fieldDue')} required error={errors.dueDate}>
              <input type="date" value={form.dueDate} onChange={set('dueDate')} min={today()} className={input} />
            </Field>
          </div>
        </section>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-end">
          <button type="button" onClick={() => onNavigate('dashboard')} className="px-4 py-2 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
            {t('createCAR', 'btnCancel')}
          </button>
          <button type="button" onClick={handleSaveDraft} disabled={submitting} className="flex items-center justify-center gap-2 px-4 py-2 text-sm border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors">
            <Save className="w-4 h-4" /> {t('createCAR', 'btnDraft')}
          </button>
          <button type="button" onClick={handleIssue} disabled={submitting} className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm">
            <Send className="w-4 h-4" /> {t('createCAR', 'btnIssue')}
          </button>
        </div>
      </div>
    </div>
  );
}
