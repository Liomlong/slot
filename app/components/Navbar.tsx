// app/components/Navbar.tsx
'use client';

import React from 'react';
import Image from 'next/image';
import LanguageSwitch from './LanguageSwitch';
import { useTranslation } from '../hooks/useTranslation';

const Navbar: React.FC = () => {
  const { t } = useTranslation();

  return (
    <nav className="bg-gradient-to-r from-purple-600 to-indigo-600 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Image
                src="/images/logo.png" // 请确保在 public/images 目录下有 logo.png 文件
                alt="Web3Lucky Logo"
                width={60}
                height={60}
                className="rounded-full"
              />
            </div>
            <div className="ml-4 text-2xl font-bold text-white">
              {t('navbar.title')}
            </div>
          </div>
          <div className="flex items-center">
            <LanguageSwitch />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
