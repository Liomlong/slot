'use client';

import React, { createContext, useState, useEffect, ReactNode } from 'react';

type LanguageContextType = {
  language: string;
  setLanguage: (lang: string) => void;
};

export const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
});

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage) {
      setLanguage(savedLanguage);
    } else {
      // 尝试获取 Telegram 用户的语言设置
      const tg = (window as any).Telegram?.WebApp;
      if (tg && tg.initDataUnsafe?.user?.language_code) {
        const userLang = tg.initDataUnsafe.user.language_code;
        // 将 Telegram 语言代码映射到我们支持的语言
        const supportedLang = mapTelegramLangToSupported(userLang);
        setLanguage(supportedLang);
        localStorage.setItem('language', supportedLang);
      }
    }
  }, []);

  const handleSetLanguage = (lang: string) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

// 辅助函数：将 Telegram 语言代码映射到我们支持的语言
function mapTelegramLangToSupported(langCode: string): string {
  const supportedLangs = ['zh', 'en', 'es', 'fr', 'de', 'ja', 'ko', 'ru'];
  if (langCode.startsWith('zh')) return 'zh';
  return supportedLangs.includes(langCode) ? langCode : 'en';
}