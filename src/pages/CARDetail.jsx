import { useState } from 'react';
import { format } from 'date-fns';
import {
  ArrowLeft, Send, CheckCircle2, XCircle, Lock, AlertTriangle,
  ClipboardList, User, Calendar, MapPin, Hash, Building2,
  History, ChevronDown, ChevronUp, Trash2, Briefcase, Phone, Layers, Pencil,
  Clock, CalendarCheck, CalendarX
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
    'CAR Created':           'bg-slate-500',
    'CAR Issued':            'bg-blue-500',
    'CAR Updated':           'bg-sky-400',
    'RCA/CAP Submitted':     'bg-yellow-500',
    'CAP Approved':          'bg-emerald-500',
    'CAP Rejected':          'bg-red-500',
    'Final Action Submitted':'bg-purple-500',
    'CAR Closed':            'bg-emerald-700',
    'Extension Requested':   'bg-orange-400',
    'Extension Approved':    'bg-teal-500',
    'Extension Rejected':    'bg-rose-500',
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

// ── Extension: request form (stakeholder) ────────────────────────────────────
function RequestExtensionForm({ car, onSubmit }) {
  const t = useT();
  const [form, setForm] = useState({ reason: '', proposedDate: '' });
  const [errors, setErrors] = useState({});
  const inp = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400';
  const lbl = 'block text-sm font-medium text-gray-700 mb-1';

  const handleSubmit = () => {
    const e = {};
    if (!form.reason.trim()) e.reason = t('extension', 'fieldReason') + ' is required';
    if (!form.proposedDate) e.proposedDate = t('extension', 'fieldProposedDate') + ' is required';
    if (form.proposedDate && form.proposedDate <= (car.dueDate || '')) {
      e.proposedDate = 'Proposed date must be after the current due date';
    }
    if (Object.keys(e).length) { setErrors(e); return; }
    onSubmit(form);
  };

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 space-y-3">
      <p className="text-sm font-medium text-gray-700">{t('extension', 'btnRequest')}</p>
      <p className="text-xs text-gray-500">
        {t('extension', 'currentDue')}: <strong>{fmtDate(car.dueDate)}</strong>
      </p>
      <div>
        <label className={lbl}>{t('extension', 'fieldReason')} <span className="text-red-500">*</span></label>
        <textarea
          rows={3}
          value={form.reason}
          onChange={(e) => setForm((p) => ({ ...p, reason: e.target.value }))}
          placeholder={t('extension', 'fieldReasonPlaceholder')}
          className={`${inp} resize-none`}
        />
        {errors.reason && <p className="mt-1 text-xs text-red-500">{errors.reason}</p>}
      </div>
      <div>
        <label className={lbl}>{t('extension', 'fieldProposedDate')} <span className="text-red-500">*</span></label>
        <input
          type="date"
          value={form.proposedDate}
          min={car.dueDate || undefined}
          onChange={(e) => setForm((p) => ({ ...p, proposedDate: e.target.value }))}
          className={inp}
        />
        {errors.proposedDate && <p className="mt-1 text-xs text-red-500">{errors.proposedDate}</p>}
      </div>
      <button
        onClick={handleSubmit}
        className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
      >
        <Clock className="w-4 h-4" /> {t('extension', 'btnSubmit')}
      </button>
    </div>
  );
}

