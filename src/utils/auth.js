export const ROLES = {
  admin: 'Admin',
  safety_officer: 'Safety Officer',
  inspector: 'Inspector / Auditor',
  stakeholder: 'Stakeholder / Auditee',
};

export const ROLE_COLORS = {
  admin: 'bg-purple-100 text-purple-800 border border-purple-300',
  safety_officer: 'bg-blue-100 text-blue-800 border border-blue-300',
  inspector: 'bg-indigo-100 text-indigo-800 border border-indigo-300',
  stakeholder: 'bg-amber-100 text-amber-800 border border-amber-300',
};

/** Admin + Safety Officer + Inspector can create/review/close CARs */
export const isSafetyTeam = (role) =>
  ['admin', 'safety_officer', 'inspector'].includes(role);

export const isStakeholder = (role) => role === 'stakeholder';
export const isAdmin = (role) => role === 'admin';

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
