import { useState } from 'react';
import { ArrowLeft, Send, Save } from 'lucide-react';
import { useCARContext } from '../context/CARContext';
import { useAuth } from '../context/AuthContext';
import { useT } from '../context/LanguageContext';
import { FileUpload } from '../components/FileUpload';
import { CAR_TYPES, PRIORITY_LEVELS, STAKEHOLDER_ORG } from '../utils/constants';

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
    responsibleUserId:      '',
    responsiblePerson:      '',
    responsibleOrgType:     '',
    responsibleOrgName:     '',
    responsibleOrganization:'',
    responsibleDepartment:  '',
    responsiblePosition:    '',
    responsibleEmail:       '',
    responsibleContactNumber:'',
    dueDate: thirtyDaysLater(),
    findingAttachments: [],
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const set = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target?.value ?? e }));

  // When a stakeholder user is selected from the dropdown
  const handleUserSelect = (e) => {
    const uid = e.target.value;
    if (!uid) {
      setForm((p) => ({
        ...p,
        responsibleUserId: '', responsiblePerson: '',
        responsibleOrgType: '', responsibleOrgName: '', responsibleOrganization: '',
        responsibleDepartment: '', responsiblePosition: '',
        responsibleEmail: '', responsibleContactNumber: '',
      }));
    } else {
      const user = stakeholderUsers.find((u) => u.id === uid);
      if (user) {
        setForm((p) => ({
          ...p,
          responsibleUserId:       uid,
          responsiblePerson:       user.name,
          responsibleOrgType:      user.orgType       || '',
          responsibleOrgName:      user.orgName       || user.organization,
          responsibleOrganization: user.orgName       || user.organization,
          responsibleDepartment:   user.department    || '',
          responsiblePosition:     user.position      || '',
          responsibleEmail:        user.email,
          responsibleContactNumber:user.contactNumber || '',
        }));
      }
    }
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = t('createCAR', 'fieldTitle') + ' is required';
    if (!form.findingNarrative.trim()) e.findingNarrative = t('createCAR', 'fieldNarrative') + ' is required';
    if (!form.responsiblePerson.trim()) e.responsiblePerson = t('createCAR', 'fieldPerson') + ' is required';
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
        {/* Section 1 */}
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

        {/* Section 2 */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-3 bg-amber-600 text-white">
            <h2 className="text-sm font-semibold">{t('createCAR', 'sec2Title')}</h2>
          </div>
          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                {t('createCAR', 'fieldPerson')} <span className="text-red-500">*</span>
              </label>
              {/* Registered-user picker */}
              {stakeholderUsers.length > 0 && (
                <select value={form.responsibleUserId} onChange={handleUserSelect} className={input}>
                  <option value="">{t('createCAR', 'orTypeManually')}</option>
                  {stakeholderUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} — {u.organization}
                    </option>
                  ))}
                </select>
              )}
              {/* Manual text entry (shown when no user selected or no users exist) */}
              {(!form.responsibleUserId) && (
                <input
                  type="text"
                  value={form.responsiblePerson}
                  onChange={set('responsiblePerson')}
                  placeholder={t('createCAR', 'fieldPersonPlaceholder')}
                  className={input}
                />
              )}
              {/* Read-only display when user selected */}
              {form.responsibleUserId && (
                <p className="text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                  {form.responsiblePerson}
                </p>
              )}
              {errors.responsiblePerson && <p className="text-xs text-red-500">{errors.responsiblePerson}</p>}
            </div>
            <Field label={t('createCAR', 'fieldOrg')} required>
              <select value={form.responsibleOrganization} onChange={set('responsibleOrganization')} className={input}>
                {STAKEHOLDER_ORG.map((o) => <option key={o}>{o}</option>)}
              </select>
            </Field>
            <Field label={t('createCAR', 'fieldEmail')}>
              <input type="email" value={form.responsibleEmail} onChange={set('responsibleEmail')} placeholder={t('createCAR', 'fieldEmailPlaceholder')} className={input} />
            </Field>
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