// ── Extension: review form (safety team / canApprove) ────────────────────────
function ReviewExtensionForm({ req, onReview }) {
  const t = useT();
  const [comments, setComments] = useState('');
  const [confirm, setConfirm] = useState(null); // 'approve' | 'reject'
  const inp = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400';

  if (confirm) {
    const isApprove = confirm === 'approve';
    return (
      <div className={`rounded-lg border p-4 space-y-3 ${isApprove ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
        <p className={`text-sm font-medium ${isApprove ? 'text-emerald-800' : 'text-red-800'}`}>
          {isApprove
            ? `${t('extension', 'btnConfirmApprove')} ${fmtDate(req.proposedDate)}`
            : t('extension', 'btnConfirmReject')}
        </p>
        <textarea
          rows={2}
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          placeholder={t('extension', 'reviewCommentsPlaceholder')}
          className={`${inp} resize-none`}
        />
        <div className="flex gap-2">
          <button onClick={() => setConfirm(null)}
            className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button
            onClick={() => onReview(req.id, isApprove, comments)}
            className={`px-4 py-1.5 text-sm text-white rounded-lg transition-colors ${isApprove ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'}`}
          >
            {isApprove ? t('extension', 'btnApprove') : t('extension', 'btnReject')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-3">
      <p className="text-sm font-semibold text-amber-800 flex items-center gap-2">
        <Clock className="w-4 h-4" /> {t('extension', 'pending')}
      </p>
      <div className="grid sm:grid-cols-2 gap-2 text-xs text-amber-700 bg-white/60 rounded p-3 border border-amber-100">
        <span>{t('extension', 'requestedBy')}: <strong>{req.requestedBy}</strong></span>
        <span>{t('extension', 'proposedDate')}: <strong>{fmtDate(req.proposedDate)}</strong></span>
        <span className="sm:col-span-2">{t('extension', 'reason')}: {req.reason}</span>
      </div>
      <div className="flex gap-2">
        <button onClick={() => setConfirm('reject')}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-red-200 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
          <CalendarX className="w-3.5 h-3.5" /> {t('extension', 'btnReject')}
        </button>
        <button onClick={() => setConfirm('approve')}
          className="flex items-center gap-1.5 px-4 py-1.5 text-sm bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors">
          <CalendarCheck className="w-3.5 h-3.5" /> {t('extension', 'btnApprove')}
        </button>
      </div>
    </div>
  );
}

// ── Main CARDetail ─────────────────────────────────────────────────────────────
export function CARDetail({ carId, onNavigate }) {
  const { cars, role, canApprove, issueCAR, submitRCA, reviewCAP, submitFinalAction, closeCAR,
          requestExtension, reviewExtension, deleteCAR } = useCARContext();
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
        {isSafety && [CAR_STATUS.DRAFT, CAR_STATUS.ISSUED, CAR_STATUS.RCA_REJECTED].includes(car.status) && (
          <div className="flex gap-2 shrink-0">
            {/* Edit — available for DRAFT, ISSUED, RCA_REJECTED */}
            <button
              onClick={() => onNavigate('edit', car.id)}
              className="flex items-center gap-1.5 border border-gray-200 text-gray-600 hover:text-slate-800 hover:bg-slate-50 hover:border-slate-300 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" /> {t('detail', 'btnEdit')}
            </button>
            {/* Issue — DRAFT only */}
            {car.status === CAR_STATUS.DRAFT && (
              <button
                onClick={() => issueCAR(car.id)}
                className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
              >
                <Send className="w-3.5 h-3.5" /> {t('detail', 'btnIssue')}
              </button>
            )}
            {/* Delete — DRAFT only */}
            {car.status === CAR_STATUS.DRAFT && (
              <button
                onClick={handleDelete}
                className="p-1.5 rounded-lg border border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-200 transition-colors"
                title={t('detail', 'btnDelete')}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
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
          <InfoRow
            icon={Calendar}
            label={t('detail', 'fieldDue')}
            value={
              <span className="flex items-center gap-1.5">
                <span className={overdue ? 'text-red-600 font-medium' : ''}>{fmtDate(car.dueDate)}</span>
                {car.extensionRequests?.some((r) => r.status === 'approved') && (
                  <span className="text-xs bg-teal-100 text-teal-700 border border-teal-300 px-1.5 py-0.5 rounded-full font-medium">
                    {t('extension', 'extended')}
                  </span>
                )}
              </span>
            }
          />
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
        {/* Multiple responsible persons (new format) */}
        {car.responsibleUsers?.length > 0 ? (
          <div className="space-y-3 mb-4">
            {car.responsibleUsers.map((u, idx) => (
              <div key={u.id || idx} className="bg-amber-50/60 border border-amber-200 rounded-lg p-4 grid sm:grid-cols-2 gap-3">
                <InfoRow icon={User}      label={t('detail', 'fieldPerson')}   value={u.name} />
                <InfoRow icon={Briefcase} label={t('detail', 'fieldPosition')}  value={u.position} />
                <InfoRow icon={Layers}    label={t('detail', 'fieldOrgType')}   value={u.orgType} />
                <InfoRow icon={Building2} label={t('detail', 'fieldOrg')}       value={u.orgName || u.organization} />
                <InfoRow icon={Hash}      label={t('detail', 'fieldDept')}      value={u.department} />
                <InfoRow icon={User}      label={t('detail', 'fieldEmail')}     value={u.email} />
                <InfoRow icon={Phone}     label={t('detail', 'fieldContact')}   value={u.contactNumber} />
              </div>
            ))}
          </div>
        ) : (
          /* Legacy single-person fallback */
          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <InfoRow icon={User}      label={t('detail', 'fieldPerson')}   value={car.responsiblePerson} />
            <InfoRow icon={Briefcase} label={t('detail', 'fieldPosition')}  value={car.responsiblePosition} />
            <InfoRow icon={Layers}    label={t('detail', 'fieldOrgType')}   value={car.responsibleOrgType} />
            <InfoRow icon={Building2} label={t('detail', 'fieldOrg')}       value={car.responsibleOrgName || car.responsibleOrganization} />
            <InfoRow icon={Hash}      label={t('detail', 'fieldDept')}      value={car.responsibleDepartment} />
            <InfoRow icon={User}      label={t('detail', 'fieldEmail')}     value={car.responsibleEmail || '—'} />
            <InfoRow icon={Phone}     label={t('detail', 'fieldContact')}   value={car.responsibleContactNumber} />
          </div>
        )}
        <div className="pt-3 border-t border-gray-100">
          <InfoRow icon={User} label={t('detail', 'fieldIssuedBy')} value={car.issuedBy} />
        </div>
      </Section>

      {/* ── Extension Request Section ── */}
      {(() => {
        const extensionRequests = car.extensionRequests || [];
        const pendingReq = extensionRequests.find((r) => r.status === 'pending');
        const history = extensionRequests.filter((r) => r.status !== 'pending');
        // Stakeholder can request when actively working and no pending request
        const canRequest = !isSafety &&
          [CAR_STATUS.ISSUED, CAR_STATUS.RCA_REJECTED, CAR_STATUS.RCA_APPROVED].includes(car.status) &&
          !pendingReq;
        const showSection = canRequest || pendingReq || history.length > 0;
        if (!showSection) return null;
        return (
          <Section title={t('extension', 'sectionTitle')} color="bg-orange-600" defaultOpen={!!pendingReq}>
            <div className="space-y-4">
              {/* Pending — stakeholder sees "under review" */}
              {pendingReq && !isSafety && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-1">
                  <p className="text-sm font-medium text-amber-800 flex items-center gap-2">
                    <Clock className="w-4 h-4" /> {t('extension', 'pending')}
                  </p>
                  <p className="text-xs text-amber-600">{t('extension', 'pendingDesc')}</p>
                  <div className="mt-2 text-xs text-amber-700 space-y-0.5">
                    <p>{t('extension', 'proposedDate')}: <strong>{fmtDate(pendingReq.proposedDate)}</strong></p>
                    <p>{t('extension', 'reason')}: {pendingReq.reason}</p>
                  </div>
                </div>
              )}
              {/* Pending — safety team reviews */}
              {pendingReq && isSafety && canApprove && (
                <ReviewExtensionForm
                  req={pendingReq}
                  onReview={(reqId, approved, comments) => reviewExtension(car.id, reqId, approved, comments)}
                />
              )}
              {pendingReq && isSafety && !canApprove && (
                <p className="text-sm text-gray-400 italic">An extension request is pending approval.</p>
              )}
              {/* Request form — stakeholder */}
              {canRequest && (
                <RequestExtensionForm
                  car={car}
                  onSubmit={(data) => requestExtension(car.id, data)}
                />
              )}
              {/* History */}
              {history.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    {t('extension', 'history')}
                  </p>
                  <div className="space-y-2">
                    {[...history].reverse().map((r) => {
                      const approved = r.status === 'approved';
                      return (
                        <div key={r.id} className={`rounded-lg p-3 text-xs border ${approved ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
                          <div className="flex items-center justify-between mb-1">
                            <span className={`font-semibold ${approved ? 'text-emerald-700' : 'text-red-700'}`}>
                              {approved ? t('extension', 'approved') : t('extension', 'rejected')}
                            </span>
                            <span className="text-gray-400">{fmt(r.reviewedAt)}</span>
                          </div>
                          <p className="text-gray-600">
                            {t('extension', 'proposedDate')}: {fmtDate(r.proposedDate)} ·{' '}
                            {t('extension', 'requestedBy')}: {r.requestedBy}
                          </p>
                          {r.reviewComments && (
                            <p className="mt-1 italic text-gray-500">{r.reviewComments}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </Section>
        );
      })()}

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
        {car.status === CAR_STATUS.RCA_SUBMITTED && isSafety && canApprove && (
          <ReviewCAPForm car={car} onReview={(approved, comments) => reviewCAP(car.id, approved, comments)} />
        )}
        {car.status === CAR_STATUS.RCA_SUBMITTED && isSafety && !canApprove && (
          <p className="text-sm text-gray-500 italic">{t('detail', 'waitRCA')}</p>
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
        {car.status === CAR_STATUS.ACTION_SUBMITTED && isSafety && canApprove && (
          <CloseCARForm car={car} onClose={(comments) => closeCAR(car.id, comments)} />
        )}
        {car.status === CAR_STATUS.ACTION_SUBMITTED && isSafety && !canApprove && (
          <p className="text-sm text-gray-500 italic">{t('detail', 'waitAction')}</p>
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
