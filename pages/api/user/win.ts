import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export default async function handler(req: NextResponse, res: NextResponse) {
  if (req.method === 'POST') {
    const { tgId, pointsWon, usdtWon } = await req.json();

    try {
      const result = await pool.query(
        'UPDATE users SET points = points + $1, usdt = usdt + $2 WHERE tg_id = $3 RETURNING points, usdt',
        [pointsWon, usdtWon, tgId]
      );

      const updatedUser = result.rows[0];
      return NextResponse.json({ newPoints: updatedUser.points, newUsdt: updatedUser.usdt });
    } catch (error) {
      console.error('Error updating user data:', error);
      return NextResponse.json({ error: 'Failed to update user data' }, { status: 500 });
    }
  } else {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
  }
}