export const CAR_STATUS = {
  DRAFT: 'DRAFT',
  ISSUED: 'ISSUED',
  RCA_SUBMITTED: 'RCA_SUBMITTED',
  RCA_APPROVED: 'RCA_APPROVED',
  RCA_REJECTED: 'RCA_REJECTED',
  ACTION_SUBMITTED: 'ACTION_SUBMITTED',
  CLOSED: 'CLOSED',
};

export const STATUS_LABELS = {
  DRAFT: 'Draft',
  ISSUED: 'Issued',
  RCA_SUBMITTED: 'RCA/CAP Submitted',
  RCA_APPROVED: 'CAP Approved',
  RCA_REJECTED: 'CAP Rejected',
  ACTION_SUBMITTED: 'Action Evidence Submitted',
  CLOSED: 'Closed',
};

export const STATUS_COLORS = {
  DRAFT: 'bg-gray-100 text-gray-700 border-gray-300',
  ISSUED: 'bg-blue-100 text-blue-800 border-blue-300',
  RCA_SUBMITTED: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  RCA_APPROVED: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  RCA_REJECTED: 'bg-red-100 text-red-800 border-red-300',
  ACTION_SUBMITTED: 'bg-purple-100 text-purple-800 border-purple-300',
  CLOSED: 'bg-slate-100 text-slate-700 border-slate-300',
};

export const PRIORITY_COLORS = {
  Critical: 'bg-red-600 text-white',
  High: 'bg-orange-500 text-white',
  Medium: 'bg-yellow-500 text-white',
  Low: 'bg-green-500 text-white',
};

export const CAR_TYPES = [
  'Safety Case',
  'Inspection Finding',
  'Audit Finding',
  'Incident Report',
  'Observation',
];

export const PRIORITY_LEVELS = ['Critical', 'High', 'Medium', 'Low'];

export const STAKEHOLDER_ORG = [
  'Airside Operations',
  'Ground Handling',
  'Terminal Operations',
  'Engineering & Maintenance',
  'Security',
  'Fire & Rescue',
  'Air Traffic Control',
  'Cargo Operations',
  'Fuel Services',
  'Concessions',
  'Other',
];
