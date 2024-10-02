// app/page.tsx
'use client';

import React from 'react';
import Navbar from './components/Navbar';
import SlotMachine from './components/SlotMachine';
import Footer from './components/Footer';

const HomePage: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* 顶部导航栏 */}
      <Navbar />

      {/* 主体内容 */}
      <main className="flex-grow">
        <SlotMachine />
      </main>

      {/* 底部按钮 */}
      <Footer />
    </div>
  );
};

export default HomePage;
