import { NextApiRequest, NextApiResponse } from 'next';
import { TelegramUser } from '../types';
import crypto from 'crypto';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN; // 确保在环境变量中设置了这个值

function verifyTelegramWebAppData(initData: string): boolean {
  const urlParams = new URLSearchParams(initData);
  const hash = urlParams.get('hash');
  urlParams.delete('hash');
  urlParams.sort();

  let dataCheckString = '';
  for (const [key, value] of urlParams.entries()) {
    dataCheckString += `${key}=${value}\n`;
  }
  dataCheckString = dataCheckString.slice(0, -1);

  const secret = crypto.createHmac('sha256', 'WebAppData').update(BOT_TOKEN);
  const calculatedHash = crypto.createHmac('sha256', secret.digest()).update(dataCheckString).digest('hex');

  return calculatedHash === hash;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: '只允许 POST 请求' });
  }

  try {
    const { initData, user } = req.body;

    if (!verifyTelegramWebAppData(initData)) {
      return res.status(401).json({ message: '无效的用户数据' });
    }

    // 验证通过,可以在这里进行其他操作,比如在数据库中创建或更新用户

    res.status(200).json({ user });
  } catch (error) {
    console.error('用户验证失败:', error);
    res.status(500).json({ message: '验证处理失败' });
  }
}