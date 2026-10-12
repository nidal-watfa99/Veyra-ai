import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, TRANSLATIONS, Translations } from '../i18n/translations';
import { resilientStorage } from '../utils/security';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof Translations) => string;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    // 1. Check resilient storage
    if (typeof window !== 'undefined') {
      const saved = resilientStorage.getItem('veyra_language') as Language;
      if (saved && (saved === 'en' || saved === 'ar' || saved === 'fr')) {
        return saved;
      }

      // 2. Detect device/browser language
      const browserLang = (navigator.language || (navigator as any).userLanguage || '').toLowerCase();
      if (browserLang.startsWith('ar')) return 'ar';
      if (browserLang.startsWith('fr')) return 'fr';
    }
    return 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    resilientStorage.setItem('veyra_language', lang);
  };

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language;
      document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    }
  }, [language]);

  const isRTL = language === 'ar';

  const t = (key: keyof Translations): string => {
    const langDict = TRANSLATIONS[language] || TRANSLATIONS.en;
    return langDict[key] || TRANSLATIONS.en[key] || String(key);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
