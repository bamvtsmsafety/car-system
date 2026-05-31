const STORAGE_KEY = 'car_system_data';

export const loadData = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { cars: [], nextSeq: 1 };
    return JSON.parse(raw);
  } catch {
    return { cars: [], nextSeq: 1 };
  }
};

export const saveData = (data) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const clearData = () => {
  localStorage.removeItem(STORAGE_KEY);
};
