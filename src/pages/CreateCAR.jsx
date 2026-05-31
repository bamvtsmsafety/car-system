import { useState } from 'react';
import { ArrowLeft, Send, Save } from 'lucide-react';
import { useCARContext } from '../context/CARContext';
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
  const [form, setForm] = useState({
    title: '',
    carType: 'Safety Case',
    priority: 'Medium',
    referenceNumber: '',
    incidentDate: today(),
    findingLocation: '',
    findingNarrative: '',
    responsiblePerson: '',
    responsibleOrganization: STAKEHOLDER_ORG[0],
    responsibleEmail: '',
    dueDate: thirtyDaysLater(),
    findingAttachments: [],
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const set = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target?.value ?? e }));

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Title is required';
    if (!form.findingNarrative.trim()) e.findingNarrative = 'Finding narrative is required';
    if (!form.responsiblePerson.trim()) e.responsiblePerson = 'Responsible person is required';
    if (!form.dueDate) e.dueDate = 'Due date is required';
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
          <h1 className="text-xl font-bold text-gray-900">New Corrective Action Request</h1>
          <p className="text-sm text-gray-500 mt-0.5">Create a CAR for a safety case or inspection finding</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Section 1 — Finding Information */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-3 bg-slate-700 text-white">
            <h2 className="text-sm font-semibold">1. Finding / Issue Information</h2>
          </div>
          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Field label="CAR Title" required error={errors.title}>
                <input type="text" value={form.title} onChange={set('title')} placeholder="Brief title describing the finding" className={input} />
              </Field>
            </div>
            <Field label="CAR Type" required>
              <select value={form.carType} onChange={set('carType')} className={input}>
                {CAR_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Priority Level" required>
              <select value={form.priority} onChange={set('priority')} className={input}>
                {PRIORITY_LEVELS.map((p) => <option key={p}>{p}</option>)}
              </select>
            </Field>
            <Field label="Reference / Report Number" hint="e.g. SI-2024-001, SMS-2024-042">
              <input type="text" value={form.referenceNumber} onChange={set('referenceNumber')} placeholder="Optional reference number" className={input} />
            </Field>
            <Field label="Incident / Inspection Date">
              <input type="date" value={form.incidentDate} onChange={set('incidentDate')} className={input} />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Finding Location" hint="e.g. Runway 21L, Terminal 2 Ramp, Cargo Area B">
                <input type="text" value={form.findingLocation} onChange={set('findingLocation')} placeholder="Where the issue was identified" className={input} />
              </Field>
            </div>
            <div className="sm:col-span-2">
              <Field label="Finding / Issue Narrative" required error={errors.findingNarrative} hint="Describe the safety issue, observation, or non-conformance in detail">
                <textarea
                  rows={5}
                  value={form.findingNarrative}
                  onChange={set('findingNarrative')}
                  placeholder="Provide a detailed description of the finding, including relevant observations, regulations referenced, and potential safety impact..."
                  className={`${input} resize-none`}
                />
              </Field>
            </div>
            <div className="sm:col-span-2">
              <Field label="Supporting Documents / Attachments" hint="Attach the Safety Report, Inspection Report, photos, or other evidence">
                <FileUpload
                  files={form.findingAttachments}
                  onChange={(files) => setForm((p) => ({ ...p, findingAttachments: files }))}
                  label="Attach Safety/Inspection Report and supporting files"
                  maxMB={20}
                />
              </Field>
            </div>
          </div>
        </section>

        {/* Section 2 — Responsible Party */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-3 bg-amber-600 text-white">
            <h2 className="text-sm font-semibold">2. Responsible Party</h2>
          </div>
          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Responsible Person / Officer" required error={errors.responsiblePerson}>
              <input type="text" value={form.responsiblePerson} onChange={set('responsiblePerson')} placeholder="Full name of responsible person" className={input} />
            </Field>
            <Field label="Organization / Department" required>
              <select value={form.responsibleOrganization} onChange={set('responsibleOrganization')} className={input}>
                {STAKEHOLDER_ORG.map((o) => <option key={o}>{o}</option>)}
              </select>
            </Field>
            <Field label="Email Address">
              <input type="email" value={form.responsibleEmail} onChange={set('responsibleEmail')} placeholder="responsible@airport.com" className={input} />
            </Field>
            <Field label="Response Due Date" required error={errors.dueDate}>
              <input type="date" value={form.dueDate} onChange={set('dueDate')} min={today()} className={input} />
            </Field>
          </div>
        </section>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-end">
          <button
            type="button"
            onClick={() => onNavigate('dashboard')}
            className="px-4 py-2 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={submitting}
            className="flex items-center justify-center gap-2 px-4 py-2 text-sm border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <Save className="w-4 h-4" /> Save as Draft
          </button>
          <button
            type="button"
            onClick={handleIssue}
            disabled={submitting}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
            <Send className="w-4 h-4" /> Issue CAR to Stakeholder
          </button>
        </div>
      </div>
    </div>
  );
}
