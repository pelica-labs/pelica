import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

import { en } from "~/locales/en";

i18n
  .use(initReactI18next)
  .use(LanguageDetector)
  .init({
    resources: {
      en: {
        translation: en,
      },
    },
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
  });

export { i18n };
