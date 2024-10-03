import { useContext } from 'react';
import { LanguageContext } from '../contexts/LanguageContext';
import zh from '@/translations/zh.json';
import en from '@/translations/en.json';
import es from '@/translations/es.json';
import fr from '@/translations/fr.json';
import de from '@/translations/de.json';
import ja from '@/translations/ja.json';
import ko from '@/translations/ko.json';
import ru from '@/translations/ru.json';

const translations = { zh, en, es, fr, de, ja, ko, ru };

export const useTranslation = () => {
  const { language } = useContext(LanguageContext);

  const t = (key: string) => {
    const keys = key.split('.');
    let value = translations[language as keyof typeof translations];
    for (const k of keys) {
      value = value?.[k as keyof typeof value];
      if (value === undefined) return key;
    }
    return value as string;
  };

  return { t, language };
};