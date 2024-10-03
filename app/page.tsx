// app/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import SlotMachine from './components/SlotMachine';
import Footer from './components/Footer';
import WelcomeModal from './components/WelcomeModal';

const HomePage: React.FC = () => {
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [isTelegramReady, setIsTelegramReady] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const checkTelegramWebApp = () => {
      const tg = (window as any).Telegram?.WebApp;
      if (tg && tg.initDataUnsafe?.user) {
        setIsTelegramReady(true);
      } else {
        if (retryCount < 3) {
          setTimeout(() => {
            setRetryCount(prevCount => prevCount + 1);
          }, 1000);
        } else {
          console.error("Failed to load Telegram WebApp after 3 attempts");
        }
      }
    };

    checkTelegramWebApp();
  }, [retryCount]);

  useEffect(() => {
    // 检查是否是新用户，如果是则显示欢迎弹窗
    const isNewUser = localStorage.getItem('isNewUser') !== 'false';
    if (isNewUser) {
      setShowWelcomeModal(true);
      localStorage.setItem('isNewUser', 'false');
    }
  }, []);

  const handleCloseWelcomeModal = () => {
    setShowWelcomeModal(false);
  };

  const handleRelogin = () => {
    // 重新加载页面以重新初始化 Telegram WebApp
    window.location.reload();
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        {isTelegramReady ? (
          <SlotMachine />
        ) : (
          <div className="flex flex-col items-center justify-center h-full">
            <p className="mb-4">Loading...</p>
            {retryCount >= 3 && (
              <button
                onClick={handleRelogin}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                重新登录
              </button>
            )}
          </div>
        )}
      </main>
      <Footer />
      {showWelcomeModal && <WelcomeModal onClose={handleCloseWelcomeModal} />}
    </div>
  );
};

export default HomePage;
