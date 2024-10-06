'use client';

import React, { useState } from 'react';
import { useTranslation } from '../hooks/useTranslation';

interface WithdrawFundsProps {
  tgId: number | null;
}

const WithdrawFunds: React.FC<WithdrawFundsProps> = ({ tgId }) => {
  const { t } = useTranslation();
  const [amount, setAmount] = useState('');

  const handleWithdraw = async () => {
    if (!tgId || !amount) return;

    try {
      const response = await fetch('/api/user/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tgId, amount: parseFloat(amount) }),
      });

      if (response.ok) {
        alert(t('wallet.withdrawSuccess'));
      } else {
        alert(t('wallet.withdrawError'));
      }
    } catch (error) {
      console.error('Error withdrawing funds:', error);
      alert(t('wallet.withdrawError'));
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-2">{t('wallet.withdraw')}</h2>
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder={t('wallet.enterAmount')}
        className="w-full p-2 border rounded mb-2"
      />
      <button
        onClick={handleWithdraw}
        className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
      >
        {t('wallet.withdraw')}
      </button>
    </div>
  );
};

export default WithdrawFunds;