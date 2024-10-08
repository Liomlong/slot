'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import UserProfile from './UserProfile';
import { FaTicketAlt, FaDollarSign } from 'react-icons/fa'; // 导入图标

interface SlotMachineProps {
  isGuestMode: boolean;
}

const SlotMachine: React.FC<SlotMachineProps> = ({ isGuestMode }) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [finalPositions, setFinalPositions] = useState<number[]>([5, 5, 5]); // 初始化为 BTC 的索引
  const [lastOffsets, setLastOffsets] = useState<number[]>([0, 0, 0]);
  const [username, setUsername] = useState<string | null>(null);
  const [points, setPoints] = useState<number>(0);
  const [usdt, setUsdt] = useState<number>(0);
  const slotRefs = [useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null)];
  const [shuffledIcons, setShuffledIcons] = useState<string[]>([]);
  const [gameData, setGameData] = useState<any>(null);
  const [showUserProfile, setShowUserProfile] = useState(false);

  const [tgId, setTgId] = useState<number | null>(null);

  const baseIcons = [
    '/images/TON.png',
    '/images/BNB.png',
    '/images/SOL.png',
    '/images/USDT.png',
    '/images/ETH.png',
    '/images/BTC.png',
  ];

  const exchangeIcons = [
    '/images/TON.png', '/images/TON.png', '/images/TON.png', '/images/TON.png', '/images/TON.png', 
    '/images/TON.png', '/images/TON.png', '/images/TON.png', '/images/TON.png', '/images/TON.png', // 10次
    '/images/BNB.png', '/images/BNB.png', '/images/BNB.png', '/images/BNB.png', 
    '/images/BNB.png', '/images/BNB.png', '/images/BNB.png', '/images/BNB.png', // 8次
    '/images/SOL.png', '/images/SOL.png', '/images/SOL.png', '/images/SOL.png', 
    '/images/SOL.png', '/images/SOL.png', // 6次
    '/images/USDT.png', '/images/USDT.png', // 2次
    '/images/ETH.png', // 1次
    '/images/BTC.png', // 1次
  ];

  const fetchUserInfo = useCallback(async () => {
    if (tgId) {
      try {
        console.log("Fetching user info for tgId:", tgId); // 添加日志
        const response = await fetch(`/api/user/info?tgId=${tgId}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log("Received user data:", data); // 添加日志
        setUsername(data.username || `User${tgId}`);
        setPoints(data.points || 0);
        setUsdt(data.usdt || 0);
      } catch (error) {
        console.error('Error fetching user info:', error);
        // 可以在这里添加一些用户友好的错误处理，比如设置一个错误状态
      }
    } else {
      console.log("No tgId available, cannot fetch user info"); // 添加日志
    }
  }, [tgId]);

  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;
    if (tg && tg.initDataUnsafe?.user) {
      setTgId(tg.initDataUnsafe.user.id);
      console.log("Telegram user ID:", tg.initDataUnsafe.user.id); // 添加日志
    } else {
      console.log("Telegram WebApp not initialized or user data not available"); // 添加日志
    }
  }, []);

  useEffect(() => {
    if (tgId && !isGuestMode) {
      console.log("Calling fetchUserInfo"); // 添加日志
      fetchUserInfo();
    }
  }, [tgId, isGuestMode, fetchUserInfo]);

  useEffect(() => {
    if (!isGuestMode) {
      fetchGameData();
    }
    shuffleIcons();
    // 初始化槽位显示
    slotRefs.forEach((ref) => {
      if (ref.current) {
        updateIconsDisplay(ref.current, [5]); // 5 是 BTC 的索引
      }
    });
  }, [isGuestMode]);

  const shuffleIcons = () => {
    const shuffled = [...exchangeIcons].sort(() => Math.random() - 0.5);
    setShuffledIcons(shuffled);
  };

  const fetchGameData = async () => {
    try {
      const response = await fetch('/api/game/data');
      const data = await response.json();
      setGameData(data);
      // 根据获取的数据更新游戏设置
      if (data.exchangeIcons) {
        setShuffledIcons(data.exchangeIcons);
      }
      // 可以添加更多的数据处理逻辑
    } catch (error) {
      console.error('Error fetching game data:', error);
    }
  };

  const generateSpinResult = () => {
    return Array(3).fill(0).map(() => Math.floor(Math.random() * exchangeIcons.length));
  };

  const checkWin = (result: number[]) => {
    const icons = result.map(index => exchangeIcons[index]);
    return icons[0] === icons[1] && icons[1] === icons[2];
  };

  const handleSpin = async () => {
    if (!isSpinning) {
      setIsSpinning(true);
      try {
        const response = await fetch('/api/game/spin', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ /* 可以添加一些参数，如下注金额等 */ }),
        });
        const result = await response.json();
        console.log('Spin result:', result);
        setFinalPositions(result.positions);
        animateSlots(result.positions);
        setTimeout(() => {
          setIsSpinning(false);
          const isWin = checkWin(result.positions);
          console.log('Win:', isWin);
          console.log('Final positions:', result.positions.map((index: number) => exchangeIcons[index]));
          // 处理中奖逻辑
          if (isWin) {
            // 更新用户信息
            fetchUserInfo();
          }
        }, 5000);
      } catch (error) {
        console.error('Error during spin:', error);
        setIsSpinning(false);
      }
    }
  };

  const animateSlots = (result: number[]) => {
    const imageHeight = 80; // 图片高度（像素）
    const totalIcons = exchangeIcons.length;
    const minSpins = 2; // 最小旋转圈数
    const maxExtraSpins = 3; // 最大额外旋转圈数

    slotRefs.forEach((ref, index) => {
      if (ref.current) {
        const extraSpins = Math.floor(Math.random() * maxExtraSpins);
        const totalSpins = minSpins + extraSpins;
        const duration = 3 + index * 0.5 + extraSpins * 0.5; // 基础3秒 + 每个槽位增加0.5秒 + 每额外旋转增加0.5秒

        // 生成动画序列
        const sequence = generateAnimationSequence(totalSpins * baseIcons.length, result[index]);

        // 应用动画
        ref.current.style.transition = 'none';
        ref.current.style.transform = 'translateY(0px)';
        ref.current.offsetHeight; // 触发重排
        ref.current.style.transition = `transform ${duration}s cubic-bezier(0.25, 0.1, 0.25, 1)`;
        ref.current.style.transform = `translateY(-${(sequence.length - 1) * imageHeight}px)`;

        // 更新图标显示
        updateIconsDisplay(ref.current, sequence);

        // 动画结束后设置最终位置
        setTimeout(() => {
          if (ref.current) {
            ref.current.style.transition = 'none';
            ref.current.style.transform = `translateY(-${(sequence.length - 1) * imageHeight}px)`;
          }
        }, duration * 1000);
      }
    });
  };

  const generateAnimationSequence = (length: number, finalIndex: number): number[] => {
    const sequence: number[] = [];
    let lastIndex = -1;

    // 开始时使用基础图标
    for (let i = 0; i < length - 20; i++) {
      let index;
      do {
        index = i % baseIcons.length;
      } while (index === lastIndex);
      sequence.push(index);
      lastIndex = index;
    }

    // 过渡到真实图标分布
    for (let i = 0; i < 20; i++) {
      let index;
      do {
        index = Math.floor(Math.random() * exchangeIcons.length);
      } while (index === lastIndex);
      sequence.push(index);
      lastIndex = index;
    }

    // 确保最后一个是结果
    sequence[sequence.length - 1] = finalIndex;

    return sequence;
  };

  const updateIconsDisplay = (container: HTMLElement, sequence: number[]) => {
    container.innerHTML = '';
    sequence.forEach((index) => {
      const img = document.createElement('img');
      img.src = exchangeIcons[index];
      img.alt = `Icon ${index}`;
      img.className = 'object-contain w-20 h-20';
      container.appendChild(img);
    });
  };

  const handleInvite = () => {
    alert('邀请链接已复制！');
  };

  const handleAutoSpin = (times: number) => {
    if (times > 0 && !isSpinning) {
      handleSpin();
      setTimeout(() => handleAutoSpin(times - 1), 3000); // 与动画时间一致 (3秒)
    }
  };

  const toggleUserProfile = () => {
    setShowUserProfile(!showUserProfile);
  };

  return (
    <div className="slot-machine flex flex-col items-center p-4 bg-gradient-to-b from-indigo-900 to-purple-900 min-h-screen">
      {!isGuestMode && (
        <div className="w-full max-w-md mb-4 bg-white bg-opacity-10 rounded-lg p-4 text-white">
          {tgId ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-xl font-bold mr-3">
                  {username ? username[0].toUpperCase() : '?'}
                </div>
                <div>
                  <p className="font-semibold">@{username || 'Loading...'}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <FaTicketAlt className="text-yellow-400 mr-1" />
                  <span>{points !== undefined ? points : 'Loading...'}</span>
                </div>
                <div className="flex items-center">
                  <FaDollarSign className="text-green-400 mr-1" />
                  <span>{usdt !== undefined ? usdt.toFixed(2) : 'Loading...'}</span>
                </div>
              </div>
            </div>
          ) : (
            <p>Unable to load user data. Please try refreshing the page.</p>
          )}
        </div>
      )}
      <SlotDisplay slotRefs={slotRefs} finalPositions={finalPositions} exchangeIcons={shuffledIcons} />
      <SpinButton isSpinning={isSpinning} onSpin={handleSpin} />
      <ActionButtons isSpinning={isSpinning} onInvite={handleInvite} onAutoSpin={() => handleAutoSpin(5)} />
    </div>
  );
};

const UserInfo: React.FC<{ 
  username: string | null; 
  points: number; 
  usdt: number;
  onProfileClick: () => void;
}> = ({ username, points, usdt, onProfileClick }) => (
  <div 
    className="flex items-center space-x-4 mb-4 bg-white bg-opacity-20 p-3 rounded-lg shadow-lg w-full max-w-md cursor-pointer"
    onClick={onProfileClick}
  >
    <div className="flex-shrink-0">
      <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center text-xl font-bold">
        {username ? username[0].toUpperCase() : '?'}
      </div>
    </div>
    <div className="flex-grow">
      <p className="text-white font-semibold">{username || 'Loading...'}</p>
      <p className="text-sm text-gray-300">Points: {points}</p>
      <p className="text-sm text-gray-300">USDT: {usdt !== null && usdt !== undefined ? usdt.toFixed(2) : 'Loading...'}</p>
    </div>
  </div>
);

const SlotDisplay: React.FC<{ slotRefs: React.RefObject<HTMLDivElement>[]; finalPositions: number[]; exchangeIcons: string[] }> = ({ slotRefs, finalPositions, exchangeIcons }) => (
  <div className="slots flex justify-center gap-2 bg-gray-800 rounded-lg p-4 shadow-inner overflow-hidden">
    {slotRefs.map((ref, index) => (
      <div key={index} className="w-24 h-20 bg-white rounded-md relative overflow-hidden">
        <div ref={ref} className="flex flex-col items-center absolute top-0 left-0 right-0">
          <Image
            src={exchangeIcons[finalPositions[index]]}
            alt={`Initial Icon`}
            width={80}
            height={80}
            className="object-contain w-20 h-20"
          />
        </div>
      </div>
    ))}
  </div>
);

const SpinButton: React.FC<{ isSpinning: boolean; onSpin: () => void }> = ({ isSpinning, onSpin }) => (
  <button
    onClick={onSpin}
    disabled={isSpinning}
    className={`mt-4 w-full py-3 rounded-full text-white font-bold text-lg ${
      isSpinning ? 'bg-gray-400 cursor-not-allowed' : 'bg-yellow-500 hover:bg-yellow-600'
    }`}
  >
    {isSpinning ? 'Spinning...' : 'Spin'}
  </button>
);

const ActionButtons: React.FC<{ isSpinning: boolean; onInvite: () => void; onAutoSpin: () => void }> = ({ isSpinning, onInvite, onAutoSpin }) => (
  <div className="flex space-x-2 w-full mt-2">
    <button
      onClick={onInvite}
      className="flex items-center justify-center px-4 py-2 text-sm bg-green-600 text-white rounded-full shadow hover:bg-green-700 flex-1"
    >
      Invite Friends
    </button>
    <button
      onClick={onAutoSpin}
      disabled={isSpinning}
      className={`flex items-center justify-center px-4 py-2 text-sm rounded-full shadow flex-1 ${
        isSpinning ? 'bg-gray-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700 text-white'
      }`}
    >
      Auto Spin 5 Times
    </button>
  </div>
);

export default SlotMachine;