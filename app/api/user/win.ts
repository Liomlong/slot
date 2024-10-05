import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request: Request) {
  const { tgId, usdtWon, pointsWon } = await request.json();

  if (!tgId || typeof usdtWon !== 'number' || typeof pointsWon !== 'number') {
    return NextResponse.json({ message: '无效的请求数据' }, { status: 400 });
  }

  try {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const result = await client.query(
        'UPDATE users SET points = points + $1, usdt = usdt + $2 WHERE tg_id = $3 RETURNING points, usdt',
        [pointsWon, usdtWon, tgId]
      );

      if (result.rows.length === 0) {
        await client.query('ROLLBACK');
        return NextResponse.json({ message: '用户未找到' }, { status: 404 });
      }

      await client.query('COMMIT');

      const updatedUser = result.rows[0];
      return NextResponse.json({ 
        newPoints: updatedUser.points,
        newUsdt: updatedUser.usdt
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('更新用户数据时出错:', error);
    return NextResponse.json({ message: '服务器内部错误' }, { status: 500 });
  }
}