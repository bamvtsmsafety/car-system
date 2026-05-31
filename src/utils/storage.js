const STORAGE_KEY = 'car_system_data';
const SESSION_KEY = 'car_session';

export const loadData = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { cars: [], users: [], nextSeq: 1 };
    const parsed = JSON.parse(raw);
    return { cars: [], users: [], nextSeq: 1, ...parsed };
  } catch {
    return { cars: [], users: [], nextSeq: 1 };
  }
};

export const saveData = (data) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const clearData = () => {
  localStorage.removeItem(STORAGE_KEY);
};

// ── Session helpers ────────────────────────────────────────────────────────────
export const saveSession = (userId) => localStorage.setItem(SESSION_KEY, userId);
export const loadSession = () => localStorage.getItem(SESSION_KEY);
export const clearSession = () => localStorage.removeItem(SESSION_KEY);
