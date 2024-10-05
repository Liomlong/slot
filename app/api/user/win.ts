import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request: Request) {
  const { tgId, usdtWon, pointsWon } = await request.json();
  console.log('收到请求:', { tgId, usdtWon, pointsWon });

  if (!tgId || typeof usdtWon !== 'number' || typeof pointsWon !== 'number') {
    console.log('无效的请求数据');
    return NextResponse.json({ message: '无效的请求数据' }, { status: 400 });
  }

  try {
    const client = await pool.connect();
    console.log('数据库连接成功');
    try {
      await client.query('BEGIN');
      console.log('开始事务');

      const result = await client.query(
        'UPDATE users SET points = points + $1, usdt = usdt + $2 WHERE tg_id = $3 RETURNING points, usdt',
        [pointsWon, usdtWon, tgId]
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
        newUsdt: updatedUser.usdt
      });
    } catch (error) {
      console.error('数据库操作出错:', error);
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
      console.log('数据库连接已释放');
    }
  } catch (error) {
    console.error('更新用户数据时出错:', error);
    return NextResponse.json({ message: '服务器内部错误' }, { status: 500 });
  }
}