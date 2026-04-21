import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './en.json';
import hi from './hi.json';
import kn from './kn.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)       // bind to React
  .init({
    resources: {
      en: { translation: en },
      hi: { translation: hi },
      kn: { translation: kn },
    },
    lng: 'en',
    fallbackLng: 'en',
    supportedLngs: ['en', 'hi', 'kn'],
    interpolation: {
      escapeValue: false,       // React already escapes values
    },
    detection: {
      order: [],
      caches: [],
    },
  });

export default i18n;
