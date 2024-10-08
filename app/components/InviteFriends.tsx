'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { FaCopy, FaShare, FaUserPlus } from 'react-icons/fa';
import { motion } from 'framer-motion';

interface InviteFriendsProps {
  tgId: number | null;
}

interface InviteRecord {
  invitee_username: string;
  invited_at: string;
}

const InviteFriends: React.FC<InviteFriendsProps> = ({ tgId }) => {
  const { t } = useTranslation();
  const [inviteLink, setInviteLink] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [inviteRecords, setInviteRecords] = useState<InviteRecord[]>([]);

  useEffect(() => {
    if (tgId) {
      // 更新这里的邀请链接格式
      setInviteLink(`https://t.me/web3luckybot/app?startapp=${tgId}`);
      fetchInviteRecords();
    }
  }, [tgId]);

  const fetchInviteRecords = async () => {
    if (tgId) {
      try {
        const response = await fetch(`/api/user/invite-records?tgId=${tgId}`);
        if (response.ok) {
          const data = await response.json();
          setInviteRecords(data.records);
        }
      } catch (error) {
        console.error('Error fetching invite records:', error);
      }
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(inviteLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const shareLink = () => {
    const tg = (window as any).Telegram?.WebApp;
    if (tg && tg.shareUrl) {
      tg.shareUrl(inviteLink);
    } else {
      console.error('Telegram WebApp is not available');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-lg shadow-xl p-6"
    >
      <h2 className="text-2xl font-bold mb-4 text-white">{t('invite.title')}</h2>
      <p className="mb-4 text-purple-200">{t('invite.description')}</p>
      <p className="mb-6 font-semibold text-yellow-300">{t('invite.reward')}</p>
      
      <div className="mb-4">
        <input
          type="text"
          value={inviteLink}
          readOnly
          className="w-full p-2 bg-white bg-opacity-20 border border-purple-300 rounded-md text-white"
        />
      </div>
      
      <div className="flex space-x-4 mb-6">
        <button
          onClick={copyToClipboard}
          className="flex-1 flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition duration-300"
        >
          <FaCopy className="mr-2" />
          {copied ? t('invite.copied') : t('invite.copy')}
        </button>
        <button
          onClick={shareLink}
          className="flex-1 flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition duration-300"
        >
          <FaShare className="mr-2" />
          {t('invite.share')}
        </button>
      </div>

      <h3 className="text-xl font-semibold mb-2 text-white">{t('invite.records')}</h3>
      <div className="max-h-60 overflow-y-auto"> {/* 限制最大高度并添加垂直滚动 */}
        {inviteRecords.length > 0 ? (
          <ul className="divide-y divide-purple-400">
            {inviteRecords.map((record, index) => (
              <li key={index} className="py-2 flex items-center text-purple-200">
                <FaUserPlus className="mr-2 text-green-400" />
                <p>{t('invite.recordItem').replace('{username}', record.invitee_username).replace('{date}', new Date(record.invited_at).toLocaleDateString())}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-purple-200">{t('invite.noRecords')}</p>
        )}
      </div>
    </motion.div>
  );
};

export default InviteFriends;