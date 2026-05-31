import { useState } from 'react';
import { format } from 'date-fns';
import {
  ArrowLeft, Send, CheckCircle2, XCircle, Lock, AlertTriangle,
  ClipboardList, User, Calendar, MapPin, Hash, Building2,
  History, ChevronDown, ChevronUp, Trash2, Briefcase, Phone, Layers
} from 'lucide-react';
import { useCARContext } from '../context/CARContext';
import { useT } from '../context/LanguageContext';
import { StatusBadge, PriorityBadge } from '../components/StatusBadge';
import { FileList, FileUpload } from '../components/FileUpload';
import { CAR_STATUS, STATUS_LABELS } from '../utils/constants';

const fmt = (iso) => iso ? format(new Date(iso), 'dd MMM yyyy, HH:mm') : '—';
const fmtDate = (d) => d ? format(new Date(d), 'dd MMM yyyy') : '—';

const Section = ({ title, color = 'bg-slate-700', children, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center justify-between px-5 py-3 ${color} text-white`}
      >
        <span className="text-sm font-semibold">{title}</span>
        {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
      {open && <div className="p-5">{children}</div>}
    </div>
  );
};

const InfoRow = ({ icon: Icon, label, value, valueClass = '' }) => (
  <div className="flex items-start gap-3">
    <Icon className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
    <div>
      <p className="text-xs text-gray-400">{label}</p>
      <p className={`text-sm font-medium text-gray-800 ${valueClass}`}>{value || '—'}</p>
    </div>
  </div>
);

const Textarea = ({ value, onChange, rows = 4, placeholder }) => (
  <textarea
    rows={rows}
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
  />
);

// ── RCA / CAP submission form (stakeholder) ──────────────────────────────────
function SubmitRCAForm({ car, onSubmit }) {
  const { currentUser } = useCARContext();
  const t = useT();
  const [form, setForm] = useState({
    rootCauseAnalysis: car.rootCauseAnalysis || '',
    correctiveActionPlan: car.correctiveActionPlan || '',
    capTargetDate: car.capTargetDate || '',
    capAttachments: car.capAttachments || [],
    submittedBy: currentUser,
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.rootCauseAnalysis.trim()) e.rca = t('detail', 'fieldRCA') + ' is required';
    if (!form.correctiveActionPlan.trim()) e.cap = t('detail', 'fieldCAP') + ' is required';
    if (!form.capTargetDate) e.date = t('detail', 'fieldTargetDate') + ' is required';
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    onSubmit(form);
  };

  const inp = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400';
  const lbl = 'block text-sm font-medium text-gray-700 mb-1';

  return (
    <div className="space-y-4 mt-2">
      {car.status === CAR_STATUS.RCA_REJECTED && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
          <XCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">{t('detail', 'rcaRejectedTitle')}</p>
            {car.reviewComments && <p className="mt-1 text-red-600">{car.reviewComments}</p>}
            <p className="mt-1 text-red-500">{t('detail', 'rcaRejectedRevise')}</p>
          </div>
        </div>
      )}
      <div>
        <label className={lbl}>{t('detail', 'fieldRCA')} <span className="text-red-500">*</span></label>
        <Textarea
          rows={5}
          value={form.rootCauseAnalysis}
          onChange={(v) => setForm((p) => ({ ...p, rootCauseAnalysis: v }))}
          placeholder={t('detail', 'fieldRCAPlaceholder')}
        />
        {errors.rca && <p className="mt-1 text-xs text-red-500">{errors.rca}</p>}
      </div>
      <div>
        <label className={lbl}>{t('detail', 'fieldCAP')} <span className="text-red-500">*</span></label>
        <Textarea
          rows={5}
          value={form.correctiveActionPlan}
          onChange={(v) => setForm((p) => ({ ...p, correctiveActionPlan: v }))}
          placeholder={t('detail', 'fieldCAPPlaceholder')}
        />
        {errors.cap && <p className="mt-1 text-xs text-red-500">{errors.cap}</p>}
      </div>
      <div>
        <label className={lbl}>{t('detail', 'fieldTargetDate')} <span className="text-red-500">*</span></label>
        <input
          type="date"
          value={form.capTargetDate}
          onChange={(e) => setForm((p) => ({ ...p, capTargetDate: e.target.value }))}
          className={`${inp} w-auto`}
        />
        {errors.date && <p className="mt-1 text-xs text-red-500">{errors.date}</p>}
      </div>
      <div>
        <label className={lbl}>{t('detail', 'fieldSupportingDocs')}</label>
        <FileUpload
          files={form.capAttachments}
          onChange={(files) => setForm((p) => ({ ...p, capAttachments: files }))}
          label={t('detail', 'fieldSupportingDocs')}
          maxMB={20}
        />
      </div>
      <div>
        <label className={lbl}>{t('detail', 'fieldSubmittedBy')}</label>
        <input type="text" value={form.submittedBy} onChange={(e) => setForm((p) => ({ ...p, submittedBy: e.target.value }))} className={`${inp} w-auto`} />
      </div>
      <button
        onClick={handleSubmit}
        className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors"
      >
        <Send className="w-4 h-4" /> {t('detail', 'btnSubmitRCA')}
      </button>
    </div>
  );
}

// ── CAP Review form (safety team) ─────────────────────────────────────────────
function ReviewCAPForm({ car, onReview }) {
  const t = useT();
  const [comments, setComments] = useState('');
  const [decision, setDecision] = useState(null);

  const handleDecide = (approved) => {
    setDecision(approved);
  };

  const handleConfirm = () => {
    if (decision === null) return;
    onReview(decision, comments);
  };

  return (
    <div className="space-y-4 mt-2">
      <div className="grid sm:grid-cols-2 gap-4 text-sm">
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">{t('detail', 'labelRCA')}</p>
          <p className="text-gray-800 whitespace-pre-wrap">{car.rootCauseAnalysis}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">{t('detail', 'labelCAP')}</p>
          <p className="text-gray-800 whitespace-pre-wrap">{car.correctiveActionPlan}</p>
          {car.capTargetDate && (
            <p className="text-xs text-gray-500 mt-2">{t('detail', 'labelTarget')} <strong>{fmtDate(car.capTargetDate)}</strong></p>
          )}
        </div>
      </div>
      {car.capAttachments?.length > 0 && (
        <FileList files={car.capAttachments} title={t('detail', 'labelSubmitted')} />
      )}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{t('detail', 'fieldReviewComments')}</label>
        <Textarea
          value={comments}
          onChange={setComments}
          placeholder={t('detail', 'fieldReviewPlaceholder')}
          rows={3}
        />
      </div>
      <div className="flex gap-3">
        <button
          onClick={() => handleDecide(false)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
            decision === false ? 'bg-red-600 text-white border-red-600' : 'border-red-300 text-red-600 hover:bg-red-50'
          }`}
        >
          <XCircle className="w-4 h-4" /> {t('detail', 'btnReject')}
        </button>
        <button
          onClick={() => handleDecide(true)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
            decision === true ? 'bg-emerald-600 text-white border-emerald-600' : 'border-emerald-300 text-emerald-600 hover:bg-emerald-50'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" /> {t('detail', 'btnApprove')}
        </button>
        {decision !== null && (
          <button
            onClick={handleConfirm}
            className="ml-auto flex items-center gap-2 bg-slate-700 hover:bg-slate-800 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            {decision ? t('detail', 'btnConfirmApproval') : t('detail', 'btnConfirmRejection')}
          </button>
        )}
      </div>
    </div>
  );
}

