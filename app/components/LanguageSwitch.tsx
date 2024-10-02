// app/components/LanguageSwitch.tsx
'use client';

import React, { useState } from 'react';

const LanguageSwitch: React.FC = () => {
  const [language, setLanguage] = useState('中文');

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    // 在这里添加语言切换的逻辑
  };

  return (
    <div className="relative">
      <button
        className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
        onClick={() => setLanguage(language === '中文' ? 'English' : '中文')}
      >
        🌐 {language}
      </button>
      {/* 如果需要下拉菜单，可以在这里实现 */}
    </div>
  );
};

export default LanguageSwitch;
