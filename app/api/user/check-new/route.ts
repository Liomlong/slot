import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tgId = searchParams.get('tgId');

  if (!tgId) {
    return NextResponse.json({ error: 'tgId is required' }, { status: 400 });
  }

  try {
    const res = await pool.query('SELECT * FROM users WHERE tg_id = $1', [tgId]);
    const isNewUser = res.rows.length === 0;
    return NextResponse.json({ isNewUser });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}