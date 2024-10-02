// app/components/SlotMachine.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';

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

  const [slots, setSlots] = useState<number[]>([0, 0, 0]);
  const [isSpinning, setIsSpinning] = useState(false);

  const totalIcons = exchangeIcons.length;

  const [audio] = useState(new Audio('/sounds/spin.mp3')); // 请确保你有这个音频文件

  const [autoSpinCount, setAutoSpinCount] = useState(0);

  const [tgId, setTgId] = useState<number | null>(null);

  const [isMuted, setIsMuted] = useState(false);

  const [autoSpinProgress, setAutoSpinProgress] = useState(0);

  const [winAnimation, setWinAnimation] = useState<'big' | 'small' | null>(null);

  const [lastSpinTime, setLastSpinTime] = useState<number | null>(null);

  const bigWinAudio = useRef(new Audio('/sounds/big-win.mp3'));
  const smallWinAudio = useRef(new Audio('/sounds/small-win.mp3'));

  const toggleMute = () => {
    setIsMuted(!isMuted);
    audio.muted = !isMuted;
  };

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const referrerId = searchParams.get('ref');
    if (referrerId && tgId) {
      // 将 referrerId 和当前用户的 tgId 发送到后端，记录邀请关系
      fetch('/api/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ referrerId, tgId }),
      });
    }
  }, [tgId]);

  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;
    if (tg) {
      const user = tg.initDataUnsafe.user;
      const userData = {
        tgId: user.id,
        username: user.username,
        fullName: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
      };
      // 将用户信息发送到后端
      fetch('/api/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      // 更新前端状态
      setTgId(user.id);
      setUsername(`@${user.username || 'unknown'}`);
    }
  }, []);

  useEffect(() => {
    if (tgId) {
      // 获取用户的最新信息,包括上次旋转时间
      fetch(`/api/user/info?tgId=${tgId}`)
        .then(res => res.json())
        .then(data => {
          setPoints(data.points);
          setUsdtBalance(data.usdtBalance);
          setSpinsLeft(data.spinsLeft);
          setLastSpinTime(data.lastSpinTime);
        });
    }
  }, [tgId]);

  const isFreeSpinAvailable = () => {
    if (!lastSpinTime) return true;
    const now = new Date().getTime();
    const hoursSinceLastSpin = (now - lastSpinTime) / (1000 * 60 * 60);
    return hoursSinceLastSpin >= 24;
  };

  const checkWinning = (finalSlots: number[]) => {
    const [slot1, slot2, slot3] = finalSlots;
    if (slot1 === slot2 && slot2 === slot3) {
      return 'big';
    } else if (slot1 === slot2 || slot2 === slot3 || slot1 === slot3) {
      return 'small';
    }
    return 'none';
  };

  const playWinSound = (winType: 'big' | 'small' | 'none') => {
    // 暂时不播放声音
    console.log(`Would play ${winType} win sound`);
  };

  const handleWinning = async (winType: 'big' | 'small' | 'none') => {
    let winAmount = 0;
    if (winType === 'big') {
      winAmount = 100;
      setWinAnimation('big');
    } else if (winType === 'small') {
      winAmount = 50;
      setWinAnimation('small');
    }

    if (winAmount > 0) {
      const response = await fetch('/api/user/win', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tgId, winAmount }),
      });
      const data = await response.json();
      setPoints(data.newPoints);
      
      // 播放中奖音效
      playWinSound(winType);

      // 3秒后清除动画状态
      setTimeout(() => setWinAnimation(null), 3000);
    }
  };

  const handleSpin = async (auto = false) => {
    console.log("handleSpin called", { spinsLeft, isSpinning, tgId });
    if ((spinsLeft > 0 || isFreeSpinAvailable()) && !isSpinning && tgId) {
      setIsSpinning(true);
      try {
        const response = await fetch('/api/user/spin', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ tgId, isFreeSpin: isFreeSpinAvailable() }),
        });
        if (!response.ok) {
          throw new Error('Spin request failed');
        }
        const data = await response.json();
        setSpinsLeft(data.spinsLeft);
        setLastSpinTime(data.lastSpinTime);

        if (!isMuted) {
          audio.play();
        }

        let spins = 0;
        const maxSpins = 20;

        const spinInterval = setInterval(() => {
          setSlots([
            Math.floor(Math.random() * totalIcons),
            Math.floor(Math.random() * totalIcons),
            Math.floor(Math.random() * totalIcons),
          ]);
          spins++;

          if (spins >= maxSpins) {
            clearInterval(spinInterval);
            setIsSpinning(false);
            
            const finalSlots = [
              Math.floor(Math.random() * totalIcons),
              Math.floor(Math.random() * totalIcons),
              Math.floor(Math.random() * totalIcons),
            ];
            setSlots(finalSlots);
            
            const winType = checkWinning(finalSlots);
            handleWinning(winType);
            
            if (auto && autoSpinCount > 1) {
              setAutoSpinCount(autoSpinCount - 1);
              setTimeout(() => handleSpin(true), 1000);
            } else {
              setAutoSpinCount(0);
            }
          }
        }, 100);
      } catch (error) {
        console.error("Error during spin:", error);
        setIsSpinning(false);
        alert("旋转失败，请稍后再试");
      }
    } else {
      console.log("Spin conditions not met", { spinsLeft, isSpinning, tgId });
      if (spinsLeft <= 0 && !isFreeSpinAvailable()) {
        alert("您的旋转次数已用完,请等待24小时后的免费旋转");
      } else if (!tgId) {
        alert("请先登录");
      }
    }
  };

  const handleInvite = () => {
    if (tgId) {
      const inviteLink = `${window.location.origin}?ref=${tgId}`;
      navigator.clipboard.writeText(inviteLink);
      alert('邀请链接已复制！');
    } else {
      alert('无法生成邀请链接,请确保已登录。');
    }
  };

  const handleExchange = () => {
    if (points >= 100) {
      setPoints(points - 100);
      setUsdtBalance(usdtBalance + 1);
      alert('兑换成功！100积分已兑换为1 USDT');
    } else {
      alert('积分不足，无法兑换');
    }
  };

  return (
    <div className="flex flex-col items-center p-4 bg-gradient-to-b from-indigo-900 to-purple-900 min-h-screen">
      {/* 用户信息 */}
      <div className="flex items-center space-x-4 mb-4 bg-white bg-opacity-20 p-3 rounded-lg shadow-lg w-full max-w-sm">
        <div className="flex items-center flex-1">
          <span className="mr-1 text-xl">👤</span>
          <span className="text-sm font-semibold text-white">{username}</span>
        </div>
        <div className="flex items-center flex-1">
          <span className="mr-1 text-xl">💎</span>
          <span className="text-sm font-semibold text-white">{points}</span>
        </div>
        <div className="flex items-center flex-1">
          <span className="mr-1 text-xl">💰</span>
          <span className="text-sm font-semibold text-white">{usdtBalance}</span>
        </div>
      </div>

      {/* 老虎机界面 */}
      <div className="relative w-full max-w-xs p-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg shadow-2xl">
        {/* 拉杆 */}
        <div className="absolute right-[-40px] top-1/2 transform -translate-y-1/2 h-36">
          <div className="relative h-full w-12">
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-red-600 rounded-full shadow-md"></div>
            <div className="absolute top-3 left-1/2 transform -translate-x-1/2 w-1 h-28 bg-gradient-to-b from-gray-300 to-gray-400 rounded-full shadow-md"></div>
            <button
              onClick={() => handleSpin()}
              disabled={isSpinning}
              className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-14 rounded-b-full shadow-lg transition-transform duration-200 ${
                isSpinning 
                  ? 'bg-gray-400 translate-y-1' 
                  : 'bg-red-600 hover:bg-red-700 hover:translate-y-0.5 active:translate-y-1'
              }`}
            >
              <span className="text-white text-xl">▼</span>
            </button>
          </div>
        </div>

        {/* 老虎机图标 */}
        <div className="grid grid-cols-3 gap-2 relative">
          {slots.map((slotIndex, index) => (
            <div
              key={index}
              className="w-16 h-16 bg-white flex items-center justify-center rounded-md shadow-md overflow-hidden"
            >
              <img
                src={exchangeIcons[slotIndex]}
                alt="Exchange Icon"
                className={`w-12 h-12 transition-transform duration-100 ${
                  isSpinning ? 'animate-spin' : ''
                }`}
              />
            </div>
          ))}
          {winAnimation && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className={`text-4xl ${winAnimation === 'big' ? 'text-yellow-400' : 'text-green-400'} animate-bounce`}>
                {winAnimation === 'big' ? '大奖!' : '小奖!'}
              </div>
            </div>
          )}
        </div>

        {/* 静音按钮 */}
        <button
          onClick={toggleMute}
          className="absolute top-2 right-2 text-white text-xl"
        >
          {isMuted ? '🔇' : '🔊'}
        </button>

        {/* 剩余次数和按钮 */}
        <div className="flex flex-col items-center mt-4">
          <span className="text-white text-sm">
            {isFreeSpinAvailable() ? '免费旋转可用!' : `剩余次数：${spinsLeft}`}
          </span>
          <button
            onClick={() => handleSpin()}
            disabled={isSpinning || (!isFreeSpinAvailable() && spinsLeft === 0) || !tgId}
            className={`mt-2 px-4 py-2 text-sm rounded-full shadow ${
              isSpinning || (!isFreeSpinAvailable() && spinsLeft === 0) || !tgId ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {isSpinning ? '旋转中...' : 'Spin'}
          </button>
          <button
            onClick={handleInvite}
            className="mt-2 px-4 py-2 text-sm bg-green-600 text-white rounded-full shadow hover:bg-green-700"
          >
            邀请好友
          </button>
          <button
            onClick={handleExchange}
            className="mt-2 px-4 py-2 text-sm bg-yellow-600 text-white rounded-full shadow hover:bg-yellow-700"
          >
            兑换USDT
          </button>
          <button
            onClick={() => {
              setAutoSpinCount(5);
              handleSpin(true);
            }}
            disabled={isSpinning || spinsLeft < 5}
            className={`mt-2 px-4 py-2 text-sm rounded-full shadow ${
              isSpinning || spinsLeft < 5 ? 'bg-gray-400' : 'bg-purple-600 hover:bg-purple-700 text-white'
            }`}
          >
            自动旋转5次
          </button>
        </div>

        {autoSpinCount > 0 && (
          <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
            <div
              className="bg-blue-600 h-2.5 rounded-full"
              style={{ width: `${autoSpinProgress}%` }}
            ></div>
          </div>
        )}
      </div>

      {/* 添加调试信息 */}
      <div className="mt-4 text-white text-xs">
        <p>tgId: {tgId}</p>
        <p>spinsLeft: {spinsLeft}</p>
        <p>isSpinning: {isSpinning ? 'true' : 'false'}</p>
      </div>
    </div>
  );
};

export default SlotMachine;