// ── Final Action form (stakeholder) ──────────────────────────────────────────
function FinalActionForm({ car, onSubmit }) {
  const { currentUser } = useCARContext();
  const t = useT();
  const [form, setForm] = useState({
    finalActionTaken: '',
    finalActionDate: new Date().toISOString().split('T')[0],
    finalActionAttachments: [],
    submittedBy: currentUser,
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.finalActionTaken.trim()) e.action = t('detail', 'fieldFinalAction') + ' is required';
    if (!form.finalActionDate) e.date = t('detail', 'fieldActionDate') + ' is required';
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    onSubmit(form);
  };

  const lbl = 'block text-sm font-medium text-gray-700 mb-1';
  const inp = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400';

  return (
    <div className="space-y-4 mt-2">
      <div className="flex items-start gap-2 bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-sm text-emerald-700">
        <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
        <p>{t('detail', 'finalApprovedNotice')}</p>
      </div>
      <div>
        <label className={lbl}>{t('detail', 'fieldFinalAction')} <span className="text-red-500">*</span></label>
        <Textarea
          rows={5}
          value={form.finalActionTaken}
          onChange={(v) => setForm((p) => ({ ...p, finalActionTaken: v }))}
          placeholder={t('detail', 'fieldFinalActionPlaceholder')}
        />
        {errors.action && <p className="mt-1 text-xs text-red-500">{errors.action}</p>}
      </div>
      <div>
        <label className={lbl}>{t('detail', 'fieldActionDate')} <span className="text-red-500">*</span></label>
        <input
          type="date"
          value={form.finalActionDate}
          onChange={(e) => setForm((p) => ({ ...p, finalActionDate: e.target.value }))}
          className={`${inp} w-auto`}
        />
        {errors.date && <p className="mt-1 text-xs text-red-500">{errors.date}</p>}
      </div>
      <div>
        <label className={lbl}>{t('detail', 'fieldEvidence')} <span className="text-red-500">*</span></label>
        <FileUpload
          files={form.finalActionAttachments}
          onChange={(files) => setForm((p) => ({ ...p, finalActionAttachments: files }))}
          label={t('detail', 'attachEvidenceLabel')}
          maxMB={20}
        />
        <p className="text-xs text-amber-600 mt-1">{t('detail', 'evidenceHint')}</p>
      </div>
      <div>
        <label className={lbl}>{t('detail', 'fieldSubmittedBy')}</label>
        <input type="text" value={form.submittedBy} onChange={(e) => setForm((p) => ({ ...p, submittedBy: e.target.value }))} className={`${inp} w-auto`} />
      </div>
      <button
        onClick={handleSubmit}
        className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors"
      >
        <Send className="w-4 h-4" /> {t('detail', 'btnSubmitFinal')}
      </button>
    </div>
  );
}

