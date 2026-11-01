import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpBackend from 'i18next-http-backend';
import { translations } from './data/translations.ts';

i18n
  .use(HttpBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: translations.en },
      hi: { translation: translations.hi },
      ta: { translation: translations.ta },
      te: { translation: translations.te },
      ml: { translation: translations.ml },
      mr: { translation: translations.mr },
      gu: { translation: translations.gu },
      kn: { translation: (translations as any).kn || translations.en },
      bn: { translation: (translations as any).bn || translations.en },
      pa: { translation: (translations as any).pa || translations.en },
    },
    fallbackLng: 'en',
    keySeparator: false,
    supportedLngs: ['en', 'hi', 'ml', 'ta', 'te', 'mr', 'gu', 'kn', 'bn', 'pa'],
    backend: {
      loadPath: '/locales/{{lng}}/translation.json?v=52',
    },
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
    react: {
      useSuspense: false
    }
  });

export default i18n;
