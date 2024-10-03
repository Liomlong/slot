// app/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import SlotMachine from './components/SlotMachine';
import Footer from './components/Footer';
import WelcomeModal from './components/WelcomeModal';
import UserInfo from '../components/UserInfo';

const HomePage: React.FC = () => {
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);

  useEffect(() => {
    console.log("Page component mounted");
    const tg = (window as any).Telegram?.WebApp;
    console.log("Telegram object in page:", tg);
    if (tg) {
      console.log("Telegram WebApp found in page");
      console.log("InitData in page:", tg.initData);
      console.log("InitDataUnsafe in page:", tg.initDataUnsafe);
      const user = tg.initDataUnsafe?.user;
      console.log("User in page:", user);
      if (user) {
        // 检查用户是否为新用户
        fetch(`/api/user/check-new?tgId=${user.id}`)
          .then(res => res.json())
          .then(data => {
            console.log("New user check result:", data);
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
              }).then(res => res.json())
                .then(data => console.log("Welcome bonus result:", data));
            }
          });
      } else {
        console.log("No user found in page");
      }
    } else {
      console.log("Telegram WebApp not available in page");
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
      <UserInfo />
    </div>
  );
};

export default HomePage;
