import { createContext, useContext, useState } from 'react';

const LanguageContext = createContext();

export const LANGUAGES = [
  { code: 'hinglish', label: 'Hinglish', native: 'हिं+Eng', flag: '🇮🇳' },
  { code: 'hi',       label: 'Hindi',    native: 'हिंदी',    flag: '🇮🇳' },
  { code: 'en',       label: 'English',  native: 'English',  flag: '🇬🇧' },
  { code: 'bn',       label: 'Bangla',   native: 'বাংলা',    flag: '🇧🇩' },
];

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('ns_lang') || 'hinglish');

  const changeLang = (code) => {
    setLang(code);
    localStorage.setItem('ns_lang', code);
  };

  return (
    <LanguageContext.Provider value={{ lang, changeLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLang = () => useContext(LanguageContext);
