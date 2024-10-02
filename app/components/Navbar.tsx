// app/components/Navbar.tsx
'use client';

import React from 'react';
import LanguageSwitch from './LanguageSwitch';

const Navbar: React.FC = () => {
  return (
    <div className="flex items-center justify-between px-4 py-2 bg-white shadow-md">
      <h1 className="text-2xl font-bold text-gray-800">Web3Lucky</h1>
      <div className="flex items-center">
        {/* 语言切换功能 */}
        <LanguageSwitch />
      </div>
    </div>
  );
};

export default Navbar;
