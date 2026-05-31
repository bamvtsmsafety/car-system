import { createContext, useContext, useState } from 'react';
import { translations } from '../i18n/translations';

const LanguageContext = createContext(null);

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
};

export const useT = () => useLanguage().t;

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('car_lang') || 'en');

  const switchLang = (l) => {
    setLang(l);
    localStorage.setItem('car_lang', l);
  };

  const t = (section, key) => {
    return translations[lang]?.[section]?.[key] ?? translations['en']?.[section]?.[key] ?? key;
  };

  return (
    <LanguageContext.Provider value={{ lang, switchLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}
