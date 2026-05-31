import { useState } from 'react';
import { format } from 'date-fns';
import {
  ArrowLeft, Send, CheckCircle2, XCircle, Lock, AlertTriangle,
  ClipboardList, User, Calendar, MapPin, Hash, Building2,
  History, ChevronDown, ChevronUp, Trash2
} from 'lucide-react';
import { useCARContext } from '../context/CARContext';
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
    if (!form.rootCauseAnalysis.trim()) e.rca = 'Root cause analysis is required';
    if (!form.correctiveActionPlan.trim()) e.cap = 'Corrective action plan is required';
    if (!form.capTargetDate) e.date = 'Target completion date is required';
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
            <p className="font-medium">Previous submission was rejected</p>
            {car.reviewComments && <p className="mt-1 text-red-600">{car.reviewComments}</p>}
            <p className="mt-1 text-red-500">Please revise and resubmit.</p>
          </div>
        </div>
      )}
      <div>
        <label className={lbl}>Root Cause Analysis <span className="text-red-500">*</span></label>
        <Textarea
          rows={5}
          value={form.rootCauseAnalysis}
          onChange={(v) => setForm((p) => ({ ...p, rootCauseAnalysis: v }))}
          placeholder="Describe the root cause(s) of the finding. Consider contributing factors, systemic issues, and why the issue occurred..."
        />
        {errors.rca && <p className="mt-1 text-xs text-red-500">{errors.rca}</p>}
      </div>
      <div>
        <label className={lbl}>Corrective Action Plan <span className="text-red-500">*</span></label>
        <Textarea
          rows={5}
          value={form.correctiveActionPlan}
          onChange={(v) => setForm((p) => ({ ...p, correctiveActionPlan: v }))}
          placeholder="Describe the specific corrective actions to be taken, who is responsible, and how they will prevent recurrence..."
        />
        {errors.cap && <p className="mt-1 text-xs text-red-500">{errors.cap}</p>}
      </div>
      <div>
        <label className={lbl}>Target Completion Date <span className="text-red-500">*</span></label>
        <input
          type="date"
          value={form.capTargetDate}
          onChange={(e) => setForm((p) => ({ ...p, capTargetDate: e.target.value }))}
          className={`${inp} w-auto`}
        />
        {errors.date && <p className="mt-1 text-xs text-red-500">{errors.date}</p>}
      </div>
      <div>
        <label className={lbl}>Supporting Documents</label>
        <FileUpload
          files={form.capAttachments}
          onChange={(files) => setForm((p) => ({ ...p, capAttachments: files }))}
          label="Attach RCA report, action plan documents, or supporting evidence"
          maxMB={20}
        />
      </div>
      <div>
        <label className={lbl}>Submitted By</label>
        <input type="text" value={form.submittedBy} onChange={(e) => setForm((p) => ({ ...p, submittedBy: e.target.value }))} className={`${inp} w-auto`} />
      </div>
      <button
        onClick={handleSubmit}
        className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors"
      >
        <Send className="w-4 h-4" /> Submit RCA & Corrective Action Plan
      </button>
    </div>
  );
}

// ── CAP Review form (safety team) ─────────────────────────────────────────────
function ReviewCAPForm({ car, onReview }) {
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
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Root Cause Analysis</p>
          <p className="text-gray-800 whitespace-pre-wrap">{car.rootCauseAnalysis}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Corrective Action Plan</p>
          <p className="text-gray-800 whitespace-pre-wrap">{car.correctiveActionPlan}</p>
          {car.capTargetDate && (
            <p className="text-xs text-gray-500 mt-2">Target date: <strong>{fmtDate(car.capTargetDate)}</strong></p>
          )}
        </div>
      </div>
      {car.capAttachments?.length > 0 && (
        <FileList files={car.capAttachments} title="Submitted Attachments" />
      )}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Review Comments</label>
        <Textarea
          value={comments}
          onChange={setComments}
          placeholder="Provide feedback or justification for your decision. Required if rejecting."
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
          <XCircle className="w-4 h-4" /> Reject
        </button>
        <button
          onClick={() => handleDecide(true)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
            decision === true ? 'bg-emerald-600 text-white border-emerald-600' : 'border-emerald-300 text-emerald-600 hover:bg-emerald-50'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" /> Approve
        </button>
        {decision !== null && (
          <button
            onClick={handleConfirm}
            className="ml-auto flex items-center gap-2 bg-slate-700 hover:bg-slate-800 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Confirm {decision ? 'Approval' : 'Rejection'}
          </button>
        )}
      </div>
    </div>
  );
}

