'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from '../hooks/useTranslation';

interface WalletBalanceProps {
  tgId: number | null;
}

const WalletBalance: React.FC<WalletBalanceProps> = ({ tgId }) => {
  const { t } = useTranslation();
  const [points, setPoints] = useState<number>(0);
  const [usdt, setUsdt] = useState<number>(0);

  useEffect(() => {
    if (tgId) {
      fetchBalance();
    }
  }, [tgId]);

  const fetchBalance = async () => {
    try {
      const response = await fetch(`/api/user/balance?tgId=${tgId}`);
      if (response.ok) {
        const data = await response.json();
        setPoints(data.points);
        setUsdt(data.usdt);
      }
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-2">{t('wallet.balance')}</h2>
      <p>{t('wallet.points')}: {points}</p>
      <p>{t('wallet.usdt')}: {usdt} USDT</p>
    </div>
  );
};

export default WalletBalance;