import React, { useEffect, useState } from 'react';
import { TelegramUser } from '../types'; // 修改这里

declare global {
  interface Window {
    Telegram: {
      WebApp: {
        initDataUnsafe: {
          user?: TelegramUser;
        };
        ready: () => void;
        isExpanded: boolean;
        expand: () => void;
      };
    };
  }
}

function UserInfo() {
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initTelegramApp = () => {
      if (window.Telegram?.WebApp) {
        window.Telegram.WebApp.ready();
        
        if (!window.Telegram.WebApp.isExpanded) {
          window.Telegram.WebApp.expand();
        }

        const tgUser = window.Telegram.WebApp.initDataUnsafe.user;
        if (tgUser) {
          setUser(tgUser);
        } else {
          console.error('无法获取 Telegram 用户信息');
        }
      } else {
        console.error('Telegram WebApp 不可用');
      }
      setLoading(false);
    };

    // 确保 Telegram WebApp 已加载
    if (document.readyState === 'complete') {
      initTelegramApp();
    } else {
      window.addEventListener('load', initTelegramApp);
      return () => window.removeEventListener('load', initTelegramApp);
    }
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
      {user.username && <p>用户名: @{user.username}</p>}
      {user.language_code && <p>语言: {user.language_code}</p>}
      {/* 可以根据需要显示更多用户信息 */}
    </div>
  );
}

export default UserInfo;