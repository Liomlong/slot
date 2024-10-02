// app/components/Footer.tsx
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

const Footer: React.FC = () => {
  const router = useRouter();

  const navItems = [
    { name: 'Slot', icon: '🎰', path: '/' },
    { name: 'Rank', icon: '🏆', path: '/rank' },
    { name: 'Friend', icon: '👥', path: '/friend' },
    { name: 'Wallet', icon: '👛', path: '/wallet' },
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
