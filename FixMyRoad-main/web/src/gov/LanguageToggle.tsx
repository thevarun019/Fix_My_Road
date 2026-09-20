import React from 'react';
import { useTranslation } from 'react-i18next';

export const LanguageToggle: React.FC = () => {
  const { i18n } = useTranslation();
  const currentLang = i18n.language || 'en';

  const setLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('roadwatch_lang', lang);
  };

  return (
    <div className="inline-flex items-center rounded border border-gray-300 bg-white p-0.5 text-xs font-semibold shadow-sm">
      <button
        onClick={() => setLanguage('hi')}
        className={`px-2 py-0.5 rounded ${
          currentLang.startsWith('hi')
            ? 'bg-saffron text-white font-bold'
            : 'text-gray-700 hover:bg-gray-100'
        }`}
        aria-label="Switch to Hindi"
      >
        हिन्दी
      </button>
      <button
        onClick={() => setLanguage('en')}
        className={`px-2 py-0.5 rounded ${
          currentLang.startsWith('en')
            ? 'bg-navy text-white font-bold'
            : 'text-gray-700 hover:bg-gray-100'
        }`}
        aria-label="Switch to English"
      >
        English
      </button>
    </div>
  );
};
