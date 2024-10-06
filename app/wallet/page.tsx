'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import WalletBalance from '../components/WalletBalance';
import BindWallet from '../components/BindWallet';
import TransferFunds from '../components/TransferFunds';
import WithdrawFunds from '../components/WithdrawFunds';
import TransactionHistory from '../components/TransactionHistory';
import { useTranslation } from '../hooks/useTranslation';

const WalletPage: React.FC = () => {
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
      <main className="flex-grow p-4 overflow-y-auto">
        <div className="container mx-auto max-w-4xl pb-16"> {/* 添加底部填充 */}
          <h1 className="text-2xl font-bold mb-4 text-white text-center">{t('wallet.title')}</h1>
          <div className="space-y-6">
            <WalletBalance tgId={tgId} />
            <BindWallet tgId={tgId} />
            <TransferFunds tgId={tgId} />
            <WithdrawFunds tgId={tgId} />
            <TransactionHistory tgId={tgId} />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default WalletPage;