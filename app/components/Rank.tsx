'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { FaMedal, FaSearch } from 'react-icons/fa';
import { motion } from 'framer-motion';

interface RankData {
  userRank: { rank: number; points: number } | null;
  top100: Array<{ username: string; points: number; rank: number }>;
}

const Rank: React.FC<{ tgId: number | null }> = ({ tgId }) => {
  const { t } = useTranslation();
  const [rankData, setRankData] = useState<RankData | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (tgId) {
      setIsLoading(true);
      fetch(`/api/rank?tgId=${tgId}`)
        .then(res => res.json())
        .then(data => {
          setRankData(data);
          setIsLoading(false);
        })
        .catch(error => {
          console.error('Error fetching rank data:', error);
          setIsLoading(false);
        });
    }
  }, [tgId]);

  const filteredRankData = rankData?.top100.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getMedalColor = (rank: number) => {
    if (rank === 1) return 'text-yellow-400';
    if (rank === 2) return 'text-gray-400';
    if (rank === 3) return 'text-yellow-600';
    return 'text-gray-300';
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">{t('loading')}</div>;
  }

  if (!rankData) {
    return <div className="text-center text-red-500">{t('rank.errorLoading')}</div>;
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="p-4 bg-white rounded-lg shadow-md"
    >
      <h2 className="text-2xl font-bold mb-4 text-center text-purple-600">{t('rank.title')}</h2>
      
      {rankData.userRank && (
        <div className="mb-6 p-4 bg-purple-100 rounded-lg">
          <h3 className="text-xl font-semibold text-purple-700">{t('rank.yourRank')}</h3>
          <p className="text-lg">
            {t('rank.rankInfo', { rank: rankData.userRank.rank, points: rankData.userRank.points })}
          </p>
        </div>
      )}

      <div className="mb-4 relative">
        <input
          type="text"
          placeholder={t('rank.searchPlaceholder')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <FaSearch className="absolute left-3 top-3 text-gray-400" />
      </div>

      <h3 className="text-xl font-semibold mb-2 text-purple-600">{t('rank.top100')}</h3>
      <div className="overflow-x-auto">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-purple-200">
              <th className="px-4 py-2">{t('rank.rankColumn')}</th>
              <th className="px-4 py-2">{t('rank.usernameColumn')}</th>
              <th className="px-4 py-2">{t('rank.pointsColumn')}</th>
            </tr>
          </thead>
          <tbody>
            {filteredRankData?.map((user, index) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-purple-50' : 'bg-white'}>
                <td className="border px-4 py-2 text-center">
                  {user.rank <= 3 ? (
                    <FaMedal className={`inline-block mr-1 ${getMedalColor(user.rank)}`} />
                  ) : null}
                  {user.rank}
                </td>
                <td className="border px-4 py-2">{user.username}</td>
                <td className="border px-4 py-2 text-right">{user.points.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {filteredRankData?.length === 0 && (
        <p className="text-center mt-4 text-gray-500">{t('rank.noResults')}</p>
      )}
    </motion.div>
  );
};

export default Rank;