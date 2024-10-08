'use client';

import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import InviteFriends from '../components/InviteFriends';
import { useTranslation } from '../hooks/useTranslation';

const FriendPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-purple-900 to-indigo-900">
      <Navbar />
      <main className="flex-grow p-4">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-2xl font-bold mb-4 text-white text-center">
            {t('friend.title') || 'Invite Friends'} {/* 添加默认值 */}
          </h1>
          <InviteFriends tgId={null} /> {/* 这里需要传入实际的 tgId */}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default FriendPage;