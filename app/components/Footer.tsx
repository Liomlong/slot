// app/components/Footer.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslation } from '../hooks/useTranslation';
import { usePathname } from 'next/navigation';
import { FaHome, FaChartBar, FaUserFriends, FaWallet } from 'react-icons/fa';

const Footer: React.FC = () => {
  const { t } = useTranslation();
  const pathname = usePathname();

  const navItems = [
    { name: t('footer.slot'), path: '/', icon: FaHome },
    { name: t('footer.rank'), path: '/rank', icon: FaChartBar },
    { name: t('footer.friend'), path: '/friend', icon: FaUserFriends },
    { name: t('footer.wallet'), path: '/wallet', icon: FaWallet },
  ];

  return (
    <footer className="bg-gray-800 text-white py-2 fixed bottom-0 left-0 right-0">
      <nav className="container mx-auto">
        <ul className="flex justify-around items-center">
          {navItems.map((item) => (
            <li key={item.path} className="flex-1">
              <Link href={item.path}>
                <div className={`flex flex-col items-center py-2 ${pathname === item.path ? 'text-yellow-400' : 'text-white hover:text-yellow-200'}`}>
                  {React.createElement(item.icon, { className: "text-2xl mb-1" })}
                  <span className="text-xs">{item.name}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </footer>
  );
};

export default Footer;
