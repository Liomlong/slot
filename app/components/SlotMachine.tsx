'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useTranslation } from '../hooks/useTranslation';
import { IoVolumeHigh, IoVolumeMute } from 'react-icons/io5';
import { FaSpinner, FaUserPlus, FaPlay, FaRedo } from 'react-icons/fa';
import Rank from './Rank';

interface SlotMachineProps {
  isGuestMode: boolean;
}

const SlotMachine: React.FC<SlotMachineProps> = ({ isGuestMode }) => {
  const { t } = useTranslation();
  const [username, setUsername] = useState<string | null>(null);
  const [points, setPoints] = useState(0);
  const [usdt, setUsdt] = useState(0);
  const [spinsLeft, setSpinsLeft] = useState(isGuestMode ? Infinity : 3);

  const exchangeIcons = [
    '/images/bitcoin.jpg',
    '/images/ethereum.jpg',
    '/images/tether.jpg',
    '/images/binance-coin.jpg',
    '/images/toncoin.jpg',
    '/images/solana.jpg',
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

  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [showRank, setShowRank] = useState(false);

  useEffect(() => {
    if (!isGuestMode) {
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
                setSpinsLeft(data.spins_left);
                setLastSpinTime(data.last_spin_time);
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
    } else {
      setUsername('游客');
      setPoints(0);
      setUsdt(0);
    }
  }, [isGuestMode]);

  useEffect(() => {
    const loadAudio = () => {
      const newAudio = new Audio('/sounds/spin.mp3');
      newAudio.load();
      newAudio.addEventListener('canplaythrough', () => {
        console.log('音频加载成功');
        setAudio(newAudio);
      });
      newAudio.addEventListener('error', (e) => {
        console.error('音频加载失败:', e);
      });
    };

    loadAudio();

    return () => {
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    };
  }, []);

  useEffect(() => {
    const loadImages = async () => {
      const imagePromises = exchangeIcons.map((icon) => {
        return new Promise((resolve, reject) => {
          if (typeof Image !== 'undefined') {
            const img = new (Image as any)(60, 60);
            img.onload = () => resolve(icon);
            img.onerror = reject;
            img.src = icon;
          } else {
            // 在服务器端，直接解析 Promise
            resolve(icon);
          }
        });
      });

      try {
        await Promise.all(imagePromises);
        setImagesLoaded(true);
      } catch (error) {
        console.error("Failed to load some images:", error);
        // 即使有些图片加载失败，我们也设置为 true，以便显示已加载的图片
        setImagesLoaded(true);
      }
    };

    loadImages();
  }, []);

  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;
    if (tg && tg.initDataUnsafe?.user) {
      setTgId(tg.initDataUnsafe.user.id);
      console.log("tgId set:", tg.initDataUnsafe.user.id);
    } else {
      console.log("Telegram WebApp or user data not available");
    }
  }, []);

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (audio) {
      audio.muted = !isMuted;
    }
  };

  const isFreeSpinAvailable = () => {
    if (lastSpinTime === null) {
      console.log("Free spin available: No last spin time");
      return true;
    }
    const now = new Date().getTime();
    const timeSinceLastSpin = now - lastSpinTime;
    const isFree = timeSinceLastSpin >= 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    console.log("Free spin check:", { lastSpinTime, timeSinceLastSpin, isFree });
    return isFree;
  };

  const spinSlot = (index: number, finalPosition: number, duration: number) => {
    const ref = slotRefs[index];
    if (ref.current) {
      const totalHeight = exchangeIcons.length * 100; // 总高度
      const initialOffset = -3 * totalHeight; // 初始位置设置为3倍总高度，确保有足够的空间从上往下转动
      const finalOffset = -finalPosition * 100; // 最终位置
      
      // 设置初始位置
      ref.current.style.transition = 'none';
      ref.current.style.transform = `translateY(${initialOffset}px)`;
      
      // 强制重绘
      ref.current.offsetHeight;
      
      // 开始动画
      ref.current.style.transition = `transform ${duration}s cubic-bezier(0.25, 0.1, 0.25, 1)`;
      ref.current.style.transform = `translateY(${finalOffset}px)`;
    }
  };

  const handleSpin = async () => {
    console.log("handleSpin called");
    console.log("Current state:", { isGuestMode, spinsLeft, isFreeSpinAvailable: isFreeSpinAvailable(), isSpinning, tgId });

    if ((isGuestMode || spinsLeft > 0 || isFreeSpinAvailable()) && !isSpinning) {
      try {
        console.log("Spin conditions met, starting spin");
        setIsSpinning(true);
        if (!isMuted && audio) {
          try {
            await audio.play();
            console.log("音频播放成功");
          } catch (error) {
            console.error("音频播放失败:", error);
          }
        }

        // 根据概率生成结果
        const result = generateSpinResult();
        console.log("Spin result:", result);
        
        // 同时开始所有槽位的旋转，增加转动时间
        spinSlot(0, result[0], 4);
        spinSlot(1, result[1], 4.5);
        spinSlot(2, result[2], 5);

        setTimeout(() => {
          setIsSpinning(false);
          setFinalPositions(result);
          if (!isGuestMode) {
            checkWinning(result);
          }
        }, 5000); // 增加等待时间，与最长的转动时间一致

        if (!isGuestMode) {
          console.log("Sending spin request to server");
          const response = await fetch('/api/user/spin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tgId }),
          });
          console.log("Received response from server:", response.status);
          if (!response.ok) throw new Error('Spin request failed');
          const data = await response.json();
          console.log("Spin response data:", data);
          setSpinsLeft(data.spinsLeft);
          setLastSpinTime(data.lastSpinTime);
        }
      } catch (error) {
        console.error("Error during spin:", error);
        setIsSpinning(false);
        alert(t('spinError'));
      }
    } else {
      console.log("Spin conditions not met:", { isGuestMode, spinsLeft, isFreeSpinAvailable: isFreeSpinAvailable(), isSpinning, tgId });
    }
  };

  const generateSpinResult = () => {
    const random = Math.random();
    if (random < 0.01) return [0, 0, 0]; // Bitcoin
    if (random < 0.03) return [1, 1, 1]; // Ethereum
    if (random < 0.06) return [2, 2, 2]; // Tether
    if (random < 0.10) return [3, 3, 3]; // Binance Coin
    if (random < 0.15) return [4, 4, 4]; // Toncoin
    if (random < 0.20) return [5, 5, 5]; // Solana
    
    // 如果没有中奖，随机生成不同的图标
    return Array(3).fill(0).map(() => Math.floor(Math.random() * exchangeIcons.length));
  };

  const checkWinning = (positions: number[]) => {
    if (positions[0] === positions[1] && positions[1] === positions[2]) {
      const iconName = exchangeIcons[positions[0]].split('/').pop()?.split('.')[0] || '';
      handleWinning(iconName);
    }
  };

  const handleWinning = async (iconName: string) => {
    if (isGuestMode) {
      setWinAnimation('big');
      setWinAmount(t('guestModeWin'));
      setTimeout(() => {
        setWinAnimation(null);
        setWinAmount('');
      }, 3000);
    } else {
      const rewardProbabilities = {
        'bitcoin': { maxUsdt: 1, maxPoints: 1000 },
        'ethereum': { maxUsdt: 0.9, maxPoints: 900 },
        'tether': { maxUsdt: 0.8, maxPoints: 800 },
        'binance-coin': { maxUsdt: 0.7, maxPoints: 700 },
        'toncoin': { maxUsdt: 0.6, maxPoints: 600 },
        'solana': { maxUsdt: 0.5, maxPoints: 500 },
      };

      const reward = rewardProbabilities[iconName as keyof typeof rewardProbabilities] || 
                     { maxUsdt: 0.1, maxPoints: 100 };

      const usdtWon = parseFloat((Math.random() * (reward.maxUsdt - 0.1) + 0.1).toFixed(2));
      const pointsWon = Math.floor(Math.random() * (reward.maxPoints - 100) + 100);

      try {
        console.log('准备发送获胜请求:', { tgId, usdtWon, pointsWon });
        const response = await fetch('/api/user/win', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tgId, usdtWon, pointsWon }),
        });
        console.log('收到响应状态:', response.status);
        const data = await response.json();
        console.log('收到响应数据:', data);
        
        if (!response.ok) {
          throw new Error(data.message || '更新用户数据失败');
        }
        
        console.log('更新用户数据成功，新的积分和USDT:', data.newPoints, data.newUsdt);
        setPoints(data.newPoints);
        setUsdt(data.newUsdt);
        
        setWinAnimation('big');
        setWinAmount(`🎟️ ${pointsWon} ${t('slotMachine.points')} & 💰 ${usdtWon.toFixed(2)} ${t('slotMachine.usdt')}`);

        setTimeout(() => {
          setWinAnimation(null);
          setWinAmount('');
        }, 3000);
      } catch (error) {
        console.error("更新获胜时出错:", error);
        alert(t('updateWinError') + ': ' + (error instanceof Error ? error.message : String(error)));
      }
    }
  };

  const handleInvite = () => {
    if (tgId) {
      const inviteLink = `${window.location.origin}?ref=${tgId}`;
      navigator.clipboard.writeText(inviteLink);
      alert('邀请链接已复制！');
    } else {
      alert('无法生成邀请链接，请确保已登录。');
    }
  };

  const renderSlotIcons = () => {
    if (!imagesLoaded) {
      return (
        <div className="flex justify-center gap-2 bg-gray-800 rounded-lg p-4 shadow-inner">
          {[0, 1, 2].map((slotIndex) => (
            <div key={slotIndex} className="w-24 h-24 bg-white rounded-md overflow-hidden relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <FaSpinner className="animate-spin text-4xl text-gray-400" />
              </div>
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="flex justify-center gap-2 bg-gray-800 rounded-lg p-4 shadow-inner">
        {[0, 1, 2].map((slotIndex) => (
          <div key={slotIndex} className="w-24 h-24 bg-white rounded-md overflow-hidden relative">
            <div
              ref={slotRefs[slotIndex]}
              className="absolute top-0 left-0 w-full transition-transform duration-1000 ease-in-out"
              style={{
                transform: `translateY(${finalPositions[slotIndex] * -100}px)`,
              }}
            >
              {[...Array(exchangeIcons.length * 3)].map((_, index) => (
                <div key={index} className="w-24 h-24 flex items-center justify-center flex-shrink-0">
                  <Image
                    src={exchangeIcons[index % exchangeIcons.length]}
                    alt={`Exchange Icon ${index + 1}`}
                    width={60}
                    height={60}
                    className="object-contain w-16 h-16"
                    priority={index < exchangeIcons.length}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center p-4 bg-gradient-to-b from-indigo-900 to-purple-900 min-h-screen">
      {/* 用户信息 */}
      <div className="flex items-center space-x-4 mb-4 bg-white bg-opacity-20 p-3 rounded-lg shadow-lg w-full max-w-md">
        <div className="flex-shrink-0">
          {isGuestMode ? (
            <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center text-xl font-bold">
              G
            </div>
          ) : (
            userPhotoUrl ? (
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
            )
          )}
        </div>
        <div className="flex-grow">
          <p className="text-white font-semibold">{username || t('loading')}</p>
          {!isGuestMode && (
            <>
              <p className="text-sm text-gray-300">{t('slotMachine.points')}: {points}</p>
              <p className="text-sm text-gray-300">{t('slotMachine.usdt')}: {usdt}</p>
            </>
          )}
          {isGuestMode && (
            <p className="text-sm text-gray-300">{t('guestModeNotice')}</p>
          )}
        </div>
      </div>

      {/* 老虎机界面 */}
      <div className="relative w-full max-w-sm mx-auto p-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg shadow-2xl">
        {/* 声音按钮 */}
        <button
          onClick={toggleMute}
          className="absolute top-2 right-2 text-white bg-purple-600 hover:bg-purple-700 rounded-full p-1.5 transition-colors duration-200 shadow-lg z-10 focus:outline-none focus:ring-2 focus:ring-purple-400"
          aria-label={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? <IoVolumeMute className="w-5 h-5" /> : <IoVolumeHigh className="w-5 h-5" />}
        </button>

        {/* 老虎机图标 */}
        {renderSlotIcons()}

        {/* 旋转钮 */}
        <button
          onClick={handleSpin}
          disabled={isSpinning || (!isGuestMode && !isFreeSpinAvailable() && spinsLeft === 0)}
          className={`mt-4 w-full py-3 rounded-full text-white font-bold text-lg ${
            isSpinning || (!isGuestMode && !isFreeSpinAvailable() && spinsLeft === 0)
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-yellow-500 hover:bg-yellow-600 animate-pulse'
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
              console.log("Auto spin clicked");
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

      {/* 添加排行榜按钮 */}
      <button
        onClick={() => setShowRank(true)}
        className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        {t('rank.title')}
      </button>

      {/* 显示排行榜 */}
      {showRank && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <Rank tgId={tgId} />
            <button
              onClick={() => setShowRank(false)}
              className="mt-4 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            >
              {t('slotMachine.close')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SlotMachine;