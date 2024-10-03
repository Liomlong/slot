// app/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import SlotMachine from './components/SlotMachine';
import Footer from './components/Footer';
import WelcomeModal from './components/WelcomeModal';
import UserInfo from './components/UserInfo'; // 修改这里

const HomePage: React.FC = () => {
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

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
