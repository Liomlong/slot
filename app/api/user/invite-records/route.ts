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
      `SELECT u.username as invitee_username, i.created_at as invited_at
       FROM invitations i
       JOIN users u ON i.invitee_id = u.tg_id
       WHERE i.inviter_id = $1
       ORDER BY i.created_at DESC
       LIMIT 10`,
      [tgId]
    );

    return NextResponse.json({ records: result.rows });
  } catch (error) {
    console.error('Error fetching invite records:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  } finally {
    if (client) client.release();
  }
}