// ── Close CAR form (safety team) ─────────────────────────────────────────────
function CloseCARForm({ car, onClose }) {
  const t = useT();
  const [comments, setComments] = useState('');

  return (
    <div className="space-y-4 mt-2">
      <div className="grid sm:grid-cols-2 gap-4 text-sm">
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">{t('detail', 'fieldFinalAction')}</p>
          <p className="text-gray-800 whitespace-pre-wrap">{car.finalActionTaken}</p>
          <p className="text-xs text-gray-500 mt-2">{t('detail', 'finalActionDate')} <strong>{fmtDate(car.finalActionDate)}</strong></p>
        </div>
        <div className="space-y-2">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{t('detail', 'fieldEvidence')}</p>
          <FileList files={car.finalActionAttachments} />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{t('detail', 'fieldClosureComments')}</label>
        <Textarea value={comments} onChange={setComments} placeholder={t('detail', 'fieldClosurePlaceholder')} rows={3} />
      </div>
      <button
        onClick={() => onClose(comments)}
        className="flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors"
      >
        <Lock className="w-4 h-4" /> {t('detail', 'btnClose')}
      </button>
    </div>
  );
}

// ── Audit Trail ───────────────────────────────────────────────────────────────
function AuditTrail({ entries }) {
  const colors = {
    'CAR Created': 'bg-slate-500',
    'CAR Issued': 'bg-blue-500',
    'RCA/CAP Submitted': 'bg-yellow-500',
    'CAP Approved': 'bg-emerald-500',
    'CAP Rejected': 'bg-red-500',
    'Final Action Submitted': 'bg-purple-500',
    'CAR Closed': 'bg-emerald-700',
  };
  return (
    <div className="relative pl-5">
      <div className="absolute left-2 top-0 bottom-0 w-px bg-gray-200" />
      <div className="space-y-4">
        {[...entries].reverse().map((entry) => (
          <div key={entry.id} className="relative flex gap-3">
            <div className={`absolute -left-3 w-2.5 h-2.5 rounded-full border-2 border-white ${colors[entry.action] || 'bg-gray-400'} mt-0.5`} />
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-sm font-medium text-gray-800">{entry.action}</span>
                <span className="text-xs text-gray-400 whitespace-nowrap">{fmt(entry.timestamp)}</span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">by {entry.actor}</p>
              {entry.notes && <p className="text-xs text-gray-400 mt-0.5 italic">{entry.notes}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main CARDetail ─────────────────────────────────────────────────────────────
export function CARDetail({ carId, onNavigate }) {
  const { cars, role, issueCAR, submitRCA, reviewCAP, submitFinalAction, closeCAR, deleteCAR } = useCARContext();
  const t = useT();
  const car = cars.find((c) => c.id === carId);

  if (!car) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12 text-center">
        <p className="text-gray-400">CAR not found.</p>
        <button onClick={() => onNavigate('dashboard')} className="mt-4 text-blue-600 hover:underline text-sm">← Back to dashboard</button>
      </div>
    );
  }

  const isSafety = role === 'safety';
  const overdue = car.dueDate && new Date(car.dueDate) < new Date() && car.status !== CAR_STATUS.CLOSED;

  const handleDelete = () => {
    if (confirm(`${t('detail', 'confirmDelete')} ${car.carNumber}${t('detail', 'deleteMsg')}`)) {
      deleteCAR(car.id);
      onNavigate('dashboard');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
      {/* Header */}
      <div className="flex items-start gap-3">
        <button onClick={() => onNavigate('dashboard')} className="text-gray-400 hover:text-gray-600 transition-colors mt-1">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="font-mono text-blue-700 font-bold text-sm bg-blue-50 px-2 py-0.5 rounded">{car.carNumber}</span>
            <StatusBadge status={car.status} />
            <PriorityBadge priority={car.priority} />
            {overdue && (
              <span className="flex items-center gap-1 text-xs text-red-600 font-medium bg-red-50 px-2 py-0.5 rounded">
                <AlertTriangle className="w-3 h-3" /> {t('dashboard', 'overdue')}
              </span>
            )}
          </div>
          <h1 className="text-xl font-bold text-gray-900">{car.title}</h1>
        </div>
        {isSafety && car.status === CAR_STATUS.DRAFT && (
          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => { issueCAR(car.id); }}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
            >
              <Send className="w-3.5 h-3.5" /> {t('detail', 'btnIssue')}
            </button>
            <button onClick={handleDelete} className="p-1.5 rounded-lg border border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-200 transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Finding Info */}
      <Section title={t('detail', 'sec1')} color="bg-slate-700">
        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <InfoRow icon={Hash} label={t('detail', 'fieldType')} value={car.carType} />
          <InfoRow icon={Calendar} label={t('detail', 'fieldIncidentDate')} value={fmtDate(car.incidentDate)} />
          <InfoRow icon={MapPin} label={t('detail', 'fieldLocation')} value={car.findingLocation} />
          <InfoRow icon={Hash} label={t('detail', 'fieldRef')} value={car.referenceNumber} />
          <InfoRow icon={Calendar} label={t('detail', 'fieldIssued')} value={fmt(car.issuedAt)} />
          <InfoRow icon={Calendar} label={t('detail', 'fieldDue')} value={fmtDate(car.dueDate)} valueClass={overdue ? 'text-red-600' : ''} />
        </div>
        <div className="mb-4">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">{t('detail', 'fieldNarrative')}</p>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
            {car.findingNarrative}
          </div>
        </div>
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">{t('detail', 'fieldAttachments')}</p>
          <FileList files={car.findingAttachments} />
        </div>
      </Section>

      {/* Responsible Party */}
      <Section title={t('detail', 'sec2')} color="bg-amber-600">
        <div className="grid sm:grid-cols-2 gap-4">
          <InfoRow icon={User}      label={t('detail', 'fieldPerson')}   value={car.responsiblePerson} />
          <InfoRow icon={Briefcase} label={t('detail', 'fieldPosition')}  value={car.responsiblePosition} />
          <InfoRow icon={Layers}    label={t('detail', 'fieldOrgType')}   value={car.responsibleOrgType} />
          <InfoRow icon={Building2} label={t('detail', 'fieldOrg')}       value={car.responsibleOrgName || car.responsibleOrganization} />
          <InfoRow icon={Hash}      label={t('detail', 'fieldDept')}      value={car.responsibleDepartment} />
          <InfoRow icon={User}      label={t('detail', 'fieldEmail')}     value={car.responsibleEmail || '—'} />
          <InfoRow icon={Phone}     label={t('detail', 'fieldContact')}   value={car.responsibleContactNumber} />
          <InfoRow icon={User}      label={t('detail', 'fieldIssuedBy')}  value={car.issuedBy} />
        </div>
      </Section>

      {/* RCA / CAP Section */}
      <Section title={t('detail', 'sec3')} color="bg-yellow-600">
        {car.status === CAR_STATUS.DRAFT && (
          <p className="text-sm text-gray-400 italic">{t('detail', 'waitDraft')}</p>
        )}
        {car.status === CAR_STATUS.ISSUED && isSafety && (
          <p className="text-sm text-gray-500 italic">{t('detail', 'waitRCA')}</p>
        )}
        {car.status === CAR_STATUS.ISSUED && !isSafety && (
          <SubmitRCAForm car={car} onSubmit={(fd) => submitRCA(car.id, fd)} />
        )}
        {(car.status === CAR_STATUS.RCA_REJECTED) && !isSafety && (
          <SubmitRCAForm car={car} onSubmit={(fd) => submitRCA(car.id, fd)} />
        )}
        {car.status === CAR_STATUS.RCA_SUBMITTED && isSafety && (
          <ReviewCAPForm car={car} onReview={(approved, comments) => reviewCAP(car.id, approved, comments)} />
        )}
        {[CAR_STATUS.RCA_APPROVED, CAR_STATUS.ACTION_SUBMITTED, CAR_STATUS.CLOSED].includes(car.status) && (
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">{t('detail', 'labelRCA')}</p>
                <p className="text-gray-800 whitespace-pre-wrap">{car.rootCauseAnalysis}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">{t('detail', 'labelCAP')}</p>
                <p className="text-gray-800 whitespace-pre-wrap">{car.correctiveActionPlan}</p>
                <p className="text-xs text-gray-500 mt-2">{t('detail', 'labelTarget')} <strong>{fmtDate(car.capTargetDate)}</strong></p>
              </div>
            </div>
            {car.capAttachments?.length > 0 && <FileList files={car.capAttachments} title={t('detail', 'labelSubmitted')} />}
            {car.reviewComments && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-sm">
                <p className="text-xs font-medium text-emerald-700 mb-1">{t('detail', 'reviewBy')} {car.reviewedBy}</p>
                <p className="text-emerald-800">{car.reviewComments}</p>
              </div>
            )}
          </div>
        )}
        {car.status === CAR_STATUS.RCA_SUBMITTED && !isSafety && (
          <div className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-3">
            {t('detail', 'rcaUnderReview')}
          </div>
        )}
      </Section>

      {/* Final Action Section */}
      <Section title={t('detail', 'sec4')} color="bg-purple-700">
        {[CAR_STATUS.DRAFT, CAR_STATUS.ISSUED, CAR_STATUS.RCA_SUBMITTED, CAR_STATUS.RCA_REJECTED].includes(car.status) && (
          <p className="text-sm text-gray-400 italic">{t('detail', 'waitApproval')}</p>
        )}
        {car.status === CAR_STATUS.RCA_APPROVED && isSafety && (
          <p className="text-sm text-gray-500 italic">{t('detail', 'waitFinalSafety')}</p>
        )}
        {car.status === CAR_STATUS.RCA_APPROVED && !isSafety && (
          <FinalActionForm car={car} onSubmit={(fd) => submitFinalAction(car.id, fd)} />
        )}
        {[CAR_STATUS.ACTION_SUBMITTED, CAR_STATUS.CLOSED].includes(car.status) && (
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">{t('detail', 'fieldFinalAction')}</p>
                <p className="text-gray-800 whitespace-pre-wrap">{car.finalActionTaken}</p>
                <p className="text-xs text-gray-500 mt-2">{t('detail', 'finalActionDate')} <strong>{fmtDate(car.finalActionDate)}</strong></p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">{t('detail', 'fieldEvidence')}</p>
                <FileList files={car.finalActionAttachments} />
              </div>
            </div>
          </div>
        )}
      </Section>

      {/* Closure Section */}
      <Section title={t('detail', 'sec5')} color="bg-emerald-700">
        {car.status !== CAR_STATUS.ACTION_SUBMITTED && car.status !== CAR_STATUS.CLOSED && (
          <p className="text-sm text-gray-400 italic">{t('detail', 'waitAction')}</p>
        )}
        {car.status === CAR_STATUS.ACTION_SUBMITTED && isSafety && (
          <CloseCARForm car={car} onClose={(comments) => closeCAR(car.id, comments)} />
        )}
        {car.status === CAR_STATUS.ACTION_SUBMITTED && !isSafety && (
          <p className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-3">
            {t('detail', 'waitFinalStakeholder')}
          </p>
        )}
        {car.status === CAR_STATUS.CLOSED && (
          <div className="flex items-start gap-3 bg-emerald-50 border border-emerald-200 rounded-lg p-4">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-emerald-800">CAR Closed</p>
              <p className="text-xs text-emerald-600 mt-0.5">{t('detail', 'closedBy')} {car.closedBy} on {fmt(car.closedAt)}</p>
              {car.closureComments && <p className="text-sm text-emerald-700 mt-2 italic">{car.closureComments}</p>}
            </div>
          </div>
        )}
      </Section>

      {/* Audit Trail */}
      <Section title={t('detail', 'auditTitle')} color="bg-slate-600" defaultOpen={false}>
        {car.auditTrail?.length ? (
          <AuditTrail entries={car.auditTrail} />
        ) : (
          <p className="text-sm text-gray-400 italic">{t('audit', 'noHistory')}</p>
        )}
      </Section>
    </div>
  );
}
