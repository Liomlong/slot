import React, { useEffect, useState } from 'react';
import { TelegramUser } from '../types';

declare global {
  interface Window {
    Telegram: {
      WebApp: {
        initData: string;
        initDataUnsafe: TelegramUser;
      };
    };
  }
}

function UserInfo() {
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        // 获取 Telegram WebApp 提供的用户信息
        const tgUser = window.Telegram.WebApp.initDataUnsafe;
        
        // 发送用户信息到后端进行验证
        const response = await fetch('/api/verify-user', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            initData: window.Telegram.WebApp.initData,
            user: tgUser 
          }),
        });

        if (!response.ok) {
          throw new Error('验证失败');
        }

        const data = await response.json();
        setUser(data.user);
      } catch (error) {
        console.error('获取用户信息失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, []);

  if (loading) {
    return <p>加载中...</p>;
  }

  if (!user) {
    return <p>无法获取用户信息</p>;
  }

  return (
    <div>
      <h2>欢迎, {user.first_name}!</h2>
      {/* 这里可以显示更多用户信息 */}
    </div>
  );
}

export default UserInfo;