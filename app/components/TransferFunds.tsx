'use client';

import React, { useState } from 'react';
import { useTranslation } from '../hooks/useTranslation';

interface TransferFundsProps {
  tgId: number | null;
}

const TransferFunds: React.FC<TransferFundsProps> = ({ tgId }) => {
  const { t } = useTranslation();
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');

  const handleTransfer = async () => {
    if (!tgId || !recipient || !amount) return;

    try {
      const response = await fetch('/api/user/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tgId, recipient, amount: parseFloat(amount) }),
      });

      if (response.ok) {
        alert(t('wallet.transferSuccess'));
      } else {
        alert(t('wallet.transferError'));
      }
    } catch (error) {
      console.error('Error transferring funds:', error);
      alert(t('wallet.transferError'));
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-2">{t('wallet.transfer')}</h2>
      <input
        type="text"
        value={recipient}
        onChange={(e) => setRecipient(e.target.value)}
        placeholder={t('wallet.enterRecipient')}
        className="w-full p-2 border rounded mb-2"
      />
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder={t('wallet.enterAmount')}
        className="w-full p-2 border rounded mb-2"
      />
      <button
        onClick={handleTransfer}
        className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
      >
        {t('wallet.transfer')}
      </button>
    </div>
  );
};

export default TransferFunds;