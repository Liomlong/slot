import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request: Request) {
  const { tgId } = await request.json();

  try {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      await client.query(
        'INSERT INTO users (tg_id, points, spins_left) VALUES ($1, 1000, 5) ON CONFLICT (tg_id) DO UPDATE SET points = users.points + 1000, spins_left = users.spins_left + 5',
        [tgId]
      );

      await client.query('COMMIT');

      return NextResponse.json({ success: true });
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