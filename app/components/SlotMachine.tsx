// app/components/SlotMachine.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useTranslation } from '../hooks/useTranslation';

const SlotMachine: React.FC = () => {
  const { t } = useTranslation();
  const [username, setUsername] = useState<string | null>(null);
  const [points, setPoints] = useState(0);
  const [usdt, setUsdt] = useState(0);
  const [spinsLeft, setSpinsLeft] = useState(3);

  // 模拟交易所图标（请替换为实际图标路径）
  const exchangeIcons = [
    '/images/binance.png',
    '/images/okx.png',
    '/images/huobi.png',
    '/images/tokenpocket.png',
    '/images/gate.png',
    '/images/bitget.png',
    '/images/metamask.png',
    '/images/btc.png',
  ];

  const [slots, setSlots] = useState<number[]>([0, 0, 0]);
  const [isSpinning, setIsSpinning] = useState(false);

  const totalIcons = exchangeIcons.length;

  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const bigWinAudioRef = useRef<HTMLAudioElement | null>(null);
  const smallWinAudioRef = useRef<HTMLAudioElement | null>(null);

  const [autoSpinCount, setAutoSpinCount] = useState(0);

  const [tgId, setTgId] = useState<number | null>(null);

  const [isMuted, setIsMuted] = useState(false);

  const [autoSpinProgress, setAutoSpinProgress] = useState(0);

  const [winAnimation, setWinAnimation] = useState<'big' | 'small' | null>(null);
  const [winAmount, setWinAmount] = useState<string>('');

  const [lastSpinTime, setLastSpinTime] = useState<number | null>(null);

  const [userPhotoUrl, setUserPhotoUrl] = useState<string | null>(null);

  useEffect(() => {
    // 在客户端初始化音频
    setAudio(new Audio('/sounds/spin.mp3'));
    bigWinAudioRef.current = new Audio('/sounds/big-win.mp3');
    smallWinAudioRef.current = new Audio('/sounds/small-win.mp3');
  }, []);

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (audio) {
      audio.muted = !isMuted;
    }
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
    console.log("Initializing Telegram WebApp");
    const tg = (window as any).Telegram?.WebApp;
    console.log("Telegram object:", tg);
    if (tg) {
      console.log("Telegram WebApp found:", tg);
      console.log("InitData:", tg.initData);
      console.log("InitDataUnsafe:", tg.initDataUnsafe);
      const user = tg.initDataUnsafe?.user;
      console.log("Telegram user:", user);
      if (user) {
        setTgId(user.id);
        setUsername(user.username || `${user.first_name} ${user.last_name}`.trim());
        console.log("User photo URL:", user.photo_url);
        setUserPhotoUrl(user.photo_url);
        
        // 获取用户信息
        fetch(`/api/user/info?tgId=${user.id}&username=${encodeURIComponent(user.username || '')}`)
          .then(res => res.json())
          .then(data => {
            console.log("User info from API:", data);
            setPoints(data.points);
            setUsdt(data.usdt);
            setSpinsLeft(data.spinsLeft);
            setLastSpinTime(data.lastSpinTime);
            if (data.username) {
              setUsername(data.username);
            }
          })
          .catch(error => console.error('Error fetching user info:', error));
      } else {
        console.log("No user found in Telegram WebApp");
      }
    } else {
      console.log("Telegram WebApp not available");
    }
  }, []);

  const isFreeSpinAvailable = () => {
    if (!lastSpinTime) return true;
    const now = new Date().getTime();
    const hoursSinceLastSpin = (now - lastSpinTime) / (1000 * 60 * 60);
    return hoursSinceLastSpin >= 24;
  };

  const checkWinning = (finalSlots: number[]): 'big' | 'small' | null => {
    const [slot1, slot2, slot3] = finalSlots;
    if (slot1 === slot2 && slot2 === slot3) {
      return 'big';
    } else if (slot1 === slot2 || slot2 === slot3 || slot1 === slot3) {
      return 'small';
    }
    return null;
  };

  const playWinSound = (winType: 'big' | 'small' | null) => {
    if (isMuted) return;
    if (winType === 'big' && bigWinAudioRef.current) {
      bigWinAudioRef.current.play();
    } else if (winType === 'small' && smallWinAudioRef.current) {
      smallWinAudioRef.current.play();
    }
  };

  const handleWinning = async (winType: 'big' | 'small' | null) => {
    let pointsWon = 0;
    let usdtWon = 0;
    if (winType === 'big') {
      pointsWon = 100;
      usdtWon = 1;
    } else if (winType === 'small') {
      pointsWon = 50;
      usdtWon = 0.5;
    }

    if (pointsWon > 0 || usdtWon > 0) {
      const response = await fetch('/api/user/win', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tgId, pointsWon, usdtWon }),
      });
      const data = await response.json();
      setPoints(data.newPoints);
      setUsdt(data.newUsdt);
      
      setWinAnimation(winType);
      setWinAmount(`🎟️ ${pointsWon} ${t('slotMachine.points')} & 💰 ${usdtWon} ${t('slotMachine.usdt')}`);
      
      playWinSound(winType);

      setTimeout(() => {
        setWinAnimation(null);
        setWinAmount('');
      }, 3000);
    }
  };

  const handleSpin = async (auto = false) => {
    console.log("Spin attempt:", { tgId, spinsLeft, isSpinning, isFreeSpinAvailable: isFreeSpinAvailable() });
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

        if (!isMuted && audio) {
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
            if (winType) {
              handleWinning(winType);
            } else {
              // 处理没有中奖的情况
              setWinAnimation(null);
              setWinAmount('');
            }
            
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
      console.log("Spin conditions not met", { spinsLeft, isSpinning, tgId, isFreeSpinAvailable: isFreeSpinAvailable() });
      if (spinsLeft <= 0 && !isFreeSpinAvailable()) {
        alert("您的旋转次数已用完，请等待24小时后的免费旋转");
      } else if (!tgId) {
        alert("请先登录");
        console.error("tgId is null, user not logged in");
      }
    }
  };

  const handleInvite = () => {
    if (tgId) {
      const inviteLink = `${window.location.origin}?ref=${tgId}`;
      navigator.clipboard.writeText(inviteLink);
      alert('邀请链接已复制！');
    } else {
      alert('无法生邀请链接,请确保已登录。');
    }
  };

  const fetchUserPhoto = async (userId: number) => {
    try {
      const response = await fetch(`/api/user/photo?userId=${userId}`);
      const data = await response.json();
      if (data.photoUrl) {
        setUserPhotoUrl(data.photoUrl);
      }
    } catch (error) {
      console.error("Error fetching user photo:", error);
    }
  };

  return (
    <div className="flex flex-col items-center p-4 bg-gradient-to-b from-indigo-900 to-purple-900 min-h-screen">
      {/* 用户信息 */}
      <div className="flex items-center space-x-4 mb-4 bg-white bg-opacity-20 p-3 rounded-lg shadow-lg w-full max-w-sm">
        <div className="flex-shrink-0">
          {userPhotoUrl ? (
            <Image
              src={userPhotoUrl}
              alt="User Avatar"
              width={48}
              height={48}
              className="rounded-full"
              onError={() => {
                console.error("Failed to load user avatar");
                setUserPhotoUrl(null);
              }}
            />
          ) : (
            <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center text-xl font-bold">
              {username ? username[0].toUpperCase() : '?'}
            </div>
          )}
        </div>
        <div className="flex-grow">
          <p className="text-white font-semibold">{username || 'Loading...'}</p>
          <p className="text-sm text-gray-300">{t('slotMachine.points')}: {points}</p>
          <p className="text-sm text-gray-300">{t('slotMachine.usdt')}: {usdt}</p>
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
              <Image
                src={exchangeIcons[slotIndex]}
                alt="Exchange Icon"
                width={48}
                height={48}
                className={`transition-transform duration-100 ${
                  isSpinning ? 'animate-spin' : ''
                }`}
              />
            </div>
          ))}
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
            {isFreeSpinAvailable() ? t('slotMachine.freeSpinAvailable') : `${t('slotMachine.spinsLeft')}: ${spinsLeft}`}
          </span>
          <button
            onClick={() => handleSpin()}
            disabled={isSpinning || (!isFreeSpinAvailable() && spinsLeft === 0) || !tgId}
            className={`mt-2 px-4 py-2 text-sm rounded-full shadow ${
              isSpinning || (!isFreeSpinAvailable() && spinsLeft === 0) || !tgId ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {isSpinning ? '旋转中...' : t('slotMachine.spin')}
          </button>
          <button
            onClick={handleInvite}
            className="mt-2 px-4 py-2 text-sm bg-green-600 text-white rounded-full shadow hover:bg-green-700"
          >
            {t('slotMachine.invite')}
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
            {t('slotMachine.autoSpin')}
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

      {/* 中奖弹窗 */}
      {winAnimation && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-xl text-center">
            <h2 className={`text-4xl font-bold mb-4 ${winAnimation === 'big' ? 'text-yellow-500' : 'text-green-500'}`}>
              {winAnimation === 'big' ? t('slotMachine.bigWin') : t('slotMachine.smallWin')}
            </h2>
            <p className="text-2xl mb-4">{t('slotMachine.congratulations', { amount: winAmount })}</p>
            <button
              onClick={() => {
                setWinAnimation(null);
                setWinAmount('');
              }}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              {t('slotMachine.continueGame')}
            </button>
          </div>
        </div>
      )}

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