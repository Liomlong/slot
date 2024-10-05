import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: NextRequest) {
  const tgId = request.nextUrl.searchParams.get('tgId');

  if (!tgId) {
    return NextResponse.json({ error: 'tgId is required' }, { status: 400 });
  }

  let client;
  try {
    client = await pool.connect();

    // 获取用户排名和积分
    const userRankResult = await client.query(`
      SELECT rank, points
      FROM (
        SELECT tg_id, points, RANK() OVER (ORDER BY points DESC) as rank
        FROM users
      ) ranked
      WHERE tg_id = $1
    `, [tgId]);

    // 获取前100名用户
    const top100Result = await client.query(`
      SELECT username, points, RANK() OVER (ORDER BY points DESC) as rank
      FROM users
      ORDER BY points DESC
      LIMIT 100
    `);

    return NextResponse.json({
      userRank: userRankResult.rows[0] || null,
      top100: top100Result.rows
    });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  } finally {
    if (client) {
      client.release();
    }
  }
}