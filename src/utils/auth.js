export const ROLES = {
  admin:               'Admin',
  accountable_manager: 'Accountable Manager',
  safety_manager:      'Safety Manager',
  safety_officer:      'Safety Officer',
  quality:             'Quality Officer',
  inspector:           'Inspector / Auditor',
  stakeholder:         'Stakeholder / Auditee',
};

export const ROLE_DESCRIPTIONS = {
  admin:               'Full system access + User Management',
  accountable_manager: 'Approve CARs, extension requests, and closures',
  safety_manager:      'Approve CAP, extension requests, and close CARs',
  safety_officer:      'Create CARs, Review CAP, Close CARs',
  quality:             'Create & Issue CARs, Review & Approve CAP',
  inspector:           'Create & Issue CARs',
  stakeholder:         'Submit RCA/CAP & Final Action Evidence',
};

export const ROLE_COLORS = {
  admin:               'bg-purple-100 text-purple-800 border border-purple-300',
  accountable_manager: 'bg-rose-100 text-rose-800 border border-rose-300',
  safety_manager:      'bg-sky-100 text-sky-800 border border-sky-300',
  safety_officer:      'bg-blue-100 text-blue-800 border border-blue-300',
  quality:             'bg-teal-100 text-teal-800 border border-teal-300',
  inspector:           'bg-indigo-100 text-indigo-800 border border-indigo-300',
  stakeholder:         'bg-amber-100 text-amber-800 border border-amber-300',
};

// Highest-priority role wins display
const ROLE_PRIORITY = [
  'admin', 'accountable_manager', 'safety_manager',
  'safety_officer', 'quality', 'inspector', 'stakeholder',
];

/** Normalise: accepts a single string OR an array */
const toArr = (roles) =>
  Array.isArray(roles) ? roles : (roles ? [roles] : []);

/** Returns the highest-priority role for display purposes */
export const getPrimaryRole = (roles) => {
  const arr = toArr(roles);
  for (const r of ROLE_PRIORITY) {
    if (arr.includes(r)) return r;
  }
  return arr[0] || 'stakeholder';
};

/** All non-stakeholder roles — can see the full safety-team UI, create/issue CARs */
export const isSafetyTeam = (roles) =>
  toArr(roles).some((r) =>
    ['admin', 'accountable_manager', 'safety_manager', 'safety_officer', 'quality', 'inspector'].includes(r),
  );

/**
 * Can review/approve CAP, approve or reject extension requests, close CARs.
 * Inspectors (create & issue only) are excluded.
 */
export const canApproveCAP = (roles) =>
  toArr(roles).some((r) =>
    ['admin', 'accountable_manager', 'safety_manager', 'safety_officer', 'quality'].includes(r),
  );

export const isStakeholder = (roles) => toArr(roles).includes('stakeholder');
export const isAdmin       = (roles) => toArr(roles).includes('admin');

const SALT = 'CAR_SALT_v1_';

export async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(SALT + password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function verifyPassword(password, storedHash) {
  return (await hashPassword(password)) === storedHash;
}
