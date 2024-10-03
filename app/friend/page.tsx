'use client';

import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useTranslation } from '../hooks/useTranslation';

const FriendPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow p-4">
        <h1 className="text-2xl font-bold mb-4">{t('friend.title')}</h1>
        {/* 这里添加好友列表或邀请功能的具体内容 */}
      </main>
      <Footer />
    </div>
  );
};

export default FriendPage;