'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from '../hooks/useTranslation';

interface RankData {
  userRank: { rank: number; points: number } | null;
  top100: Array<{ username: string; points: number; rank: number }>;
}

const Rank: React.FC<{ tgId: number | null }> = ({ tgId }) => {
  const { t } = useTranslation();
  const [rankData, setRankData] = useState<RankData | null>(null);

  useEffect(() => {
    if (tgId) {
      fetch(`/api/rank?tgId=${tgId}`)
        .then(res => res.json())
        .then(data => setRankData(data))
        .catch(error => console.error('Error fetching rank data:', error));
    }
  }, [tgId]);

  if (!rankData) {
    return <div>{t('loading')}</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">{t('rank.title')}</h2>
      {rankData.userRank && (
        <div className="mb-4">
          <h3 className="text-xl font-semibold">{t('rank.yourRank')}</h3>
          <p>{t('rank.rankInfo', { rank: rankData.userRank.rank, points: rankData.userRank.points })}</p>
        </div>
      )}
      <h3 className="text-xl font-semibold mb-2">{t('rank.top100')}</h3>
      <div className="overflow-x-auto">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-200">
              <th className="px-4 py-2">{t('rank.rankColumn')}</th>
              <th className="px-4 py-2">{t('rank.usernameColumn')}</th>
              <th className="px-4 py-2">{t('rank.pointsColumn')}</th>
            </tr>
          </thead>
          <tbody>
            {rankData.top100.map((user, index) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-gray-100' : ''}>
                <td className="border px-4 py-2">{user.rank}</td>
                <td className="border px-4 py-2">{user.username}</td>
                <td className="border px-4 py-2">{user.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Rank;