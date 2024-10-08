import { useContext, useCallback } from 'react';
import { LanguageContext } from '../contexts/LanguageContext';
import zh from '@/translations/zh.json';
import en from '@/translations/en.json';
import es from '@/translations/es.json';
import fr from '@/translations/fr.json';
import de from '@/translations/de.json';
import ja from '@/translations/ja.json';
import ko from '@/translations/ko.json';
import ru from '@/translations/ru.json';

const translations: Record<string, any> = { zh, en, es, fr, de, ja, ko, ru };

export const useTranslation = () => {
  const { language } = useContext(LanguageContext);

  const t = useCallback((key: string, params?: Record<string, string | number>) => {
    const keys = key.split('.');
    let value = keys.reduce((o, i) => o?.[i], translations[language]);
    
    if (typeof value === 'string' && params) {
      Object.entries(params).forEach(([k, v]) => {
        value = (value as string).replace(`{${k}}`, String(v));
      });
    }
    
    return value || key;
  }, [language]);

  return { t };
};