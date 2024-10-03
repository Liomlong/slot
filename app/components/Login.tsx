import React, { useState } from 'react';
import { TelegramUser } from '../types'; // 修改这里

declare global {
  interface Window {
    TelegramLoginWidget: {
      dataOnauth: (user: TelegramUser) => void;
    };
  }
}

function Login() {
  const [loading, setLoading] = useState(false);

  const handleTelegramLogin = async (user: TelegramUser) => {
    setLoading(true);
    try {
      const response = await fetch('/api/telegram-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(user),
      });

      if (!response.ok) {
        throw new Error('登录失败');
      }

      const data = await response.json();
      console.log('登录成功', data);
      // 这里可以添加登录成功后的跳转或其他操作
    } catch (error) {
      console.error('Telegram登录失败:', error);
      // 这里可以添加错误提示给用户
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    window.TelegramLoginWidget = {
      dataOnauth: handleTelegramLogin
    };
  }, []);

  return (
    <div>
      <script async src="https://telegram.org/js/telegram-widget.js?22" data-telegram-login="YOUR_BOT_NAME" data-size="large" data-onauth="TelegramLoginWidget.dataOnauth(user)" data-request-access="write"></script>
      {loading ? <p>登录中...</p> : null}
    </div>
  );
}

export default Login;