import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tgId = searchParams.get('tgId');

  if (!tgId) {
    return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
  }

  let client;
  try {
    client = await pool.connect();
    
    const result = await client.query(
      'SELECT points, usdt FROM users WHERE tg_id = $1',
      [tgId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching balance:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  } finally {
    if (client) client.release();
  }
}