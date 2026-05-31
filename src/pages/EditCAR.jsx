import { useState } from 'react';
import { ArrowLeft, Save, Send } from 'lucide-react';
import { useCARContext } from '../context/CARContext';
import { useAuth } from '../context/AuthContext';
import { useT } from '../context/LanguageContext';
import { FileUpload } from '../components/FileUpload';
import { UserMultiSelect } from '../components/UserMultiSelect';
import { CAR_TYPES, PRIORITY_LEVELS, CAR_STATUS } from '../utils/constants';

const today = () => new Date().toISOString().split('T')[0];

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

// Statuses that allow editing by the safety team
const EDITABLE_STATUSES = [CAR_STATUS.DRAFT, CAR_STATUS.ISSUED, CAR_STATUS.RCA_REJECTED];

export function EditCAR({ carId, onNavigate }) {
  const { cars, updateCAR, issueCAR } = useCARContext();
  const { getStakeholderUsers } = useAuth();
  const t = useT();

  const car = cars.find((c) => c.id === carId);
  const stakeholderUsers = getStakeholderUsers();

  // Derive initial form from the existing CAR
  // If the CAR was created with the new multi-user format, responsibleUsers is populated.
  // If it's an old CAR, we fall back to the manual name field.
  const [form, setForm] = useState(() => ({
    title:              car?.title              || '',
    carType:            car?.carType            || 'Safety Case',
    priority:           car?.priority           || 'Medium',
    referenceNumber:    car?.referenceNumber    || '',
    incidentDate:       car?.incidentDate       || today(),
    findingLocation:    car?.findingLocation    || '',
    findingNarrative:   car?.findingNarrative   || '',
    responsibleUsers:   car?.responsibleUsers   || [],
    // pre-fill manual name only when no users array present (old CARs)
    responsiblePerson:  car?.responsibleUsers?.length ? '' : (car?.responsiblePerson || ''),
    dueDate:            car?.dueDate            || '',
    findingAttachments: car?.findingAttachments || [],
  }));

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const set = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target?.value ?? e }));

  if (!car) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12 text-center">
        <p className="text-gray-400">CAR not found.</p>
        <button onClick={() => onNavigate('dashboard')} className="mt-4 text-blue-600 hover:underline text-sm">
          ← Back to dashboard
        </button>
      </div>
    );
  }

  if (!EDITABLE_STATUSES.includes(car.status)) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12 text-center">
        <p className="text-gray-500">This CAR cannot be edited in its current status ({car.status}).</p>
        <button onClick={() => onNavigate('detail', carId)} className="mt-4 text-blue-600 hover:underline text-sm">
          ← Back to CAR detail
        </button>
      </div>
    );
  }

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

  const handleSave = () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSubmitting(true);
    updateCAR(carId, form);
    onNavigate('detail', carId);
  };

  const handleSaveAndIssue = () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSubmitting(true);
    updateCAR(carId, form);
    issueCAR(carId);
    onNavigate('detail', carId);
  };

  const input = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Page header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => onNavigate('detail', carId)} className="text-gray-400 hover:text-gray-600 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-blue-700 font-semibold bg-blue-50 px-2 py-0.5 rounded">
              {car.carNumber}
            </span>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mt-0.5">{t('createCAR', 'editPageTitle')}</h1>
          <p className="text-sm text-gray-500">{t('createCAR', 'editPageSubtitle')}</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Section 1 — Finding / Issue Information */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-3 bg-slate-700 text-white">
            <h2 className="text-sm font-semibold">{t('createCAR', 'sec1Title')}</h2>
          </div>
          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Field label={t('createCAR', 'fieldTitle')} required error={errors.title}>
                <input
                  type="text"
                  value={form.title}
                  onChange={set('title')}
                  placeholder={t('createCAR', 'fieldTitlePlaceholder')}
                  className={input}
                />
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
              <input
                type="text"
                value={form.referenceNumber}
                onChange={set('referenceNumber')}
                placeholder={t('createCAR', 'fieldRefPlaceholder')}
                className={input}
              />
            </Field>
            <Field label={t('createCAR', 'fieldDate')}>
              <input type="date" value={form.incidentDate} onChange={set('incidentDate')} className={input} />
            </Field>
            <div className="sm:col-span-2">
              <Field label={t('createCAR', 'fieldLocation')} hint={t('createCAR', 'fieldLocationHint')}>
                <input
                  type="text"
                  value={form.findingLocation}
                  onChange={set('findingLocation')}
                  placeholder={t('createCAR', 'fieldLocationPlaceholder')}
                  className={input}
                />
              </Field>
            </div>
            <div className="sm:col-span-2">
              <Field
                label={t('createCAR', 'fieldNarrative')}
                required
                error={errors.findingNarrative}
                hint={t('createCAR', 'fieldNarrativeHint')}
              >
                <textarea
                  rows={5}
                  value={form.findingNarrative}
                  onChange={set('findingNarrative')}
                  placeholder={t('createCAR', 'fieldNarrativePlaceholder')}
                  className={`${input} resize-none`}
                />
              </Field>
            </div>
            <div className="sm:col-span-2">
              <Field
                label={t('createCAR', 'fieldAttachments')}
                hint={t('createCAR', 'fieldAttachmentsHint')}
              >
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
                onChange={(users) =>
                  setForm((p) => ({ ...p, responsibleUsers: users, responsiblePerson: '' }))
                }
                t={t}
                inputCls={input}
              />
            </div>

            {/* Manual name — shown only when no users selected from list */}
            {form.responsibleUsers.length === 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('createCAR', 'fieldPerson')}{' '}
                  {stakeholderUsers.length === 0 && <span className="text-red-500">*</span>}
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

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-end">
          <button
            type="button"
            onClick={() => onNavigate('detail', carId)}
            className="px-4 py-2 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
          >
            {t('createCAR', 'btnCancel')}
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={submitting}
            className="flex items-center justify-center gap-2 px-5 py-2 text-sm border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-60"
          >
            <Save className="w-4 h-4" /> {t('createCAR', 'btnSaveChanges')}
          </button>
          {/* Only show "Save & Issue" when currently a DRAFT */}
          {car.status === CAR_STATUS.DRAFT && (
            <button
              type="button"
              onClick={handleSaveAndIssue}
              disabled={submitting}
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm disabled:opacity-60"
            >
              <Send className="w-4 h-4" /> {t('createCAR', 'btnSaveAndIssue')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
