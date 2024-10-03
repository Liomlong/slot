import { NextApiRequest, NextApiResponse } from 'next';
import pool from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { tgId } = req.query;

    if (!tgId || typeof tgId !== 'string') {
      return res.status(400).json({ error: 'tgId is required and must be a string' });
    }

    try {
      const result = await pool.query('SELECT points, usdt, spins_left, last_spin_time FROM users WHERE tg_id = $1', [tgId]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      const user = result.rows[0];
      return res.status(200).json({
        points: user.points,
        usdt: user.usdt,
        spinsLeft: user.spins_left,
        lastSpinTime: user.last_spin_time,
      });
    } catch (error) {
      console.error('Error fetching user data:', error);
      return res.status(500).json({ error: 'Failed to fetch user data' });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}