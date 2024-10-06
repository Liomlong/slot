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
    return <div className="flex justify-center items-center h-64 text-white">{t('loading')}</div>;
  }

  if (!rankData) {
    return <div className="text-center text-red-500">{t('rank.errorLoading')}</div>;
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-lg shadow-xl p-6"
    >
      {rankData.userRank && (
        <div className="mb-6 p-4 bg-purple-600 bg-opacity-50 rounded-lg text-white">
          <h3 className="text-xl font-semibold">{t('rank.yourRank')}</h3>
          <p className="text-lg mt-2">
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
          className="w-full p-2 pl-10 bg-white bg-opacity-20 border border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-purple-200"
        />
        <FaSearch className="absolute left-3 top-3 text-purple-300" />
      </div>

      <h3 className="text-xl font-semibold mb-2 text-white">{t('rank.top100')}</h3>
      <div className="max-h-96 overflow-y-auto"> {/* 限制最大高度并添加垂直滚动 */}
        <table className="w-full table-auto">
          <thead className="sticky top-0 bg-purple-700 bg-opacity-50"> {/* 使表头固定 */}
            <tr className="text-white">
              <th className="px-4 py-2 text-left">{t('rank.rankColumn')}</th>
              <th className="px-4 py-2 text-left">{t('rank.usernameColumn')}</th>
              <th className="px-4 py-2 text-right">{t('rank.pointsColumn')}</th>
            </tr>
          </thead>
          <tbody>
            {filteredRankData?.map((user, index) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-purple-600 bg-opacity-20' : 'bg-purple-500 bg-opacity-20'}>
                <td className="border-b border-purple-400 px-4 py-2 text-white">
                  {user.rank <= 3 ? (
                    <FaMedal className={`inline-block mr-1 ${getMedalColor(user.rank)}`} />
                  ) : null}
                  {user.rank}
                </td>
                <td className="border-b border-purple-400 px-4 py-2 text-white">{user.username}</td>
                <td className="border-b border-purple-400 px-4 py-2 text-right text-white">{user.points.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {filteredRankData?.length === 0 && (
        <p className="text-center mt-4 text-purple-200">{t('rank.noResults')}</p>
      )}
    </motion.div>
  );
};

export default Rank;