// app/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import SlotMachine from './components/SlotMachine';
import Footer from './components/Footer';
import WelcomeModal from './components/WelcomeModal';

const HomePage: React.FC = () => {
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);

  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;
    if (tg) {
      const user = tg.initDataUnsafe.user;
      // 检查用户是否为新用户
      fetch(`/api/user/check-new?tgId=${user.id}`)
        .then(res => res.json())
        .then(data => {
          if (data.isNewUser) {
            setIsNewUser(true);
            setShowWelcomeModal(true);
            // 给新用户发放奖励
            fetch('/api/user/welcome-bonus', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ tgId: user.id }),
            });
          }
        });
    }
  }, []);

  const handleCloseWelcomeModal = () => {
    setShowWelcomeModal(false);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <SlotMachine />
      </main>
      <Footer />
      {showWelcomeModal && <WelcomeModal onClose={handleCloseWelcomeModal} />}
    </div>
  );
};

export default HomePage;
