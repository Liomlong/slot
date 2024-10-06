// app/rank/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Rank from '../components/Rank';
import { useTranslation } from '../hooks/useTranslation';

const RankPage: React.FC = () => {
  const { t } = useTranslation();
  const [tgId, setTgId] = useState<number | null>(null);

  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;
    if (tg && tg.initDataUnsafe?.user) {
      setTgId(tg.initDataUnsafe.user.id);
    }
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-purple-900 to-indigo-900">
      <Navbar />
      <main className="flex-grow p-4">
        <h1 className="text-2xl font-bold mb-4 text-white text-center">{t('rank.title')}</h1>
        <Rank tgId={tgId} />
      </main>
      <Footer />
    </div>
  );
};

export default RankPage;