// ── Final Action form (stakeholder) ──────────────────────────────────────────
function FinalActionForm({ car, onSubmit }) {
  const { currentUser } = useCARContext();
  const [form, setForm] = useState({
    finalActionTaken: '',
    finalActionDate: new Date().toISOString().split('T')[0],
    finalActionAttachments: [],
    submittedBy: currentUser,
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.finalActionTaken.trim()) e.action = 'Description of action taken is required';
    if (!form.finalActionDate) e.date = 'Action date is required';
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
        <p>Your Corrective Action Plan was approved. Please describe the final actions taken with supporting evidence.</p>
      </div>
      <div>
        <label className={lbl}>Final Action Taken <span className="text-red-500">*</span></label>
        <Textarea
          rows={5}
          value={form.finalActionTaken}
          onChange={(v) => setForm((p) => ({ ...p, finalActionTaken: v }))}
          placeholder="Describe all actions that were carried out to correct the finding, including dates, personnel involved, and verification steps..."
        />
        {errors.action && <p className="mt-1 text-xs text-red-500">{errors.action}</p>}
      </div>
      <div>
        <label className={lbl}>Action Completion Date <span className="text-red-500">*</span></label>
        <input
          type="date"
          value={form.finalActionDate}
          onChange={(e) => setForm((p) => ({ ...p, finalActionDate: e.target.value }))}
          className={`${inp} w-auto`}
        />
        {errors.date && <p className="mt-1 text-xs text-red-500">{errors.date}</p>}
      </div>
      <div>
        <label className={lbl}>Evidence / Supporting Documents <span className="text-red-500">*</span></label>
        <FileUpload
          files={form.finalActionAttachments}
          onChange={(files) => setForm((p) => ({ ...p, finalActionAttachments: files }))}
          label="Attach photos, work orders, certificates, or any evidence of action taken"
          maxMB={20}
        />
        <p className="text-xs text-amber-600 mt-1">At least one evidence document is strongly recommended</p>
      </div>
      <div>
        <label className={lbl}>Submitted By</label>
        <input type="text" value={form.submittedBy} onChange={(e) => setForm((p) => ({ ...p, submittedBy: e.target.value }))} className={`${inp} w-auto`} />
      </div>
      <button
        onClick={handleSubmit}
        className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors"
      >
        <Send className="w-4 h-4" /> Submit Final Action Evidence
      </button>
    </div>
  );
}

