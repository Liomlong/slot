'use client';

import React, { useState } from 'react';
import { useTranslation } from '../hooks/useTranslation';

interface BindWalletProps {
  tgId: number | null;
}

const BindWallet: React.FC<BindWalletProps> = ({ tgId }) => {
  const { t } = useTranslation();
  const [walletAddress, setWalletAddress] = useState('');

  const handleBind = async () => {
    if (!tgId || !walletAddress) return;

    try {
      const response = await fetch('/api/user/bind-wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tgId, walletAddress }),
      });

      if (response.ok) {
        alert(t('wallet.bindSuccess'));
      } else {
        alert(t('wallet.bindError'));
      }
    } catch (error) {
      console.error('Error binding wallet:', error);
      alert(t('wallet.bindError'));
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-2">{t('wallet.bindWallet')}</h2>
      <input
        type="text"
        value={walletAddress}
        onChange={(e) => setWalletAddress(e.target.value)}
        placeholder={t('wallet.enterWalletAddress')}
        className="w-full p-2 border rounded mb-2"
      />
      <button
        onClick={handleBind}
        className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
      >
        {t('wallet.bind')}
      </button>
    </div>
  );
};

export default BindWallet;