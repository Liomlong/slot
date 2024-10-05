import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request: Request) {
  const { tgId, usdtWon, pointsWon } = await request.json();
  console.log('收到请求:', { tgId, usdtWon, pointsWon });

  if (!tgId || typeof usdtWon !== 'number' || typeof pointsWon !== 'number') {
    console.log('无效的请求数据');
    return NextResponse.json({ message: '无效的请求数据' }, { status: 400 });
  }

  // 将 USDT 转换为整数（以分为单位）
  const usdtWonCents = Math.round(usdtWon * 100);

  let client;
  try {
    client = await pool.connect();
    console.log('数据库连接成功');
    
    await client.query('BEGIN');
    console.log('开始事务');

    const result = await client.query(
      'UPDATE users SET points = points + $1, usdt = usdt + $2 WHERE tg_id = $3 RETURNING points, usdt',
      [pointsWon, usdtWonCents, tgId]
    );
    console.log('查询结果:', result.rows);

    if (result.rows.length === 0) {
      console.log('用户未找到');
      await client.query('ROLLBACK');
      return NextResponse.json({ message: '用户未找到' }, { status: 404 });
    }

    await client.query('COMMIT');
    console.log('事务提交成功');

    const updatedUser = result.rows[0];
    console.log('更新后的用户数据:', updatedUser);
    return NextResponse.json({ 
      newPoints: updatedUser.points,
      newUsdt: updatedUser.usdt / 100 // 将分转换回元
    });
  } catch (error) {
    console.error('更新用户数据时出错:', error);
    if (client) {
      await client.query('ROLLBACK');
    }
    return NextResponse.json({ message: '服务器内部错误', error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  } finally {
    if (client) {
      client.release();
      console.log('数据库连接已释放');
    }
  }
}