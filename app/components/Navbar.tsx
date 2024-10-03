// app/components/Navbar.tsx
'use client';

import React from 'react';
import Image from 'next/image';
import LanguageSwitch from './LanguageSwitch';

const Navbar: React.FC = () => {
  return (
    <nav className="bg-gradient-to-r from-purple-600 to-indigo-600 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Image
                src="/images/logo.png" // 请确保在 public/images 目录下有 logo.png 文件
                alt="Web3Lucky Logo"
                width={40}
                height={40}
                className="rounded-full"
              />
            </div>
            <div className="ml-4 text-xl font-bold text-white">
              Web3Lucky
            </div>
          </div>
          <div className="flex items-center">
            <LanguageSwitch />
            <button className="ml-4 px-4 py-2 rounded-full bg-yellow-400 text-purple-900 font-semibold hover:bg-yellow-300 transition duration-300 ease-in-out transform hover:scale-105">
              连接钱包
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
