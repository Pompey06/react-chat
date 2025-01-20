import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// Импортируем переводы
import translationRu from "./locales/ru.json";
import translationKz from "./locales/kz.json";

// Конфигурация i18n
i18n.use(initReactI18next).init({
   resources: {
      русc: { translation: translationRu },
      қаз: { translation: translationKz },
   },
   lng: "русc", // Язык по умолчанию
   fallbackLng: "русc", // Резервный язык
   interpolation: {
      escapeValue: false, // React уже экранирует строки
   },
});

export default i18n;
