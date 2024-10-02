import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request: Request) {
  const { tgId, isFreeSpin } = await request.json();

  try {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const now = new Date();
      if (isFreeSpin) {
        await client.query(
          'UPDATE users SET last_spin_time = $1 WHERE tg_id = $2',
          [now, tgId]
        );
      } else {
        await client.query(
          'UPDATE users SET spins_left = spins_left - 1, last_spin_time = $1 WHERE tg_id = $2 AND spins_left > 0',
          [now, tgId]
        );
      }

      const res = await client.query('SELECT spins_left FROM users WHERE tg_id = $1', [tgId]);
      const spinsLeft = res.rows[0].spins_left;

      await client.query('COMMIT');

      return NextResponse.json({ success: true, spinsLeft, lastSpinTime: now.getTime() });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}