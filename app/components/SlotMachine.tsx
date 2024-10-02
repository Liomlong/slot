// app/components/SlotMachine.tsx
'use client';

import React, { useState } from 'react';

const SlotMachine: React.FC = () => {
  const [username, setUsername] = useState('@username');
  const [points, setPoints] = useState(100);
  const [usdtBalance, setUsdtBalance] = useState(50);
  const [spinsLeft, setSpinsLeft] = useState(3);

  // 模拟交易所图标（请替换为实际图标路径）
  const exchangeIcons = [
    '/images/binance.png',
    '/images/huobi.png',
    '/images/okx.png',
    // 添加更多图标
  ];

  const handleSpin = () => {
    if (spinsLeft > 0) {
      // 执行老虎机逻辑
      setSpinsLeft(spinsLeft - 1);
    } else {
      alert('没有剩余次数了！');
    }
  };

  const handleInvite = () => {
    // 执行邀请逻辑
    alert('邀请链接已复制！');
  };

  return (
    <div className="flex flex-col items-center mt-4">
      {/* 用户信息 */}
      <div className="flex items-center space-x-4 mb-4">
        <div className="flex items-center">
          <span className="mr-1">👤</span>
          <span>{username}</span>
        </div>
        <div className="flex items-center">
          <span className="mr-1">💎</span>
          <span>{points}</span>
        </div>
        <div className="flex items-center">
          <span className="mr-1">💰</span>
          <span>{usdtBalance}</span>
        </div>
      </div>

      {/* 老虎机界面 */}
      <div className="relative w-full max-w-md p-4 bg-gray-100 rounded-md shadow-md">
        {/* 拉杆 */}
        <div className="absolute right-[-50px] top-1/2 transform -translate-y-1/2">
          <button
            onClick={handleSpin}
            className="px-2 py-4 bg-red-500 text-white rounded-md transform rotate-45 shadow-lg"
          >
            拉杆
          </button>
        </div>

        {/* 老虎机图标 */}
        <div className="grid grid-cols-3 gap-4">
          {exchangeIcons.map((icon, index) => (
            <div
              key={index}
              className="w-24 h-24 bg-white flex items-center justify-center rounded-md shadow-md"
            >
              <img src={icon} alt="Exchange Icon" className="w-16 h-16" />
            </div>
          ))}
        </div>

        {/* 剩余次数和邀请按钮 */}
        <div className="flex flex-col items-center mt-4">
          <span className="text-gray-700">剩余次数：{spinsLeft}</span>
          <button
            onClick={handleSpin}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md shadow"
          >
            Spin
          </button>
          <button
            onClick={handleInvite}
            className="mt-2 px-4 py-2 bg-green-500 text-white rounded-md shadow"
          >
            邀请好友
          </button>
        </div>
      </div>
    </div>
  );
};

export default SlotMachine;
