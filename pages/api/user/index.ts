import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export default async function handler(req: NextResponse, res: NextResponse) {
  if (req.method === 'GET') {
    const { searchParams } = new URL(req.url as string);
    const tgId = searchParams.get('tgId');

    if (!tgId) {
      return NextResponse.json({ error: 'tgId is required' }, { status: 400 });
    }

    try {
      const result = await pool.query('SELECT points, usdt, spins_left, last_spin_time FROM users WHERE tg_id = $1', [tgId]);

      if (result.rows.length === 0) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      const user = result.rows[0];
      return NextResponse.json({
        points: user.points,
        usdt: user.usdt,
        spinsLeft: user.spins_left,
        lastSpinTime: user.last_spin_time,
      });
    } catch (error) {
      console.error('Error fetching user data:', error);
      return NextResponse.json({ error: 'Failed to fetch user data' }, { status: 500 });
    }
  } else {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
  }
}