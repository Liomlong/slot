function Login() {
  // ... 其他代码 ...

  const handleTelegramLogin = async (user: TelegramUser) => {
    setLoading(true);
    try {
      // 这里应该有调用API进行Telegram登录的代码
      // 如果这部分缺失或有错误,可能导致一直显示加载中
    } catch (error) {
      console.error('Telegram登录失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // ... 其他代码 ...
}