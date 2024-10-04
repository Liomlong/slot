import { NextApiRequest, NextApiResponse } from 'next';
import pool from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { tgId, usdtWon, pointsWon } = req.body;

  if (!tgId || typeof usdtWon !== 'number' || typeof pointsWon !== 'number') {
    return res.status(400).json({ message: 'Invalid request body' });
  }

  try {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const result = await client.query(
        'UPDATE users SET points = points + $1, usdt = usdt + $2 WHERE tg_id = $3 RETURNING points, usdt',
        [pointsWon, usdtWon, tgId]
      );

      if (result.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ message: 'User not found' });
      }

      await client.query('COMMIT');

      const updatedUser = result.rows[0];
      res.status(200).json({ 
        newPoints: updatedUser.points,
        newUsdt: updatedUser.usdt
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error updating user data:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}