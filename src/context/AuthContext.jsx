import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { v4 as uuid } from 'uuid';
import {
  loadData, saveData, loadSession, saveSession, clearSession,
} from '../utils/storage';
import { hashPassword, verifyPassword, getPrimaryRole } from '../utils/auth';

const AuthContext = createContext(null);

// ── Default seed accounts (created on first launch) ───────────────────────────
const SEED_USERS = [
  { username: 'admin',      password: 'admin123',   name: 'System Administrator', email: 'admin@airport.com',       roles: ['admin'],                       orgType: 'Airport Department',       orgName: 'Administration',           department: 'IT / Administration', position: 'System Administrator', contactNumber: '' },
  { username: 'amgr1',      password: 'amgr123',    name: 'Accountable Manager',  email: 'amgr@airport.com',        roles: ['accountable_manager'],         orgType: 'Airport Department',       orgName: 'AOT Executive Office',     department: 'Executive',           position: 'Accountable Manager',  contactNumber: '' },
  { username: 'smgr1',      password: 'smgr123',    name: 'Safety Manager',       email: 'smgr@airport.com',        roles: ['safety_manager'],              orgType: 'Airport Department',       orgName: 'AOT Safety Department',    department: 'Safety Management',   position: 'Safety Manager',       contactNumber: '' },
  { username: 'safety1',    password: 'safety123',  name: 'Safety Officer',       email: 'safety@airport.com',      roles: ['safety_officer'],              orgType: 'Airport Department',       orgName: 'AOT Safety Department',    department: 'Safety Management',   position: 'Safety Officer',       contactNumber: '' },
  { username: 'quality1',   password: 'quality123', name: 'Quality Officer',      email: 'quality@airport.com',     roles: ['quality'],                     orgType: 'Airport Department',       orgName: 'AOT Safety Department',    department: 'Quality Assurance',   position: 'Quality Officer',      contactNumber: '' },
  { username: 'inspector1', password: 'inspect123', name: 'Safety Inspector',     email: 'inspector@airport.com',   roles: ['inspector'],                   orgType: 'Airport Department',       orgName: 'AOT Safety Department',    department: 'Safety Inspection',   position: 'Safety Inspector',     contactNumber: '' },
  { username: 'auditor1',   password: 'audit123',   name: 'Quality Auditor',      email: 'auditor@airport.com',     roles: ['inspector'],                   orgType: 'Airport Department',       orgName: 'AOT Safety Department',    department: 'Quality Assurance',   position: 'Quality Auditor',      contactNumber: '' },
  { username: 'stake1',     password: 'stake123',   name: 'Airside Ops Manager',  email: 'airside@airport.com',     roles: ['stakeholder'],                 orgType: 'Airport Department',       orgName: 'Airside Operations Dept',  department: 'Operations',          position: 'Operations Manager',   contactNumber: '' },
  { username: 'stake2',     password: 'stake123',   name: 'Ground Handling Mgr',  email: 'ground@airport.com',      roles: ['stakeholder'],                 orgType: 'Ground Handling Company',  orgName: 'Ground Handling Dept',     department: 'Ramp Services',       position: 'Department Manager',   contactNumber: '' },
  { username: 'stake3',     password: 'stake123',   name: 'Terminal Ops Manager', email: 'terminal@airport.com',    roles: ['stakeholder'],                 orgType: 'Terminal Operations',      orgName: 'Terminal Operations Dept', department: 'Passenger Services',  position: 'Operations Manager',   contactNumber: '' },
];

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // ── Init: seed users + restore session ──────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      let data = loadData();

      if (!data.users || data.users.length === 0) {
        const seeded = [];
        for (const u of SEED_USERS) {
          const roles = u.roles || (u.role ? [u.role] : ['stakeholder']);
        seeded.push({
            id: uuid(),
            username: u.username,
            passwordHash: await hashPassword(u.password),
            name: u.name,
            email: u.email,
            roles,
            role: getPrimaryRole(roles),   // kept for display fallback
            organization: u.orgName || u.organization || '',
            orgType:       u.orgType       || '',
            orgName:       u.orgName       || u.organization || '',
            department:    u.department    || '',
            position:      u.position      || '',
            contactNumber: u.contactNumber || '',
            isActive: true,
            createdAt: new Date().toISOString(),
          });
        }
        data = { ...data, users: seeded };
        saveData(data);
      }

      // ── Migrate legacy users: role (string) → roles (array) ──────
      let migrated = false;
      const migratedUsers = data.users.map((u) => {
        if (!Array.isArray(u.roles)) {
          migrated = true;
          return { ...u, roles: u.role ? [u.role] : ['stakeholder'] };
        }
        return u;
      });
      if (migrated) {
        data = { ...data, users: migratedUsers };
        saveData(data);
      }

      setUsers(data.users);

      const sessionId = loadSession();
      if (sessionId) {
        const user = data.users.find((u) => u.id === sessionId && u.isActive);
        if (user) {
          const { passwordHash, ...safe } = user;
          setCurrentUser(safe);
        } else {
          clearSession();
        }
      }

      setLoading(false);
    };
    init();
  }, []);

  // ── Auth ──────────────────────────────────────────────────────────────────────
  const login = useCallback(async (username, password) => {
    const data = loadData();
    const user = data.users.find(
      (u) => u.username.toLowerCase() === username.toLowerCase(),
    );
    if (!user) return { success: false, error: 'userNotFound' };
    if (!user.isActive) return { success: false, error: 'userInactive' };
    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) return { success: false, error: 'invalidPassword' };
    saveSession(user.id);
    const { passwordHash, ...safe } = user;
    setCurrentUser(safe);
    return { success: true };
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setCurrentUser(null);
  }, []);

  // ── User CRUD (admin) ─────────────────────────────────────────────────────────
  const refreshUsers = useCallback(() => {
    const data = loadData();
    setUsers(data.users || []);
  }, []);

  const createUser = useCallback(async ({ username, password, name, email, roles, role, organization, orgType, orgName, department, position, contactNumber }) => {
    const data = loadData();
    if (data.users.some((u) => u.username.toLowerCase() === username.toLowerCase())) {
      return { success: false, error: 'usernameTaken' };
    }
    const resolvedRoles = roles || (role ? [role] : ['stakeholder']);
    const resolvedOrg = (orgName || organization || '').trim();
    const newUser = {
      id: uuid(),
      username: username.trim(),
      passwordHash: await hashPassword(password),
      name: name.trim(),
      email: email.trim(),
      roles:         resolvedRoles,
      role:          getPrimaryRole(resolvedRoles),
      organization:  resolvedOrg,
      orgType:       (orgType       || '').trim(),
      orgName:       resolvedOrg,
      department:    (department    || '').trim(),
      position:      (position      || '').trim(),
      contactNumber: (contactNumber || '').trim(),
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    const updated = { ...data, users: [...data.users, newUser] };
    saveData(updated);
    setUsers(updated.users);
    return { success: true };
  }, []);

  const updateUser = useCallback(async (userId, changes) => {
    const data = loadData();
    const idx = data.users.findIndex((u) => u.id === userId);
    if (idx === -1) return { success: false };

    // Username uniqueness check (excluding this user)
    if (changes.username) {
      const taken = data.users.some(
        (u) => u.id !== userId && u.username.toLowerCase() === changes.username.toLowerCase(),
      );
      if (taken) return { success: false, error: 'usernameTaken' };
    }

    let updated = { ...data.users[idx], ...changes };
    if (changes.password) {
      updated.passwordHash = await hashPassword(changes.password);
      delete updated.password;
    }
    // Keep primary-role display field in sync
    if (changes.roles) {
      updated.role = getPrimaryRole(changes.roles);
    }

    const newUsers = [...data.users];
    newUsers[idx] = updated;
    saveData({ ...data, users: newUsers });
    setUsers(newUsers);

    if (currentUser?.id === userId) {
      const { passwordHash, ...safe } = updated;
      setCurrentUser(safe);
    }

    return { success: true };
  }, [currentUser]);

  const deleteUser = useCallback((userId) => {
    const data = loadData();
    const newUsers = data.users.filter((u) => u.id !== userId);
    saveData({ ...data, users: newUsers });
    setUsers(newUsers);
  }, []);

  const getStakeholderUsers = useCallback(() =>
    users.filter((u) => {
      const roles = u.roles || [u.role];
      return roles.includes('stakeholder') && u.isActive;
    }),
  [users]);

  // ── Self-service password change ──────────────────────────────────────────────
  const changePassword = useCallback(async (currentPasswordInput, newPasswordInput) => {
    const data = loadData();
    const user = data.users.find((u) => u.id === currentUser?.id);
    if (!user) return { success: false, error: 'userNotFound' };
    const valid = await verifyPassword(currentPasswordInput, user.passwordHash);
    if (!valid) return { success: false, error: 'wrongCurrentPassword' };
    return updateUser(currentUser.id, { password: newPasswordInput });
  }, [currentUser, updateUser]);

  return (
    <AuthContext.Provider value={{
      currentUser,
      users,
      loading,
      login,
      logout,
      changePassword,
      createUser,
      updateUser,
      deleteUser,
      refreshUsers,
      getStakeholderUsers,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
