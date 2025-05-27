
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpBackend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(HttpBackend) // Charge les traductions depuis un serveur/fichiers (ex: public/locales)
  .use(LanguageDetector) // Détecte la langue de l'utilisateur
  .use(initReactI18next) // Passe i18n à react-i18next
  .init({
    supportedLngs: ['en', 'fr'],
    fallbackLng: 'en', // Langue par défaut si la langue détectée n'est pas supportée
    debug: import.meta.env.DEV, // Active les logs en mode développement
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'], // Où sauvegarder la langue sélectionnée
    },
    backend: {
      loadPath: '/locales/{{lng}}/translation.json', // Chemin vers les fichiers de traduction
    },
    interpolation: {
      escapeValue: false, // React gère déjà l'échappement XSS
    },
  });

export default i18n;
