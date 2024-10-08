'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from '../hooks/useTranslation';

interface TransactionHistoryProps {
  tgId: number | null;
}

interface Transaction {
  id: number;
  type: string;
  amount: number;
  timestamp: string;
}

const TransactionHistory: React.FC<TransactionHistoryProps> = ({ tgId }) => {
  const { t } = useTranslation();
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    if (tgId) {
      fetchTransactions();
    }
  }, [tgId]);

  const fetchTransactions = async () => {
    try {
      const response = await fetch(`/api/user/transactions?tgId=${tgId}`);
      if (response.ok) {
        const data = await response.json();
        setTransactions(data.transactions);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-2">{t('wallet.transactionHistory')}</h2>
      <ul className="divide-y divide-gray-200">
        {transactions.map((transaction) => (
          <li key={transaction.id} className="py-2">
            <p>{t('wallet.transactionItem')
              .replace('{type}', t(`wallet.${transaction.type}`))
              .replace('{amount}', transaction.amount.toString())
              .replace('{date}', new Date(transaction.timestamp).toLocaleString())
            }</p>
          </li>
        ))}
      </ul>
      {transactions.length === 0 && <p>{t('wallet.noTransactions')}</p>}
    </div>
  );
};

export default TransactionHistory;