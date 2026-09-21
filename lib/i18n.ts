import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import hiCommon from '@/locales/hi/common.json';
import hiQuestions from '@/locales/hi/questions.json';
import hiAyush from '@/locales/hi/ayush.json';

import enCommon from '@/locales/en/common.json';
import enQuestions from '@/locales/en/questions.json';
import enAyush from '@/locales/en/ayush.json';

import taCommon from '@/locales/ta/common.json';
import taQuestions from '@/locales/ta/questions.json';
import taAyush from '@/locales/ta/ayush.json';

const resources = {
  hi: { common: hiCommon, questions: hiQuestions, ayush: hiAyush },
  en: { common: enCommon, questions: enQuestions, ayush: enAyush },
  ta: { common: taCommon, questions: taQuestions, ayush: taAyush },
};

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    resources,
    lng: 'hi',
    fallbackLng: 'en',
    ns: ['common', 'questions', 'ayush'],
    defaultNS: 'common',
    interpolation: {
      escapeValue: false,
    },
  });
}

export default i18n;