// ── Close CAR form (safety team) ─────────────────────────────────────────────
function CloseCARForm({ car, onClose }) {
  const [comments, setComments] = useState('');

  return (
    <div className="space-y-4 mt-2">
      <div className="grid sm:grid-cols-2 gap-4 text-sm">
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Final Action Taken</p>
          <p className="text-gray-800 whitespace-pre-wrap">{car.finalActionTaken}</p>
          <p className="text-xs text-gray-500 mt-2">Action date: <strong>{fmtDate(car.finalActionDate)}</strong></p>
        </div>
        <div className="space-y-2">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Evidence Submitted</p>
          <FileList files={car.finalActionAttachments} />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Closure Comments (optional)</label>
        <Textarea value={comments} onChange={setComments} placeholder="Add any final notes or observations for closure..." rows={3} />
      </div>
      <button
        onClick={() => onClose(comments)}
        className="flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors"
      >
        <Lock className="w-4 h-4" /> Accept & Close CAR
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
    if (confirm(`Delete ${car.carNumber}? This cannot be undone.`)) {
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
                <AlertTriangle className="w-3 h-3" /> Overdue
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
              <Send className="w-3.5 h-3.5" /> Issue
            </button>
            <button onClick={handleDelete} className="p-1.5 rounded-lg border border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-200 transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Finding Info */}
      <Section title="1. Finding / Issue Information" color="bg-slate-700">
        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <InfoRow icon={Hash} label="CAR Type" value={car.carType} />
          <InfoRow icon={Calendar} label="Incident / Inspection Date" value={fmtDate(car.incidentDate)} />
          <InfoRow icon={MapPin} label="Finding Location" value={car.findingLocation} />
          <InfoRow icon={Hash} label="Reference Number" value={car.referenceNumber} />
          <InfoRow icon={Calendar} label="Issued" value={fmt(car.issuedAt)} />
          <InfoRow icon={Calendar} label="Response Due" value={fmtDate(car.dueDate)} valueClass={overdue ? 'text-red-600' : ''} />
        </div>
        <div className="mb-4">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Finding / Issue Narrative</p>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
            {car.findingNarrative}
          </div>
        </div>
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Attachments</p>
          <FileList files={car.findingAttachments} />
        </div>
      </Section>

      {/* Responsible Party */}
      <Section title="2. Responsible Party" color="bg-amber-600">
        <div className="grid sm:grid-cols-2 gap-4">
          <InfoRow icon={User} label="Responsible Person" value={car.responsiblePerson} />
          <InfoRow icon={Building2} label="Organization" value={car.responsibleOrganization} />
          <InfoRow icon={User} label="Email" value={car.responsibleEmail || '—'} />
          <InfoRow icon={User} label="CAR Issued By" value={car.issuedBy} />
        </div>
      </Section>

      {/* RCA / CAP Section */}
      <Section title="3. Root Cause Analysis & Corrective Action Plan" color="bg-yellow-600">
        {car.status === CAR_STATUS.DRAFT && (
          <p className="text-sm text-gray-400 italic">CAR has not been issued yet.</p>
        )}
        {car.status === CAR_STATUS.ISSUED && isSafety && (
          <p className="text-sm text-gray-500 italic">Awaiting submission from responsible party.</p>
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
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Root Cause Analysis</p>
                <p className="text-gray-800 whitespace-pre-wrap">{car.rootCauseAnalysis}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Corrective Action Plan</p>
                <p className="text-gray-800 whitespace-pre-wrap">{car.correctiveActionPlan}</p>
                <p className="text-xs text-gray-500 mt-2">Target: <strong>{fmtDate(car.capTargetDate)}</strong></p>
              </div>
            </div>
            {car.capAttachments?.length > 0 && <FileList files={car.capAttachments} title="CAP Attachments" />}
            {car.reviewComments && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-sm">
                <p className="text-xs font-medium text-emerald-700 mb-1">Review Comments by {car.reviewedBy}</p>
                <p className="text-emerald-800">{car.reviewComments}</p>
              </div>
            )}
          </div>
        )}
        {car.status === CAR_STATUS.RCA_SUBMITTED && !isSafety && (
          <div className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-3">
            Your RCA/CAP has been submitted and is under review by the safety team.
          </div>
        )}
      </Section>

      {/* Final Action Section */}
      <Section title="4. Final Action Taken" color="bg-purple-700">
        {[CAR_STATUS.DRAFT, CAR_STATUS.ISSUED, CAR_STATUS.RCA_SUBMITTED, CAR_STATUS.RCA_REJECTED].includes(car.status) && (
          <p className="text-sm text-gray-400 italic">Awaiting CAP approval before final action submission.</p>
        )}
        {car.status === CAR_STATUS.RCA_APPROVED && isSafety && (
          <p className="text-sm text-gray-500 italic">Awaiting final action submission from responsible party.</p>
        )}
        {car.status === CAR_STATUS.RCA_APPROVED && !isSafety && (
          <FinalActionForm car={car} onSubmit={(fd) => submitFinalAction(car.id, fd)} />
        )}
        {[CAR_STATUS.ACTION_SUBMITTED, CAR_STATUS.CLOSED].includes(car.status) && (
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Actions Taken</p>
                <p className="text-gray-800 whitespace-pre-wrap">{car.finalActionTaken}</p>
                <p className="text-xs text-gray-500 mt-2">Date: <strong>{fmtDate(car.finalActionDate)}</strong></p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Evidence Submitted</p>
                <FileList files={car.finalActionAttachments} />
              </div>
            </div>
          </div>
        )}
      </Section>

      {/* Closure Section */}
      <Section title="5. CAR Closure" color="bg-emerald-700">
        {car.status !== CAR_STATUS.ACTION_SUBMITTED && car.status !== CAR_STATUS.CLOSED && (
          <p className="text-sm text-gray-400 italic">Available once final action evidence is submitted.</p>
        )}
        {car.status === CAR_STATUS.ACTION_SUBMITTED && isSafety && (
          <CloseCARForm car={car} onClose={(comments) => closeCAR(car.id, comments)} />
        )}
        {car.status === CAR_STATUS.ACTION_SUBMITTED && !isSafety && (
          <p className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-3">
            Final action submitted. Awaiting safety team review and closure.
          </p>
        )}
        {car.status === CAR_STATUS.CLOSED && (
          <div className="flex items-start gap-3 bg-emerald-50 border border-emerald-200 rounded-lg p-4">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-emerald-800">CAR Closed</p>
              <p className="text-xs text-emerald-600 mt-0.5">Closed by {car.closedBy} on {fmt(car.closedAt)}</p>
              {car.closureComments && <p className="text-sm text-emerald-700 mt-2 italic">{car.closureComments}</p>}
            </div>
          </div>
        )}
      </Section>

      {/* Audit Trail */}
      <Section title="Audit Trail / History" color="bg-slate-600" defaultOpen={false}>
        {car.auditTrail?.length ? (
          <AuditTrail entries={car.auditTrail} />
        ) : (
          <p className="text-sm text-gray-400 italic">No history yet.</p>
        )}
      </Section>
    </div>
  );
}
