import { NextApiRequest, NextApiResponse } from 'next';
import pool from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { tgId, pointsWon, usdtWon } = req.body;

    try {
      const result = await pool.query(
        'UPDATE users SET points = points + $1, usdt = usdt + $2 WHERE tg_id = $3 RETURNING points, usdt',
        [pointsWon, usdtWon, tgId]
      );

      const updatedUser = result.rows[0];
      return res.status(200).json({ newPoints: updatedUser.points, newUsdt: updatedUser.usdt });
    } catch (error) {
      console.error('Error updating user data:', error);
      return res.status(500).json({ error: 'Failed to update user data' });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}