import { NextApiRequest, NextApiResponse } from 'next';
import pool from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('Received win request:', req.body);

  if (req.method !== 'POST') {
    console.log('Method not allowed:', req.method);
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { tgId, usdtWon, pointsWon } = req.body;

  if (!tgId || typeof usdtWon !== 'number' || typeof pointsWon !== 'number') {
    console.log('Invalid request body:', req.body);
    return res.status(400).json({ message: 'Invalid request body' });
  }

  try {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      console.log('Transaction begun');

      const result = await client.query(
        'UPDATE users SET points = points + $1, usdt = usdt + $2 WHERE tg_id = $3 RETURNING points, usdt',
        [pointsWon, usdtWon, tgId]
      );
      console.log('Query result:', result.rows);

      if (result.rows.length === 0) {
        console.log('User not found:', tgId);
        await client.query('ROLLBACK');
        return res.status(404).json({ message: 'User not found' });
      }

      await client.query('COMMIT');
      console.log('Transaction committed');

      const updatedUser = result.rows[0];
      console.log('Sending response:', updatedUser);
      res.status(200).json({ 
        newPoints: updatedUser.points,
        newUsdt: updatedUser.usdt
      });
    } catch (error) {
      console.error('Error in transaction:', error);
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