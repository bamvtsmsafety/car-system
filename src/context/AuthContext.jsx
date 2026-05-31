import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { v4 as uuid } from 'uuid';
import {
  loadData, saveData, loadSession, saveSession, clearSession,
} from '../utils/storage';
import { hashPassword, verifyPassword } from '../utils/auth';

const AuthContext = createContext(null);

// ── Default seed accounts (created on first launch) ───────────────────────────
const SEED_USERS = [
  { username: 'admin',      password: 'admin123',   name: 'System Administrator', email: 'admin@airport.com',     role: 'admin',          organization: 'Administration',     orgType: 'Airport Department',        orgName: 'Administration',         department: 'IT / Administration', position: 'System Administrator', contactNumber: '' },
  { username: 'safety1',    password: 'safety123',  name: 'Safety Officer',       email: 'safety@airport.com',    role: 'safety_officer', organization: 'Safety Department',  orgType: 'Airport Department',        orgName: 'AOT Safety Department',  department: 'Safety Management',   position: 'Safety Officer',       contactNumber: '' },
  { username: 'inspector1', password: 'inspect123', name: 'Safety Inspector',     email: 'inspector@airport.com', role: 'inspector',      organization: 'Safety Department',  orgType: 'Airport Department',        orgName: 'AOT Safety Department',  department: 'Safety Inspection',   position: 'Safety Inspector',     contactNumber: '' },
  { username: 'auditor1',   password: 'audit123',   name: 'Quality Auditor',      email: 'auditor@airport.com',   role: 'inspector',      organization: 'Safety Department',  orgType: 'Airport Department',        orgName: 'AOT Safety Department',  department: 'Quality Assurance',   position: 'Quality Auditor',      contactNumber: '' },
  { username: 'stake1',     password: 'stake123',   name: 'Airside Ops Manager',  email: 'airside@airport.com',   role: 'stakeholder',    organization: 'Airside Operations', orgType: 'Airport Department',        orgName: 'Airside Operations Dept',department: 'Operations',          position: 'Operations Manager',   contactNumber: '' },
  { username: 'stake2',     password: 'stake123',   name: 'Ground Handling Mgr',  email: 'ground@airport.com',    role: 'stakeholder',    organization: 'Ground Handling',    orgType: 'Ground Handling Company',   orgName: 'Ground Handling Dept',   department: 'Ramp Services',       position: 'Department Manager',   contactNumber: '' },
  { username: 'stake3',     password: 'stake123',   name: 'Terminal Ops Manager', email: 'terminal@airport.com',  role: 'stakeholder',    organization: 'Terminal Operations', orgType: 'Terminal Operations',      orgName: 'Terminal Operations Dept',department: 'Passenger Services',  position: 'Operations Manager',   contactNumber: '' },
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
          seeded.push({
            id: uuid(),
            username: u.username,
            passwordHash: await hashPassword(u.password),
            name: u.name,
            email: u.email,
            role: u.role,
            organization: u.orgName || u.organization,
            orgType:       u.orgType       || '',
            orgName:       u.orgName       || u.organization,
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

  const createUser = useCallback(async ({ username, password, name, email, role, organization, orgType, orgName, department, position, contactNumber }) => {
    const data = loadData();
    if (data.users.some((u) => u.username.toLowerCase() === username.toLowerCase())) {
      return { success: false, error: 'usernameTaken' };
    }
    const resolvedOrg = (orgName || organization || '').trim();
    const newUser = {
      id: uuid(),
      username: username.trim(),
      passwordHash: await hashPassword(password),
      name: name.trim(),
      email: email.trim(),
      role,
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
    users.filter((u) => u.role === 'stakeholder' && u.isActive),
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
