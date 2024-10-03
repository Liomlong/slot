import { NextApiRequest, NextApiResponse } from 'next';
import { TelegramUser } from '../types';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: '只允许 POST 请求' });
  }

  try {
    const user: TelegramUser = req.body;

    // 这里添加验证 Telegram 用户数据的逻辑
    // 例如,检查 hash 是否有效,auth_date 是否在合理范围内等

    // 假设验证通过,我们可以在这里创建一个会话或者返回一个 token
    // 这里只是一个示例,实际实现可能会有所不同
    const token = 'some_generated_token';

    res.status(200).json({ token, user });
  } catch (error) {
    console.error('Telegram 登录处理失败:', error);
    res.status(500).json({ message: '登录处理失败' });
  }
}