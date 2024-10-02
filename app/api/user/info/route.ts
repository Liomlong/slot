import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tgId = searchParams.get('tgId');

  if (!tgId) {
    return NextResponse.json({ error: 'tgId is required' }, { status: 400 });
  }

  try {
    const res = await pool.query('SELECT points, usdt_balance, spins_left, last_spin_time, username FROM users WHERE tg_id = $1', [tgId]);
    if (res.rows.length === 0) {
      // 如果用户不存在，创建新用户
      const newUser = await pool.query(
        'INSERT INTO users (tg_id, points, usdt_balance, spins_left) VALUES ($1, 0, 0, 3) RETURNING points, usdt_balance, spins_left, last_spin_time, username',
        [tgId]
      );
      return NextResponse.json(newUser.rows[0]);
    }
    const { points, usdt_balance, spins_left, last_spin_time, username } = res.rows[0];
    return NextResponse.json({ points, usdtBalance: usdt_balance, spinsLeft: spins_left, lastSpinTime: last_spin_time, username });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}