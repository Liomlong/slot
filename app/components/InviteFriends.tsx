'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { FaCopy, FaShare } from 'react-icons/fa';

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
      setInviteLink(`https://t.me/web3luckybot?start=${tgId}`);
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
    if (navigator.share) {
      navigator.share({
        title: t('invite.shareTitle'),
        text: t('invite.shareText'),
        url: inviteLink,
      }).catch((error) => console.log('Error sharing', error));
    } else {
      copyToClipboard();
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-purple-600">{t('invite.title')}</h2>
      <p className="mb-4">{t('invite.description')}</p>
      <p className="mb-6 font-semibold">{t('invite.reward')}</p>
      
      <div className="mb-4">
        <input
          type="text"
          value={inviteLink}
          readOnly
          className="w-full p-2 border border-gray-300 rounded-md"
        />
      </div>
      
      <div className="flex space-x-4 mb-6">
        <button
          onClick={copyToClipboard}
          className="flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition duration-300"
        >
          <FaCopy className="mr-2" />
          {copied ? t('invite.copied') : t('invite.copy')}
        </button>
        <button
          onClick={shareLink}
          className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition duration-300"
        >
          <FaShare className="mr-2" />
          {t('invite.share')}
        </button>
      </div>

      <h3 className="text-xl font-semibold mb-2 text-purple-600">{t('invite.records')}</h3>
      {inviteRecords.length > 0 ? (
        <ul className="divide-y divide-gray-200">
          {inviteRecords.map((record, index) => (
            <li key={index} className="py-2">
              <p>{t('invite.recordItem', { username: record.invitee_username, date: new Date(record.invited_at).toLocaleDateString() })}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p>{t('invite.noRecords')}</p>
      )}
    </div>
  );
};

export default InviteFriends;