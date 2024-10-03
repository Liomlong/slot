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

// 定义翻译文件的结构
type TranslationType = {
  slotMachine: {
    title: string;
    pointsAndUsdt: string;
    spin: string;
    autoSpin: string;
    invite: string;
    freeSpinAvailable: string;
    spinsLeft: string;
    bigWin: string;
    smallWin: string;
    congratulations: string;
    continueGame: string;
  };
  navbar: {
    title: string;
  };
  footer: {
    slot: string;
    rank: string;
    friend: string;
    wallet: string;
  };
  welcomeModal: {
    title: string;
    subtitle: string;
    reward1: string;
    reward2: string;
    enjoy: string;
    startGame: string;
  };
  invite: {
    title: string;
    description: string;
    reward: string;
  };
};

const translations: Record<string, TranslationType> = { zh, en, es, fr, de, ja, ko, ru };

export const useTranslation = () => {
  const { language } = useContext(LanguageContext);

  const t = (key: string, params?: Record<string, string | number>) => {
    const keys = key.split('.');
    let value: any = translations[language];
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return key; // 如果找不到翻译,返回原始键
      }
    }
    if (typeof value === 'string' && params) {
      return Object.entries(params).reduce(
        (acc, [key, val]) => acc.replace(`{${key}}`, String(val)),
        value
      );
    }
    return value as string;
  };

  return { t, language };
};