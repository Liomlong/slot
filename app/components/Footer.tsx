// app/components/Footer.tsx
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '../hooks/useTranslation';

const Footer: React.FC = () => {
  const router = useRouter();
  const { t } = useTranslation();

  const navItems = [
    { name: t('footer.slot'), icon: '🎰', path: '/' },
    { name: t('footer.rank'), icon: '🏆', path: '/rank' },
    { name: t('footer.friend'), icon: '👥', path: '/friend' },
    { name: t('footer.wallet'), icon: '💰', path: '/wallet' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white shadow-inner">
      <div className="flex justify-around py-2">
        {navItems.map((item) => (
          <button
            key={item.name}
            onClick={() => router.push(item.path)}
            className="flex flex-col items-center"
          >
            <span className="text-2xl">{item.icon}</span>
            <span className="text-sm text-gray-700">{item.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Footer;
