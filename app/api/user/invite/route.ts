import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request: Request) {
  const { inviterId, inviteeId } = await request.json();

  if (!inviterId || !inviteeId) {
    return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
  }

  let client;
  try {
    client = await pool.connect();
    
    // 检查是否已经邀请过
    const checkResult = await client.query(
      'SELECT * FROM invitations WHERE inviter_id = $1 AND invitee_id = $2',
      [inviterId, inviteeId]
    );

    if (checkResult.rows.length > 0) {
      return NextResponse.json({ error: 'Invitation already processed' }, { status: 400 });
    }

    // 开始事务
    await client.query('BEGIN');

    // 记录邀请
    await client.query(
      'INSERT INTO invitations (inviter_id, invitee_id) VALUES ($1, $2)',
      [inviterId, inviteeId]
    );

    // 给邀请人增加5次抽奖机会
    const updateResult = await client.query(
      'UPDATE users SET spins_left = spins_left + 5 WHERE tg_id = $1 RETURNING spins_left',
      [inviterId]
    );

    await client.query('COMMIT');

    return NextResponse.json({ 
      success: true, 
      newSpinsLeft: updateResult.rows[0].spins_left 
    });
  } catch (error) {
    if (client) await client.query('ROLLBACK');
    console.error('Error processing invitation:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  } finally {
    if (client) client.release();
  }
}