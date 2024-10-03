// app/components/SlotMachine.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useTranslation } from '../hooks/useTranslation';
import { IoVolumeHigh, IoVolumeMute } from 'react-icons/io5';
import { FaSpinner, FaUserPlus, FaPlay, FaRedo } from 'react-icons/fa';

const SlotMachine: React.FC = () => {
  const { t } = useTranslation();
  const [username, setUsername] = useState<string | null>(null);
  const [points, setPoints] = useState(0);
  const [usdt, setUsdt] = useState(0);
  const [spinsLeft, setSpinsLeft] = useState(3);

  const exchangeIcons = [
    '/images/btc.png',
    '/images/binance.png',
    '/images/okx.png',
    '/images/huobi.png',
    '/images/bitget.png',
    '/images/metamask.png',
    '/images/gate.png',
    '/images/tokenpocket.png',
  ];

  const [isSpinning, setIsSpinning] = useState(false);
  const [finalPositions, setFinalPositions] = useState<number[]>([0, 0, 0]);
  const slotRefs = [useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null)];

  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [winAnimation, setWinAnimation] = useState<'big' | 'small' | null>(null);
  const [winAmount, setWinAmount] = useState<string>('');
  const [tgId, setTgId] = useState<number | null>(null);
  const [lastSpinTime, setLastSpinTime] = useState<number | null>(null);
  const [userPhotoUrl, setUserPhotoUrl] = useState<string | null>(null);

  useEffect(() => {
    const initTelegramApp = () => {
      const tg = (window as any).Telegram?.WebApp;
      if (tg) {
        console.log("Telegram WebApp found:", tg);
        console.log("InitData:", tg.initData);
        console.log("InitDataUnsafe:", tg.initDataUnsafe);
        const user = tg.initDataUnsafe?.user;
        console.log("Telegram user:", user);
        if (user) {
          setTgId(user.id);
          setUsername(user.username || `${user.first_name} ${user.last_name}`.trim());
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
    };

    initTelegramApp();
  }, []);

  useEffect(() => {
    setAudio(new Audio('/sounds/spin.mp3'));
  }, []);

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (audio) {
      audio.muted = !isMuted;
    }
  };

  const isFreeSpinAvailable = () => {
    if (!lastSpinTime) return true;
    const now = new Date().getTime();
    const hoursSinceLastSpin = (now - lastSpinTime) / (1000 * 60 * 60);
    return hoursSinceLastSpin >= 24;
  };

  const getWinProbability = (iconName: string): number => {
    const probabilities: { [key: string]: number } = {
      'btc': 0.01,
      'binance': 0.02,
      'okx': 0.03,
      'huobi': 0.04,
      'bitget': 0.05,
      'metamask': 0.05,
      'gate': 0.05,
      'tokenpocket': 0.05,
    };
    return probabilities[iconName] || 0;
  };

  const handleSpin = async () => {
    if ((spinsLeft > 0 || isFreeSpinAvailable()) && !isSpinning && tgId) {
      setIsSpinning(true);
      if (!isMuted && audio) {
        audio.play();
      }

      try {
        const response = await fetch('/api/user/spin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tgId, isFreeSpin: isFreeSpinAvailable() }),
        });
        if (!response.ok) throw new Error('Spin request failed');
        const data = await response.json();
        setSpinsLeft(data.spinsLeft);
        setLastSpinTime(data.lastSpinTime);

        const newPositions = Array(3).fill(0).map(() => Math.floor(Math.random() * exchangeIcons.length));

        slotRefs.forEach((ref, index) => {
          if (ref.current) {
            ref.current.style.transition = 'none';
            ref.current.style.transform = 'translateY(0)';
            void ref.current.offsetHeight; // Force reflow
            ref.current.style.transition = `transform ${2 + index * 0.5}s cubic-bezier(0.25, 0.1, 0.25, 1)`;
            ref.current.style.transform = `translateY(-${newPositions[index] * 100}%)`;
          }
        });

        setTimeout(() => {
          setIsSpinning(false);
          setFinalPositions(newPositions);
          checkWinning(newPositions);
        }, 4000); // Adjust this timeout based on the longest animation duration

      } catch (error) {
        console.error("Error during spin:", error);
        setIsSpinning(false);
        alert("旋转失败，请稍后再试");
      }
    }
  };

  const checkWinning = (positions: number[]) => {
    if (positions[0] === positions[1] && positions[1] === positions[2]) {
      const iconName = exchangeIcons[positions[0]].split('/').pop()?.split('.')[0] || '';
      handleWinning(iconName);
    }
  };

  const handleWinning = async (iconName: string) => {
    const probability = getWinProbability(iconName);
    const usdtWon = parseFloat(((Math.random() * 0.9 + 0.1) * (1 - probability)).toFixed(2));
    const pointsWon = Math.floor((Math.random() * 901 + 100) * (1 - probability));

    try {
      const response = await fetch('/api/user/win', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tgId, usdtWon, pointsWon }),
      });
      const data = await response.json();
      setPoints(prevPoints => prevPoints + pointsWon);
      setUsdt(prevUsdt => parseFloat((prevUsdt + usdtWon).toFixed(2)));
      
      setWinAnimation('big');
      setWinAmount(`🎟️ ${pointsWon} ${t('slotMachine.points')} & 💰 ${usdtWon.toFixed(2)} ${t('slotMachine.usdt')}`);

      setTimeout(() => {
        setWinAnimation(null);
        setWinAmount('');
      }, 3000);
    } catch (error) {
      console.error("Error updating win:", error);
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
      <div className="flex items-center space-x-4 mb-4 bg-white bg-opacity-20 p-3 rounded-lg shadow-lg w-full max-w-md">
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

      {/* 老虎机界面 - 调整宽度和内边距 */}
      <div className="relative w-full max-w-sm mx-auto p-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg shadow-2xl">
        {/* 声音按钮 */}
        <button
          onClick={toggleMute}
          className="absolute top-2 right-2 text-white bg-purple-600 hover:bg-purple-700 rounded-full p-1.5 transition-colors duration-200 shadow-lg z-10 focus:outline-none focus:ring-2 focus:ring-purple-400"
          aria-label={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? <IoVolumeMute className="w-5 h-5" /> : <IoVolumeHigh className="w-5 h-5" />}
        </button>

        {/* 老虎机图标 - 调整大小和间距 */}
        <div className="grid grid-cols-3 gap-2 bg-white rounded-lg p-2 overflow-hidden">
          {[0, 1, 2].map((slotIndex) => (
            <div key={slotIndex} className="w-24 h-24 bg-gray-200 rounded-md overflow-hidden">
              <div
                ref={slotRefs[slotIndex]}
                className="flex flex-col transition-transform duration-1000 ease-in-out"
                style={{ transform: `translateY(-${finalPositions[slotIndex] * 100}%)` }}
              >
                {[...Array(exchangeIcons.length * 2)].map((_, index) => (
                  <div key={index} className="w-24 h-24 flex items-center justify-center">
                    <Image 
                      src={exchangeIcons[index % exchangeIcons.length]} 
                      alt="Exchange Icon" 
                      width={60} 
                      height={60} 
                      className="object-contain" 
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* 旋转按钮 */}
        <button
          onClick={handleSpin}
          disabled={isSpinning || (!isFreeSpinAvailable() && spinsLeft === 0) || !tgId}
          className={`mt-4 w-full py-3 rounded-full text-white font-bold text-lg ${
            isSpinning || (!isFreeSpinAvailable() && spinsLeft === 0) || !tgId
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-yellow-500 hover:bg-yellow-600'
          }`}
        >
          {isSpinning ? (
            <>
              <FaSpinner className="inline-block animate-spin mr-2" />
              {t('slotMachine.spinning')}
            </>
          ) : (
            <>
              <FaPlay className="inline-block mr-2" />
              {t('slotMachine.spin')}
            </>
          )}
        </button>

        {/* 其他按钮（邀请好友等） */}
        <div className="flex space-x-2 w-full mt-2">
          <button
            onClick={handleInvite}
            className="flex items-center justify-center px-4 py-2 text-sm bg-green-600 text-white rounded-full shadow hover:bg-green-700 flex-1"
          >
            <FaUserPlus className="mr-1" />
            {t('slotMachine.invite')}
          </button>
          <button
            onClick={() => {
              // 处理自动旋转逻辑
            }}
            disabled={isSpinning || spinsLeft < 5}
            className={`flex items-center justify-center px-4 py-2 text-sm rounded-full shadow flex-1 ${
              isSpinning || spinsLeft < 5 ? 'bg-gray-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700 text-white'
            }`}
          >
            <FaRedo className="mr-1" />
            {t('slotMachine.autoSpin')}
          </button>
        </div>
      </div>

      {/* 中奖弹窗 */}
      {winAnimation && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-xl text-center">
            <h2 className="text-4xl font-bold mb-4 text-yellow-500">{t('slotMachine.bigWin')}</h2>
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

      {/* 调试信息 */}
      <div className="mt-4 text-white text-xs">
        <p>tgId: {tgId}</p>
        <p>spinsLeft: {spinsLeft}</p>
        <p>isSpinning: {isSpinning ? 'true' : 'false'}</p>
      </div>
    </div>
  );
};

export default SlotMachine;